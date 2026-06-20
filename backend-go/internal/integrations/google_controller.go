package integrations

import (
	"encoding/base64"
	"encoding/json"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/config"
	"beeplanerofc/backend-go/internal/middleware"
)

const googleScopes = "https://www.googleapis.com/auth/calendar"

type GoogleController struct {
	db  *pgxpool.Pool
	env *config.Env
}

func NewGoogleController(db *pgxpool.Pool, env *config.Env) *GoogleController {
	return &GoogleController{db: db, env: env}
}

func (ctrl *GoogleController) redirectURI() string {
	return ctrl.env.BackendURL + "/api/integrations/google/callback"
}

// GET /api/integrations/google/connect — retorna a URL de autorização do Google OAuth
func (ctrl *GoogleController) Connect(c *gin.Context) {
	if ctrl.env.GoogleClientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GOOGLE_CLIENT_ID não configurado no servidor"})
		return
	}

	user := middleware.CurrentUser(c)
	state := base64.StdEncoding.EncodeToString([]byte(user.ID))

	authURL := "https://accounts.google.com/o/oauth2/v2/auth?" + url.Values{
		"client_id":     {ctrl.env.GoogleClientID},
		"redirect_uri":  {ctrl.redirectURI()},
		"response_type": {"code"},
		"scope":         {googleScopes},
		"access_type":   {"offline"},
		"prompt":        {"consent"},
		"state":         {state},
	}.Encode()

	c.JSON(http.StatusOK, gin.H{"url": authURL})
}

type googleTokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

// GET /api/integrations/google/callback — callback público do Google OAuth
func (ctrl *GoogleController) Callback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	oauthError := c.Query("error")

	if oauthError != "" || code == "" || state == "" {
		c.Redirect(http.StatusFound, ctrl.env.FrontendURL+"/datas?integration=google&status=error")
		return
	}

	stateBytes, err := base64.StdEncoding.DecodeString(state)
	if err != nil {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("google", ctrl.env.FrontendURL)))
		return
	}
	userID := string(stateBytes)

	tokenResp, err := http.PostForm("https://oauth2.googleapis.com/token", url.Values{
		"code":          {code},
		"client_id":     {ctrl.env.GoogleClientID},
		"client_secret": {ctrl.env.GoogleClientSecret},
		"redirect_uri":  {ctrl.redirectURI()},
		"grant_type":    {"authorization_code"},
	})
	if err != nil {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("google", ctrl.env.FrontendURL)))
		return
	}
	defer tokenResp.Body.Close()

	var tokens googleTokenResponse
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokens); err != nil || tokens.AccessToken == "" {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("google", ctrl.env.FrontendURL)))
		return
	}

	expiry := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second)

	_, err = ctrl.db.Exec(c.Request.Context(), `
		INSERT INTO calendar_integrations (user_id, google_access_token, google_refresh_token, google_token_expiry, updated_at)
		VALUES ($1, $2, $3, $4, NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			google_access_token  = EXCLUDED.google_access_token,
			google_refresh_token = EXCLUDED.google_refresh_token,
			google_token_expiry  = EXCLUDED.google_token_expiry,
			updated_at           = NOW()`,
		userID, tokens.AccessToken, nullableString(tokens.RefreshToken), expiry,
	)
	if err != nil {
		c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthErrorPage("google", ctrl.env.FrontendURL)))
		return
	}

	c.Data(http.StatusOK, "text/html; charset=utf-8", []byte(oauthSuccessPage("google", ctrl.env.FrontendURL)))
}

// DELETE /api/integrations/google — desconecta a integração com Google
func (ctrl *GoogleController) Disconnect(c *gin.Context) {
	user := middleware.CurrentUser(c)

	ctrl.db.Exec(c.Request.Context(), `
		UPDATE calendar_integrations SET
			google_access_token = NULL, google_refresh_token = NULL, google_token_expiry = NULL, updated_at = NOW()
		WHERE user_id = $1`, user.ID,
	)

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// getValidToken renova o token do Google se estiver expirado (ou perto disso)
func (ctrl *GoogleController) getValidToken(c *gin.Context, integ *calendarIntegration, userID string) string {
	accessToken := ""
	if integ.GoogleAccessToken != nil {
		accessToken = *integ.GoogleAccessToken
	}

	isExpired := integ.GoogleTokenExpiry != nil && integ.GoogleTokenExpiry.Before(time.Now().Add(60*time.Second))
	if !isExpired || integ.GoogleRefreshToken == nil {
		return accessToken
	}

	tokenResp, err := http.PostForm("https://oauth2.googleapis.com/token", url.Values{
		"client_id":     {ctrl.env.GoogleClientID},
		"client_secret": {ctrl.env.GoogleClientSecret},
		"refresh_token": {*integ.GoogleRefreshToken},
		"grant_type":    {"refresh_token"},
	})
	if err != nil {
		return accessToken
	}
	defer tokenResp.Body.Close()

	var tokens googleTokenResponse
	if err := json.NewDecoder(tokenResp.Body).Decode(&tokens); err != nil || tokens.AccessToken == "" {
		return accessToken
	}

	newExpiry := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second)
	ctrl.db.Exec(c.Request.Context(), `
		UPDATE calendar_integrations SET google_access_token = $1, google_token_expiry = $2, updated_at = NOW()
		WHERE user_id = $3`, tokens.AccessToken, newExpiry, userID,
	)

	return tokens.AccessToken
}

