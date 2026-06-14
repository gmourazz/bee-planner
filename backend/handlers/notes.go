package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/notes
func ListNotes(c *gin.Context) {
	user := middleware.GetUser(c)

	// Dual order: fixadas primeiro, depois por data
	body, status, err := config.Supabase.From("notes").
		Select("*").Eq("user_id", user.ID).
		Order("is_pinned", false).Order("created_at", false).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao buscar notas"})
		return
	}

	var notas []map[string]any
	json.Unmarshal(body, &notas)
	if notas == nil {
		notas = []map[string]any{}
	}
	c.JSON(http.StatusOK, gin.H{"notes": notas})
}

// POST /api/notes
func CreateNote(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title     string `json:"title"`
		Content   string `json:"content"`
		Category  string `json:"category"`
		Color     string `json:"color"`
		IsPinned  bool   `json:"isPinned"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título da nota é obrigatório"})
		return
	}

	category := body.Category
	if category == "" {
		category = "Pessoal"
	}
	color := body.Color
	if color == "" {
		color = "#FCD34D"
	}

	resp, status, err := config.Supabase.From("notes").Insert(map[string]any{
		"user_id":   user.ID,
		"title":     strings.TrimSpace(body.Title),
		"content":   body.Content,
		"category":  category,
		"color":     color,
		"is_pinned": body.IsPinned,
	})
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar nota"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar nota"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"note": rows[0]})
}

// PUT /api/notes/:id
func UpdateNote(c *gin.Context) {
	user := middleware.GetUser(c)
	noteID := c.Param("id")

	var body struct {
		Title    *string `json:"title"`
		Content  *string `json:"content"`
		Category *string `json:"category"`
		Color    *string `json:"color"`
		IsPinned *bool   `json:"isPinned"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Title != nil    { updates["title"]     = strings.TrimSpace(*body.Title) }
	if body.Content != nil  { updates["content"]   = *body.Content }
	if body.Category != nil { updates["category"]  = *body.Category }
	if body.Color != nil    { updates["color"]     = *body.Color }
	if body.IsPinned != nil { updates["is_pinned"] = *body.IsPinned }

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	resp, status, err := config.Supabase.From("notes").
		Eq("id", noteID).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao atualizar nota"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota não encontrada"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"note": rows[0]})
}

// DELETE /api/notes/:id
func DeleteNote(c *gin.Context) {
	user := middleware.GetUser(c)
	noteID := c.Param("id")

	_, status, err := config.Supabase.From("notes").
		Eq("id", noteID).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao remover nota"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Nota removida com sucesso"})
}

// PATCH /api/notes/:id/pin
func TogglePin(c *gin.Context) {
	user := middleware.GetUser(c)
	noteID := c.Param("id")

	var body struct {
		IsPinned *bool `json:"isPinned"`
	}
	if err := c.ShouldBindJSON(&body); err != nil || body.IsPinned == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O campo isPinned (boolean) é obrigatório"})
		return
	}

	resp, status, err := config.Supabase.From("notes").
		Eq("id", noteID).Eq("user_id", user.ID).Update(map[string]any{"is_pinned": *body.IsPinned})
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao fixar nota"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota não encontrada"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"isPinned": rows[0]["is_pinned"]})
}
