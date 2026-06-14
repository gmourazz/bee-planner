package handlers

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

func frontendURL() string {
	if v := os.Getenv("FRONTEND_URL"); v != "" {
		return v
	}
	return "http://localhost:5173"
}

func backendURL() string {
	if v := os.Getenv("BACKEND_URL"); v != "" {
		return v
	}
	return "http://localhost:3001"
}

// ── Status das integrações ───────────────────────────────────────────────────

// GET /api/integrations/status
func IntegrationStatus(c *gin.Context) {
	user := middleware.GetUser(c)

	body, _, _ := config.Supabase.From("calendar_integrations").
		Select("google_access_token,outlook_access_token").Eq("user_id", user.ID).Get()

	var rows []map[string]any
	json.Unmarshal(body, &rows)

	if len(rows) == 0 {
		c.JSON(http.StatusOK, gin.H{"google": false, "outlook": false})
		return
	}
	d := rows[0]
	c.JSON(http.StatusOK, gin.H{
		"google":  d["google_access_token"] != nil && d["google_access_token"] != "",
		"outlook": d["outlook_access_token"] != nil && d["outlook_access_token"] != "",
	})
}

// ── Google Calendar ──────────────────────────────────────────────────────────

// GET /api/integrations/google/connect
func GoogleConnect(c *gin.Context) {
	user := middleware.GetUser(c)
	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	if clientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "GOOGLE_CLIENT_ID não configurado"})
		return
	}

	state := base64.StdEncoding.EncodeToString([]byte(user.ID))
	redirectURI := backendURL() + "/api/integrations/google/callback"

	u, _ := url.Parse("https://accounts.google.com/o/oauth2/v2/auth")
	q := u.Query()
	q.Set("client_id", clientID)
	q.Set("redirect_uri", redirectURI)
	q.Set("response_type", "code")
	q.Set("scope", "https://www.googleapis.com/auth/calendar")
	q.Set("access_type", "offline")
	q.Set("prompt", "consent")
	q.Set("state", state)
	u.RawQuery = q.Encode()

	c.JSON(http.StatusOK, gin.H{"url": u.String()})
}

// GET /api/integrations/google/callback
func GoogleCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	oauthErr := c.Query("error")
	fURL := frontendURL()

	if oauthErr != "" || code == "" || state == "" {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("google", fURL)))
		return
	}

	userIDBytes, err := base64.StdEncoding.DecodeString(state)
	if err != nil {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("google", fURL)))
		return
	}
	userID := string(userIDBytes)

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")
	redirectURI := backendURL() + "/api/integrations/google/callback"

	// Troca o code por tokens
	form := url.Values{}
	form.Set("code", code)
	form.Set("client_id", clientID)
	form.Set("client_secret", clientSecret)
	form.Set("redirect_uri", redirectURI)
	form.Set("grant_type", "authorization_code")

	tokenResp, err := http.Post(
		"https://oauth2.googleapis.com/token",
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("google", fURL)))
		return
	}
	defer tokenResp.Body.Close()

	var tokens struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
	}
	json.NewDecoder(tokenResp.Body).Decode(&tokens)

	if tokens.AccessToken == "" {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("google", fURL)))
		return
	}

	expiry := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second).UTC().Format(time.RFC3339)

	payload := map[string]any{
		"user_id":             userID,
		"google_access_token": tokens.AccessToken,
		"google_token_expiry": expiry,
		"updated_at":          time.Now().UTC().Format(time.RFC3339),
	}
	if tokens.RefreshToken != "" {
		payload["google_refresh_token"] = tokens.RefreshToken
	}

	config.Supabase.Upsert("calendar_integrations", payload, "user_id")

	c.Data(http.StatusOK, "text/html", []byte(oauthSuccessPage("google", fURL)))
}

