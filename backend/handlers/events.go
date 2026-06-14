package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/events
func ListEvents(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("events").
		Select("*").Eq("user_id", user.ID).Order("date", true).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar eventos"})
		return
	}

	var eventos []map[string]any
	json.Unmarshal(body, &eventos)
	if eventos == nil {
		eventos = []map[string]any{}
	}
	c.JSON(http.StatusOK, eventos)
}

// POST /api/events
func CreateEvent(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title       string `json:"title"`
		Date        string `json:"date"`
		Type        string `json:"type"`
		Description string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Title) == "" || body.Date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Título e data são obrigatórios"})
		return
	}

	eventType := body.Type
	if eventType == "" {
		eventType = "Pessoal"
	}

	resp, status, err := config.Supabase.From("events").Insert(map[string]any{
		"user_id":     user.ID,
		"title":       strings.TrimSpace(body.Title),
		"date":        body.Date,
		"type":        eventType,
		"description": nilIfEmpty(strings.TrimSpace(body.Description)),
	})
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar evento"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// PUT /api/events/:id
func UpdateEvent(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Title       *string `json:"title"`
		Date        *string `json:"date"`
		Type        *string `json:"type"`
		Description *string `json:"description"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Title != nil       { updates["title"]       = *body.Title }
	if body.Date != nil        { updates["date"]        = *body.Date }
	if body.Type != nil        { updates["type"]        = *body.Type }
	if body.Description != nil { updates["description"] = *body.Description }

	resp, status, err := config.Supabase.From("events").
		Eq("id", id).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar evento"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// DELETE /api/events/:id
func DeleteEvent(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("events").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao remover evento"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true})
}
