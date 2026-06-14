package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

var dateRegex = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)

// GET /api/health
func ListLogs(c *gin.Context) {
	user := middleware.GetUser(c)

	since := c.Query("since")

	qb := config.Supabase.From("health_logs").
		Select("*").Eq("user_id", user.ID).Order("log_date", true)

	if since != "" {
		qb = qb.Gte("log_date", since)
	}

	body, status, err := qb.Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar logs de saúde"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(body, &rows)
	if rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, rows)
}

// PUT /api/health/:date
func UpsertLog(c *gin.Context) {
	user := middleware.GetUser(c)
	date := c.Param("date")

	if !dateRegex.MatchString(date) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida (YYYY-MM-DD)"})
		return
	}

	var body struct {
		Water     *float64 `json:"water"`
		Sleep     *float64 `json:"sleep"`
		Mood      *int     `json:"mood"`
		Exercises *int     `json:"exercises"`
		Steps     *int     `json:"steps"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload := map[string]any{
		"user_id":  user.ID,
		"log_date": date,
	}
	if body.Water != nil     { payload["water"]     = *body.Water }
	if body.Sleep != nil     { payload["sleep"]     = *body.Sleep }
	if body.Mood != nil      { payload["mood"]      = *body.Mood }
	if body.Exercises != nil { payload["exercises"] = *body.Exercises }
	if body.Steps != nil     { payload["steps"]     = *body.Steps }

	resp, status, err := config.Supabase.Upsert("health_logs", payload, "user_id,log_date")
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar log"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}