// POST /api/integrations/google/disconnect
func GoogleDisconnect(c *gin.Context) {
	user := middleware.GetUser(c)

	config.Supabase.From("calendar_integrations").Eq("user_id", user.ID).Update(map[string]any{
		"google_access_token":  nil,
		"google_refresh_token": nil,
		"google_token_expiry":  nil,
		"updated_at":           time.Now().UTC().Format(time.RFC3339),
	})

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// GET /api/integrations/google/events
func GoogleListEvents(c *gin.Context) {
	user := middleware.GetUser(c)

	body, _, _ := config.Supabase.From("calendar_integrations").
		Select("google_access_token,google_refresh_token,google_token_expiry").
		Eq("user_id", user.ID).Get()

	var rows []map[string]any
	json.Unmarshal(body, &rows)

	if len(rows) == 0 || rows[0]["google_access_token"] == nil {
		c.JSON(http.StatusOK, []any{})
		return
	}

	d := rows[0]
	accessToken := fmt.Sprintf("%v", d["google_access_token"])
	refreshToken, _ := d["google_refresh_token"].(string)
	tokenExpiry, _ := d["google_token_expiry"].(string)

	accessToken = refreshGoogleTokenIfNeeded(accessToken, refreshToken, tokenExpiry, user.ID)

	timeMin := time.Now().AddDate(0, 0, -30).Format(time.RFC3339)
	timeMax := time.Now().AddDate(0, 0, 90).Format(time.RFC3339)
	params := fmt.Sprintf("timeMin=%s&timeMax=%s&singleEvents=true&orderBy=startTime&maxResults=250",
		url.QueryEscape(timeMin), url.QueryEscape(timeMax))

	req, _ := http.NewRequest("GET",
		"https://www.googleapis.com/calendar/v3/calendars/primary/events?"+params, nil)
	req.Header.Set("Authorization", "Bearer "+accessToken)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusOK, []any{})
		return
	}
	defer resp.Body.Close()

	var gcalData struct {
		Items []map[string]any `json:"items"`
	}
	json.NewDecoder(resp.Body).Decode(&gcalData)

	events := []map[string]any{}
	for _, e := range gcalData.Items {
		start, _ := e["start"].(map[string]any)
		if start == nil {
			continue
		}
		date, _ := start["date"].(string)
		if date == "" {
			dt, _ := start["dateTime"].(string)
			if dt != "" && len(dt) >= 10 {
				date = dt[:10]
			}
		}
		if date == "" {
			continue
		}
		summary, _ := e["summary"].(string)
		if strings.HasPrefix(summary, "[BeePlanner]") {
			continue
		}
		id, _ := e["id"].(string)
		events = append(events, map[string]any{
			"id":     "google_" + id,
			"title":  summary,
			"date":   date,
			"type":   "Google Agenda",
			"source": "google",
		})
	}

	c.Header("Cache-Control", "no-store")
	c.JSON(http.StatusOK, events)
}

