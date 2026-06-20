package goals

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

var escoposValidos = map[string]bool{"annual": true, "monthly": true}

// GET /api/goals?scope=&year=&month= — lista as metas do usuário, com filtros opcionais
func (ctrl *Controller) ListarMetas(c *gin.Context) {
	user := middleware.CurrentUser(c)

	query := "SELECT * FROM goals WHERE user_id = $1"
	args := []any{user.ID}

	if scope := c.Query("scope"); scope != "" {
		args = append(args, scope)
		query += " AND scope = $" + strconv.Itoa(len(args))
	}
	if year := c.Query("year"); year != "" {
		n, err := strconv.Atoi(year)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Parâmetro year inválido"})
			return
		}
		args = append(args, n)
		query += " AND year = $" + strconv.Itoa(len(args))
	}
	if month := c.Query("month"); month != "" {
		n, err := strconv.Atoi(month)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Parâmetro month inválido"})
			return
		}
		args = append(args, n)
		query += " AND month = $" + strconv.Itoa(len(args))
	}
	query += " ORDER BY created_at"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	metas, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, metas)
}

type criarMetaRequest struct {
	Title       string   `json:"title"`
	Description *string  `json:"description"`
	Target      *float64 `json:"target"`
	Current     *float64 `json:"current"`
	Unit        *string  `json:"unit"`
	Color       string   `json:"color"`
	Category    string   `json:"category"`
	Scope       string   `json:"scope"`
	Year        int      `json:"year"`
	Month       *int     `json:"month"`
	Deadline    *string  `json:"deadline"`
}

// POST /api/goals — cria uma nova meta
func (ctrl *Controller) CriarMeta(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarMetaRequest
	c.ShouldBindJSON(&req)

	title := strings.TrimSpace(req.Title)
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Título obrigatório"})
		return
	}
	if !escoposValidos[req.Scope] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Escopo inválido"})
		return
	}

	description := ""
	if req.Description != nil {
		description = strings.TrimSpace(*req.Description)
	}
	var target, current float64
	if req.Target != nil {
		target = *req.Target
	}
	if req.Current != nil {
		current = *req.Current
	}
	unit := ""
	if req.Unit != nil {
		unit = strings.TrimSpace(*req.Unit)
	}
	var deadline *string
	if req.Deadline != nil && *req.Deadline != "" {
		deadline = req.Deadline
	}

	rows, err := ctrl.db.Query(c.Request.Context(), `
		INSERT INTO goals (user_id, title, description, target, current, unit, color, category, scope, year, month, deadline)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		RETURNING *`,
		user.ID, title, description, target, current, unit, req.Color, req.Category, req.Scope, req.Year, req.Month, deadline,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	meta, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, meta)
}

type editarMetaRequest struct {
	Title       *string  `json:"title"`
	Description *string  `json:"description"`
	Target      *float64 `json:"target"`
	Current     *float64 `json:"current"`
	Unit        *string  `json:"unit"`
	Color       *string  `json:"color"`
	Category    *string  `json:"category"`
	Deadline    *string  `json:"deadline"`
}

// PUT /api/goals/:id — edita os campos enviados de uma meta
func (ctrl *Controller) EditarMeta(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req editarMetaRequest
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
		addField("title", strings.TrimSpace(*req.Title))
	}
	if req.Description != nil {
		addField("description", strings.TrimSpace(*req.Description))
	}
	if req.Target != nil {
		addField("target", *req.Target)
	}
	if req.Current != nil {
		addField("current", *req.Current)
	}
	if req.Unit != nil {
		addField("unit", *req.Unit)
	}
	if req.Color != nil {
		addField("color", *req.Color)
	}
	if req.Category != nil {
		addField("category", *req.Category)
	}
	if req.Deadline != nil {
		if *req.Deadline == "" {
			addField("deadline", nil)
		} else {
			addField("deadline", *req.Deadline)
		}
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, id, user.ID)
	query := "UPDATE goals SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	meta, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meta não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meta)
}

type atualizarProgressoRequest struct {
	Current *float64 `json:"current"`
}

// PATCH /api/goals/:id — atualiza apenas o progresso atual (current)
func (ctrl *Controller) AtualizarProgresso(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req atualizarProgressoRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Current == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Campo current obrigatório"})
		return
	}

	rows, err := ctrl.db.Query(c.Request.Context(),
		"UPDATE goals SET current = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
		*req.Current, id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	meta, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Meta não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, meta)
}

// DELETE /api/goals/:id — remove uma meta
func (ctrl *Controller) DeletarMeta(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM goals WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
