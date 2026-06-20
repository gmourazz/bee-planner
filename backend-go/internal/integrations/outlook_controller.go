package integrations

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/config"
	"beeplanerofc/backend-go/internal/middleware"
)

const (
	microsoftTenant = "common"
	microsoftScopes = "Calendars.ReadWrite offline_access"
)

type OutlookController struct {
	db  *pgxpool.Pool
	env *config.Env
}

func NewOutlookController(db *pgxpool.Pool, env *config.Env) *OutlookController {
	return &OutlookController{db: db, env: env}
}

func (ctrl *OutlookController) redirectURI() string {
	return ctrl.env.BackendURL + "/api/integrations/outlook/callback"
}

// GET /api/integrations/outlook/connect — retorna a URL de autorização da Microsoft
func (ctrl *OutlookController) Connect(c *gin.Context) {
	if ctrl.env.MicrosoftClientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "MICROSOFT_CLIENT_ID não configurado no servidor"})
		return
	}

	user := middleware.CurrentUser(c)
	state := base64.StdEncoding.EncodeToString([]byte(user.ID))

	authURL := "https://login.microsoftonline.com/" + microsoftTenant + "/oauth2/v2.0/authorize?" + url.Values{
		"client_id":     {ctrl.env.MicrosoftClientID},
		"redirect_uri":  {ctrl.redirectURI()},
		"response_type": {"code"},
		"scope":         {microsoftScopes},
		"response_mode": {"query"},
		"state":         {state},
	}.Encode()

	c.JSON(http.StatusOK, gin.H{"url": authURL})
}

type microsoftTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

// GET /api/integrations/outlook/callback — callback público da Microsoft
func (ctrl *OutlookController) Callback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	oauthError := c.Query("error")

	if oauthError != "" || code == "" || state == "" {
		c.Redirect(http.StatusFound, ctrl.env.FrontendURL+"/datas?integration=outlook&status=error")
		return
	}

	stateBytes, err := base64.StdEncoding.DecodeString(state)
	if err != nil {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("outlook", ctrl.env.FrontendURL)))
		return
	}
	userID := string(stateBytes)

	tokenResp, err := http.PostForm(
		"https://login.microsoftonline.com/"+microsoftTenant+"/oauth2/v2.0/token", url.Values{
			"code":          {code},
			"client_id":     {ctrl.env.MicrosoftClientID},
			"client_secret": {ctrl.env.MicrosoftClientSecret},
			"redirect_uri":  {ctrl.redirectURI()},
			"grant_type":    {"authorization_code"},
			"scope":         {microsoftScopes},
		},
	)
	if err != nil {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("outlook", ctrl.env.FrontendURL)))
		return
	}
	defer tokenResp.Body.Close()

	var tokens microsoftTokenResponse
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokens); err != nil || tokens.AccessToken == "" {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("outlook", ctrl.env.FrontendURL)))
		return
	}

	expiry := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second)

	ctrl.db.Exec(c.Request.Context(), `
		INSERT INTO calendar_integrations (user_id, outlook_access_token, outlook_refresh_token, outlook_token_expiry, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			outlook_access_token  = EXCLUDED.outlook_access_token,
			outlook_refresh_token = EXCLUDED.outlook_refresh_token,
			outlook_token_expiry  = EXCLUDED.outlook_token_expiry,
			updated_at            = NOW()`,
		userID, tokens.AccessToken, nullableString(tokens.RefreshToken), expiry,
	)

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthSuccessPage("outlook", ctrl.env.FrontendURL)))
}

// DELETE /api/integrations/outlook — desconecta o Outlook
func (ctrl *OutlookController) Disconnect(c *gin.Context) {
	user := middleware.CurrentUser(c)

	ctrl.db.Exec(c.Request.Context(), `
		UPDATE calendar_integrations SET
			outlook_access_token = NULL, outlook_refresh_token = NULL, outlook_token_expiry = NULL, updated_at = NOW()
		WHERE user_id = $1`, user.ID,
	)

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

type criarEventoOutlookRequest struct {
	Title string `json:"title"`
	Date  string `json:"date"`
	Type  string `json:"type"`
}

// POST /api/integrations/outlook/events — cria um evento no Outlook Calendar do usuário
func (ctrl *OutlookController) CreateEvent(c *gin.Context) {
	ctx := c.Request.Context()
	user := middleware.CurrentUser(c)

	var req criarEventoOutlookRequest
	c.ShouldBindJSON(&req)

	integ, err := getIntegration(ctx, ctrl.db, user.ID)
	if err != nil || integ.OutlookAccessToken == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Outlook não conectado"})
		return
	}

	startDate, parseErr := time.Parse("2006-01-02", req.Date)
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida"})
		return
	}
	startDt := req.Date + "T00:00:00"
	endDt := startDate.AddDate(0, 0, 1).Format("2006-01-02") + "T00:00:00"

	body, _ := json.Marshal(gin.H{
		"subject":  "[BeePlanner] " + req.Title,
		"body":     gin.H{"contentType": "text", "content": "Categoria: " + req.Type},
		"start":    gin.H{"dateTime": startDt, "timeZone": "UTC"},
		"end":      gin.H{"dateTime": endDt, "timeZone": "UTC"},
		"isAllDay": true,
	})

	graphReq, _ := http.NewRequest(http.MethodPost, "https://graph.microsoft.com/v1.0/me/events", bytes.NewReader(body))
	graphReq.Header.Set("Authorization", "Bearer "+*integ.OutlookAccessToken)
	graphReq.Header.Set("Content-Type", "application/json")

	graphResp, err := http.DefaultClient.Do(graphReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento no Outlook"})
		return
	}
	defer graphResp.Body.Close()

	if graphResp.StatusCode >= 400 {
		var errBody struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		json.NewDecoder(graphResp.Body).Decode(&errBody)
		msg := errBody.Error.Message
		if msg == "" {
			msg = "Erro ao criar evento no Outlook"
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
