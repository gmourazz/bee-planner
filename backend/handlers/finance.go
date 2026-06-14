package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/finance
func ListTransactions(c *gin.Context) {
	user := middleware.GetUser(c)

	// Dual order: por data desc, depois por created_at desc
	body, status, err := config.Supabase.From("transactions").
		Select("*").Eq("user_id", user.ID).
		Order("date", false).Order("created_at", false).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar transações"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(body, &rows)
	if rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, rows)
}

// POST /api/finance
func CreateTransaction(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Description string   `json:"description"`
		Amount      *float64 `json:"amount"`
		Type        string   `json:"type"`
		Category    string   `json:"category"`
		Label       string   `json:"label"`
		Date        string   `json:"date"`
		Recurring   *bool    `json:"recurring"`
		DueDate     string   `json:"due_date"`
		PaymentDate string   `json:"payment_date"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Description) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Descrição obrigatória"})
		return
	}
	if body.Amount == nil || *body.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor inválido"})
		return
	}
	if body.Type != "income" && body.Type != "expense" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo inválido"})
		return
	}

	recurring := false
	if body.Recurring != nil {
		recurring = *body.Recurring
	}

	resp, status, err := config.Supabase.From("transactions").Insert(map[string]any{
		"user_id":      user.ID,
		"description":  strings.TrimSpace(body.Description),
		"amount":       *body.Amount,
		"type":         body.Type,
		"category":     body.Category,
		"label":        body.Label,
		"date":         body.Date,
		"recurring":    recurring,
		"due_date":     nilIfEmpty(body.DueDate),
		"payment_date": nilIfEmpty(body.PaymentDate),
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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar transação"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// PUT /api/finance/:id
func UpdateTransaction(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Description *string  `json:"description"`
		Amount      *float64 `json:"amount"`
		Type        *string  `json:"type"`
		Category    *string  `json:"category"`
		Label       *string  `json:"label"`
		Date        *string  `json:"date"`
		Recurring   *bool    `json:"recurring"`
		DueDate     *string  `json:"due_date"`
		PaymentDate *string  `json:"payment_date"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Amount != nil && *body.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor inválido"})
		return
	}
	if body.Type != nil && *body.Type != "income" && *body.Type != "expense" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo inválido"})
		return
	}

	updates := map[string]any{}
	if body.Description != nil { updates["description"]  = strings.TrimSpace(*body.Description) }
	if body.Amount != nil      { updates["amount"]        = *body.Amount }
	if body.Type != nil        { updates["type"]          = *body.Type }
	if body.Category != nil    { updates["category"]      = *body.Category }
	if body.Label != nil       { updates["label"]         = *body.Label }
	if body.Date != nil        { updates["date"]          = *body.Date }
	if body.Recurring != nil   { updates["recurring"]     = *body.Recurring }
	if body.DueDate != nil     { updates["due_date"]      = nilIfEmpty(*body.DueDate) }
	if body.PaymentDate != nil { updates["payment_date"]  = nilIfEmpty(*body.PaymentDate) }

	resp, status, err := config.Supabase.From("transactions").
		Eq("id", id).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar transação"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// DELETE /api/finance/:id
func DeleteTransaction(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("transactions").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar transação"})
		return
	}
	c.Status(http.StatusNoContent)
}