// POST /api/integrations/google/events
func GoogleCreateEvent(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title string `json:"title"`
		Date  string `json:"date"`
		Type  string `json:"type"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dbBody, _, _ := config.Supabase.From("calendar_integrations").
		Select("google_access_token,google_refresh_token,google_token_expiry").
		Eq("user_id", user.ID).Get()

	var rows []map[string]any
	json.Unmarshal(dbBody, &rows)
	if len(rows) == 0 || rows[0]["google_access_token"] == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Google Calendar não conectado"})
		return
	}

	d := rows[0]
	accessToken := fmt.Sprintf("%v", d["google_access_token"])
	refreshToken, _ := d["google_refresh_token"].(string)
	tokenExpiry, _ := d["google_token_expiry"].(string)
	accessToken = refreshGoogleTokenIfNeeded(accessToken, refreshToken, tokenExpiry, user.ID)

	endDate := func() string {
		t, err := time.Parse("2006-01-02", body.Date)
		if err != nil {
			return body.Date
		}
		return t.AddDate(0, 0, 1).Format("2006-01-02")
	}()

	payload := map[string]any{
		"summary":     "[BeePlanner] " + body.Title,
		"description": "Categoria: " + body.Type,
		"start":       map[string]string{"date": body.Date},
		"end":         map[string]string{"date": endDate},
	}
	b, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST",
		"https://www.googleapis.com/calendar/v3/calendars/primary/events",
		bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento no Google"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		respBody, _ := io.ReadAll(resp.Body)
		var errResp map[string]any
		json.Unmarshal(respBody, &errResp)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento no Google"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ── Outlook (Microsoft) ──────────────────────────────────────────────────────

// GET /api/integrations/outlook/connect
func OutlookConnect(c *gin.Context) {
	user := middleware.GetUser(c)
	clientID := os.Getenv("MICROSOFT_CLIENT_ID")
	if clientID == "" {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "MICROSOFT_CLIENT_ID não configurado"})
		return
	}

	state := base64.StdEncoding.EncodeToString([]byte(user.ID))
	redirectURI := backendURL() + "/api/integrations/outlook/callback"

	u, _ := url.Parse("https://login.microsoftonline.com/common/oauth2/v2.0/authorize")
	q := u.Query()
	q.Set("client_id", clientID)
	q.Set("redirect_uri", redirectURI)
	q.Set("response_type", "code")
	q.Set("scope", "Calendars.ReadWrite offline_access")
	q.Set("response_mode", "query")
	q.Set("state", state)
	u.RawQuery = q.Encode()

	c.JSON(http.StatusOK, gin.H{"url": u.String()})
}

// GET /api/integrations/outlook/callback
func OutlookCallback(c *gin.Context) {
	code := c.Query("code")
	state := c.Query("state")
	oauthErr := c.Query("error")
	fURL := frontendURL()

	if oauthErr != "" || code == "" || state == "" {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("outlook", fURL)))
		return
	}

	userIDBytes, err := base64.StdEncoding.DecodeString(state)
	if err != nil {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("outlook", fURL)))
		return
	}
	userID := string(userIDBytes)

	clientID := os.Getenv("MICROSOFT_CLIENT_ID")
	clientSecret := os.Getenv("MICROSOFT_CLIENT_SECRET")
	redirectURI := backendURL() + "/api/integrations/outlook/callback"

	form := url.Values{}
	form.Set("code", code)
	form.Set("client_id", clientID)
	form.Set("client_secret", clientSecret)
	form.Set("redirect_uri", redirectURI)
	form.Set("grant_type", "authorization_code")
	form.Set("scope", "Calendars.ReadWrite offline_access")

	tokenResp, err := http.Post(
		"https://login.microsoftonline.com/common/oauth2/v2.0/token",
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("outlook", fURL)))
		return
	}
	defer tokenResp.Body.Close()

	var tokens struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token"`
		ExpiresIn    int    `json:"expires_in"`
	}
	json.NewDecoder(tokenResp.Body).Decode(&tokens)

	if tokens.AccessToken == "" {
		c.Data(http.StatusOK, "text/html", []byte(oauthErrorPage("outlook", fURL)))
		return
	}

	expiry := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second).UTC().Format(time.RFC3339)

	payload := map[string]any{
		"user_id":               userID,
		"outlook_access_token":  tokens.AccessToken,
		"outlook_token_expiry":  expiry,
		"updated_at":            time.Now().UTC().Format(time.RFC3339),
	}
	if tokens.RefreshToken != "" {
		payload["outlook_refresh_token"] = tokens.RefreshToken
	}

	config.Supabase.Upsert("calendar_integrations", payload, "user_id")

	c.Data(http.StatusOK, "text/html", []byte(oauthSuccessPage("outlook", fURL)))
}