type googleCalendarListResponse struct {
	Items []struct {
		ID string `json:"id"`
	} `json:"items"`
}

type googleEvent struct {
	ID      string `json:"id"`
	Summary string `json:"summary"`
	Start   struct {
		Date     string `json:"date"`
		DateTime string `json:"dateTime"`
	} `json:"start"`
}

type googleEventsResponse struct {
	Items []googleEvent `json:"items"`
}

// GET /api/integrations/google/events — lista eventos do Google Calendar (30 dias atrás, 90 pra frente)
func (ctrl *GoogleController) ListEvents(c *gin.Context) {
	ctx := c.Request.Context()
	user := middleware.CurrentUser(c)

	integ, err := getIntegration(ctx, ctrl.db, user.ID)
	if err != nil || integ.GoogleAccessToken == nil {
		c.JSON(http.StatusOK, []gin.H{})
		return
	}

	accessToken := ctrl.getValidToken(c, integ, user.ID)

	timeMin := time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
	timeMax := time.Now().AddDate(0, 0, 90).Format(time.RFC3339)
	params := "timeMin=" + url.QueryEscape(timeMin) + "&timeMax=" + url.QueryEscape(timeMax) +
		"&singleEvents=true&orderBy=startTime&maxResults=250"

	calendarIDs := []string{"primary"}
	req, _ := http.NewRequest(http.MethodGet,
		"https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader", nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)
	if listResp, err := http.DefaultClient.Do(req); err == nil {
		defer listResp.Body.Close()
		if listResp.StatusCode < 400 {
			var listData googleCalendarListResponse
			if json.NewDecoder(listResp.Body).Decode(&listData) == nil && len(listData.Items) > 0 {
				calendarIDs = make([]string, len(listData.Items))
				for i, item := range listData.Items {
					calendarIDs[i] = item.ID
				}
			}
		}
	}

	allEvents := make([][]googleEvent, len(calendarIDs))
	var wg sync.WaitGroup
	for i, calID := range calendarIDs {
		wg.Add(1)
		go func(i int, calID string) {
			defer wg.Done()
			req, _ := http.NewRequest(http.MethodGet,
				"https://www.googleapis.com/calendar/v3/calendars/"+url.PathEscape(calID)+"/events?"+params, nil)
			req.Header.Set("Authorization", "Bearer "+accessToken)
			resp, err := http.DefaultClient.Do(req)
			if err != nil {
				return
			}
			defer resp.Body.Close()
			if resp.StatusCode >= 400 {
				return
			}
			var eventsData googleEventsResponse
			if json.NewDecoder(resp.Body).Decode(&eventsData) == nil {
				allEvents[i] = eventsData.Items
			}
		}(i, calID)
	}
	wg.Wait()

	seen := map[string]bool{}
	result := []gin.H{}
	for _, events := range allEvents {
		for _, e := range events {
			if e.Start.Date == "" && e.Start.DateTime == "" {
				continue
			}
			if seen[e.ID] {
				continue
			}
			seen[e.ID] = true
			if strings.HasPrefix(e.Summary, "[BeePlanner]") {
				continue
			}

			date := e.Start.Date
			if date == "" {
				date = strings.SplitN(e.Start.DateTime, "T", 2)[0]
			}
			title := e.Summary
			if title == "" {
				title = "(sem título)"
			}

			result = append(result, gin.H{
				"id":     "google_" + e.ID,
				"title":  title,
				"date":   date,
				"type":   "Google Agenda",
				"source": "google",
			})
		}
	}

	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, result)
}

type criarEventoGoogleRequest struct {
	Title string `json:"title"`
	Date  string `json:"date"`
	Type  string `json:"type"`
}

// POST /api/integrations/google/events — cria um evento no Google Calendar do usuário
func (ctrl *GoogleController) CreateEvent(c *gin.Context) {
	ctx := c.Request.Context()
	user := middleware.CurrentUser(c)

	var req criarEventoGoogleRequest
	c.ShouldBindJSON(&req)

	integ, err := getIntegration(ctx, ctrl.db, user.ID)
	if err != nil || integ.GoogleAccessToken == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google Calendar não conectado"})
		return
	}

	accessToken := ctrl.getValidToken(c, integ, user.ID)

	startDate, parseErr := time.Parse("2006-01-02", req.Date)
	if parseErr != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida"})
		return
	}
	endDate := startDate.AddDate(0, 0, 1).Format("2006-01-02")

	body, _ := json.Marshal(gin.H{
		"summary":     "[BeePlanner] " + req.Title,
		"description": "Categoria: " + req.Type,
		"start":       gin.H{"date": req.Date},
		"end":         gin.H{"date": endDate},
	})

	gcalReq, _ := http.NewRequest(http.MethodPost,
		"https://www.googleapis.com/calendar/v3/calendars/primary/events", strings.NewReader(string(body)))
	gcalReq.Header.Set("Authorization", "Bearer "+accessToken)
	gcalReq.Header.Set("Content-Type", "application/json")

	gcalResp, err := http.DefaultClient.Do(gcalReq)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento no Google"})
		return
	}
	defer gcalResp.Body.Close()

	if gcalResp.StatusCode >= 400 {
		var errBody struct {
			Error struct {
				Message string `json:"message"`
			} `json:"error"`
		}
		json.NewDecoder(gcalResp.Body).Decode(&errBody)
		msg := errBody.Error.Message
		if msg == "" {
			msg = "Erro ao criar evento no Google"
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": msg})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

func nullableString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
