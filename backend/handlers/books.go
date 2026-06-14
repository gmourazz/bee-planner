package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/books
func ListBooks(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("books").
		Select("*").Eq("user_id", user.ID).Order("created_at", false).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao buscar livros"})
		return
	}

	var livros []map[string]any
	json.Unmarshal(body, &livros)
	if livros == nil {
		livros = []map[string]any{}
	}
	c.JSON(http.StatusOK, gin.H{"books": livros})
}

// POST /api/books
func CreateBook(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Title    string   `json:"title"`
		Author   string   `json:"author"`
		Rating   *float64 `json:"rating"`
		Review   string   `json:"review"`
		Genres   []string `json:"genres"`
		ColorIdx *int     `json:"colorIdx"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Title) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título é obrigatório"})
		return
	}
	if strings.TrimSpace(body.Author) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O autor é obrigatório"})
		return
	}

	rating := 5.0
	if body.Rating != nil {
		rating = *body.Rating
	}
	colorIdx := 0
	if body.ColorIdx != nil {
		colorIdx = *body.ColorIdx
	}
	genres := body.Genres
	if genres == nil {
		genres = []string{}
	}

	resp, status, err := config.Supabase.From("books").Insert(map[string]any{
		"user_id":   user.ID,
		"title":     strings.TrimSpace(body.Title),
		"author":    strings.TrimSpace(body.Author),
		"rating":    rating,
		"review":    body.Review,
		"genres":    genres,
		"color_idx": colorIdx,
	})
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar livro"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar livro"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"book": rows[0]})
}

// DELETE /api/books/:id
func DeleteBook(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("books").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao remover livro"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Livro removido com sucesso"})
}