// POST /api/integrations/outlook/disconnect
func OutlookDisconnect(c *gin.Context) {
	user := middleware.GetUser(c)

	config.Supabase.From("calendar_integrations").Eq("user_id", user.ID).Update(map[string]any{
		"outlook_access_token":  nil,
		"outlook_refresh_token": nil,
		"outlook_token_expiry":  nil,
		"updated_at":            time.Now().UTC().Format(time.RFC3339),
	})

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// POST /api/integrations/outlook/events
func OutlookCreateEvent(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title string `json:"title"`
		Date  string `json:"date"`
		Type  string `json:"type"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	dbBody, _, _ := config.Supabase.From("calendar_integrations").
		Select("outlook_access_token").Eq("user_id", user.ID).Get()

	var rows []map[string]any
	json.Unmarshal(dbBody, &rows)
	if len(rows) == 0 || rows[0]["outlook_access_token"] == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Outlook não conectado"})
		return
	}

	accessToken := fmt.Sprintf("%v", rows[0]["outlook_access_token"])

	endDate := func() string {
		t, err := time.Parse("2006-01-02", body.Date)
		if err != nil {
			return body.Date
		}
		return t.AddDate(0, 0, 1).Format("2006-01-02")
	}()

	payload := map[string]any{
		"subject": "[BeePlanner] " + body.Title,
		"body":    map[string]string{"contentType": "text", "content": "Categoria: " + body.Type},
		"start":   map[string]string{"dateTime": body.Date + "T00:00:00", "timeZone": "UTC"},
		"end":     map[string]string{"dateTime": endDate + "T00:00:00", "timeZone": "UTC"},
		"isAllDay": true,
	}
	b, _ := json.Marshal(payload)

	req, _ := http.NewRequest("POST", "https://graph.microsoft.com/v1.0/me/events", bytes.NewReader(b))
	req.Header.Set("Authorization", "Bearer "+accessToken)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento no Outlook"})
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento no Outlook"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}

// ── Helper: renova token Google se expirado ──────────────────────────────────

func refreshGoogleTokenIfNeeded(accessToken, refreshToken, tokenExpiry, userID string) string {
	if tokenExpiry == "" || refreshToken == "" {
		return accessToken
	}

	expiry, err := time.Parse(time.RFC3339, tokenExpiry)
	if err != nil || time.Until(expiry) > 60*time.Second {
		return accessToken
	}

	clientID := os.Getenv("GOOGLE_CLIENT_ID")
	clientSecret := os.Getenv("GOOGLE_CLIENT_SECRET")

	form := url.Values{}
	form.Set("client_id", clientID)
	form.Set("client_secret", clientSecret)
	form.Set("refresh_token", refreshToken)
	form.Set("grant_type", "refresh_token")

	resp, err := http.Post(
		"https://oauth2.googleapis.com/token",
		"application/x-www-form-urlencoded",
		strings.NewReader(form.Encode()),
	)
	if err != nil {
		return accessToken
	}
	defer resp.Body.Close()

	var tokens struct {
		AccessToken string `json:"access_token"`
		ExpiresIn   int    `json:"expires_in"`
	}
	json.NewDecoder(resp.Body).Decode(&tokens)
	if tokens.AccessToken == "" {
		return accessToken
	}

	newExpiry := time.Now().Add(time.Duration(tokens.ExpiresIn) * time.Second).UTC().Format(time.RFC3339)
	config.Supabase.From("calendar_integrations").Eq("user_id", userID).Update(map[string]any{
		"google_access_token": tokens.AccessToken,
		"google_token_expiry": newExpiry,
		"updated_at":          time.Now().UTC().Format(time.RFC3339),
	})

	return tokens.AccessToken
}

// ── Páginas HTML de callback OAuth ───────────────────────────────────────────

func oauthSuccessPage(provider, fURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'oauth_callback', provider: '%s', status: 'success' }, '%s');
    window.close();
  } else {
    window.location.href = '%s/datas?integration=%s&status=success';
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px">Conectado! Fechando...</p>
</body></html>`, provider, fURL, fURL, provider)
}

func oauthErrorPage(provider, fURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'oauth_callback', provider: '%s', status: 'error' }, '%s');
    window.close();
  } else {
    window.location.href = '%s/datas?integration=%s&status=error';
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px">Erro ao conectar. Fechando...</p>
</body></html>`, provider, fURL, fURL, provider)
}
