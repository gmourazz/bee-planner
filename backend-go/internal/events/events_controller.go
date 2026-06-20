package events

import (
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/dbutil"
	"beeplanerofc/backend-go/internal/middleware"
)

type Controller struct {
	db *pgxpool.Pool
}

func NewController(db *pgxpool.Pool) *Controller {
	return &Controller{db: db}
}

// GET /api/events — lista os eventos do usuário, ordenados por data
func (ctrl *Controller) ListarEventos(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM events WHERE user_id = $1 ORDER BY date ASC", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	eventos, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, eventos)
}

type criarEventoRequest struct {
	Title       string  `json:"title"`
	Date        string  `json:"date"`
	Type        *string `json:"type"`
	Description *string `json:"description"`
}

// POST /api/events — cria um novo evento
func (ctrl *Controller) CriarEvento(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarEventoRequest
	c.ShouldBindJSON(&req)

	title := strings.TrimSpace(req.Title)
	if title == "" || req.Date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Título e data são obrigatórios"})
		return
	}

	eventType := "Pessoal"
	if req.Type != nil && *req.Type != "" {
		eventType = *req.Type
	}

	var description *string
	if req.Description != nil {
		trimmed := strings.TrimSpace(*req.Description)
		if trimmed != "" {
			description = &trimmed
		}
	}

	rows, err := ctrl.db.Query(c.Request.Context(), `
		INSERT INTO events (user_id, title, date, type, description)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING *`,
		user.ID, title, req.Date, eventType, description,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	evento, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, evento)
}

type editarEventoRequest struct {
	Title       *string `json:"title"`
	Date        *string `json:"date"`
	Type        *string `json:"type"`
	Description *string `json:"description"`
}

// PUT /api/events/:id — atualiza os campos enviados de um evento
func (ctrl *Controller) EditarEvento(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req editarEventoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	setClauses := []string{}
	args := []any{}
	addField := func(column string, value any) {
		args = append(args, value)
		setClauses = append(setClauses, column+" = $"+strconv.Itoa(len(args)))
	}

	if req.Title != nil {
		addField("title", *req.Title)
	}
	if req.Date != nil {
		addField("date", *req.Date)
	}
	if req.Type != nil {
		addField("type", *req.Type)
	}
	if req.Description != nil {
		addField("description", *req.Description)
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, id, user.ID)
	query := "UPDATE events SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	evento, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Evento não encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, evento)
}

// DELETE /api/events/:id — remove um evento
func (ctrl *Controller) DeletarEvento(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM events WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"ok": true})
}
