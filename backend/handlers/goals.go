package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/goals
func ListGoals(c *gin.Context) {
	user := middleware.GetUser(c)

	scope := c.Query("scope")
	year := c.Query("year")
	month := c.Query("month")

	// Monta path com filtros opcionais
	path := fmt.Sprintf("goals?select=*&user_id=eq.%s&order=created_at.asc", user.ID)
	if scope != "" {
		path += "&scope=eq." + scope
	}
	if year != "" {
		path += "&year=eq." + year
	}
	if month != "" && month != "null" {
		path += "&month=eq." + month
	}

	body, status, err := config.Supabase.RawRequest("GET", path, nil)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar metas"})
		return
	}

	var metas []map[string]any
	json.Unmarshal(body, &metas)
	if metas == nil {
		metas = []map[string]any{}
	}
	c.JSON(http.StatusOK, metas)
}

// POST /api/goals
func CreateGoal(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title       string  `json:"title"`
		Description string  `json:"description"`
		Target      float64 `json:"target"`
		Current     float64 `json:"current"`
		Unit        string  `json:"unit"`
		Color       string  `json:"color"`
		Category    string  `json:"category"`
		Scope       string  `json:"scope"`
		Year        *int    `json:"year"`
		Month       *int    `json:"month"`
		Deadline    string  `json:"deadline"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Título obrigatório"})
		return
	}
	if body.Scope != "annual" && body.Scope != "monthly" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Escopo inválido"})
		return
	}

	payload := map[string]any{
		"user_id":     user.ID,
		"title":       strings.TrimSpace(body.Title),
		"description": strings.TrimSpace(body.Description),
		"target":      body.Target,
		"current":     body.Current,
		"unit":        strings.TrimSpace(body.Unit),
		"color":       body.Color,
		"category":    body.Category,
		"scope":       body.Scope,
		"year":        body.Year,
		"month":       body.Month,
		"deadline":    nilIfEmpty(body.Deadline),
	}

	resp, status, err := config.Supabase.From("goals").Insert(payload)
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar meta"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// PUT /api/goals/:id
func UpdateGoal(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Title       *string  `json:"title"`
		Description *string  `json:"description"`
		Target      *float64 `json:"target"`
		Current     *float64 `json:"current"`
		Unit        *string  `json:"unit"`
		Color       *string  `json:"color"`
		Category    *string  `json:"category"`
		Deadline    *string  `json:"deadline"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Title != nil       { updates["title"]       = strings.TrimSpace(*body.Title) }
	if body.Description != nil { updates["description"] = strings.TrimSpace(*body.Description) }
	if body.Target != nil      { updates["target"]      = *body.Target }
	if body.Current != nil     { updates["current"]     = *body.Current }
	if body.Unit != nil        { updates["unit"]        = *body.Unit }
	if body.Color != nil       { updates["color"]       = *body.Color }
	if body.Category != nil    { updates["category"]    = *body.Category }
	if body.Deadline != nil    { updates["deadline"]    = nilIfEmpty(*body.Deadline) }

	resp, status, err := config.Supabase.From("goals").
		Eq("id", id).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar meta"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meta não encontrada"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// PATCH /api/goals/:id/progress
func UpdateProgress(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Current *float64 `json:"current"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.Current == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campo current obrigatório"})
		return
	}

	resp, status, err := config.Supabase.From("goals").
		Eq("id", id).Eq("user_id", user.ID).Update(map[string]any{"current": *body.Current})
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar progresso"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meta não encontrada"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// DELETE /api/goals/:id
func DeleteGoal(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("goals").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar meta"})
		return
	}
	c.Status(http.StatusNoContent)
}

// nilIfEmpty retorna nil se a string for vazia, caso contrário retorna o valor
func nilIfEmpty(s string) any {
	if s == "" {
		return nil
	}
	return s
}
