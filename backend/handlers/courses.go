package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/courses
func ListCourses(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("courses").
		Select("*").Eq("user_id", user.ID).Order("created_at", false).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar cursos"})
		return
	}

	var cursos []map[string]any
	json.Unmarshal(body, &cursos)
	if cursos == nil {
		cursos = []map[string]any{}
	}
	c.JSON(http.StatusOK, cursos)
}

// POST /api/courses
func CreateCourse(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title              string  `json:"title"`
		Platform           string  `json:"platform"`
		Duration           *int    `json:"duration"`
		Progress           *int    `json:"progress"`
		Status             string  `json:"status"`
		StartDate          string  `json:"start_date"`
		EndDate            string  `json:"end_date"`
		Certificate        *bool   `json:"certificate"`
		CertificateExpiry  string  `json:"certificate_expiry"`
		Credential         string  `json:"credential"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Título obrigatório"})
		return
	}

	resp, status, err := config.Supabase.From("courses").Insert(map[string]any{
		"user_id":            user.ID,
		"title":              strings.TrimSpace(body.Title),
		"platform":           body.Platform,
		"duration":           body.Duration,
		"progress":           body.Progress,
		"status":             body.Status,
		"start_date":         nilIfEmpty(body.StartDate),
		"end_date":           nilIfEmpty(body.EndDate),
		"certificate":        body.Certificate,
		"certificate_expiry": nilIfEmpty(body.CertificateExpiry),
		"credential":         body.Credential,
	})
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar curso"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// PUT /api/courses/:id
func UpdateCourse(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Title             *string `json:"title"`
		Platform          *string `json:"platform"`
		Duration          *int    `json:"duration"`
		Progress          *int    `json:"progress"`
		Status            *string `json:"status"`
		StartDate         *string `json:"start_date"`
		EndDate           *string `json:"end_date"`
		Certificate       *bool   `json:"certificate"`
		CertificateExpiry *string `json:"certificate_expiry"`
		Credential        *string `json:"credential"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Title != nil             { updates["title"]              = strings.TrimSpace(*body.Title) }
	if body.Platform != nil          { updates["platform"]           = *body.Platform }
	if body.Duration != nil          { updates["duration"]           = *body.Duration }
	if body.Progress != nil          { updates["progress"]           = *body.Progress }
	if body.Status != nil            { updates["status"]             = *body.Status }
	if body.StartDate != nil         { updates["start_date"]         = nilIfEmpty(*body.StartDate) }
	if body.EndDate != nil           { updates["end_date"]           = nilIfEmpty(*body.EndDate) }
	if body.Certificate != nil       { updates["certificate"]        = *body.Certificate }
	if body.CertificateExpiry != nil { updates["certificate_expiry"] = nilIfEmpty(*body.CertificateExpiry) }
	if body.Credential != nil        { updates["credential"]         = *body.Credential }

	resp, status, err := config.Supabase.From("courses").
		Eq("id", id).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar curso"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// DELETE /api/courses/:id
func DeleteCourse(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("courses").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar curso"})
		return
	}
	c.Status(http.StatusNoContent)
}
