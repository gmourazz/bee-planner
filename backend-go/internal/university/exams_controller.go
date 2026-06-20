package university

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/dbutil"
	"beeplanerofc/backend-go/internal/middleware"
)

type ExamsController struct {
	db *pgxpool.Pool
}

func NewExamsController(db *pgxpool.Pool) *ExamsController {
	return &ExamsController{db: db}
}

// GET /api/university/exams — lista as provas do usuário, ordenadas por data
func (ctrl *ExamsController) ListarProvas(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM uni_exams WHERE user_id = $1 ORDER BY exam_date", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	provas, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, provas)
}

type criarProvaRequest struct {
	Subject     string  `json:"subject"`
	ExamDate    string  `json:"exam_date"`
	Type        *string `json:"type"`
	Description *string `json:"description"`
	Status      *string `json:"status"`
}

// POST /api/university/exams — cria uma nova prova
func (ctrl *ExamsController) CriarProva(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarProvaRequest
	c.ShouldBindJSON(&req)

	subject := strings.TrimSpace(req.Subject)
	if subject == "" || req.ExamDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Matéria e data obrigatórias"})
		return
	}

	status := "pending"
	if req.Status != nil {
		status = *req.Status
	}
	var eventType, description string
	if req.Type != nil {
		eventType = *req.Type
	}
	if req.Description != nil {
		description = *req.Description
	}

	rows, err := ctrl.db.Query(c.Request.Context(), `
		INSERT INTO uni_exams (user_id, subject, exam_date, type, description, status)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING *`,
		user.ID, subject, req.ExamDate, eventType, description, status,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	prova, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, prova)
}

var statusValidos = map[string]bool{"pending": true, "done": true}

type toggleProvaRequest struct {
	Status string `json:"status"`
}

// PATCH /api/university/exams/:id — alterna o status da prova (pending/done)
func (ctrl *ExamsController) ToggleProva(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req toggleProvaRequest
	if err := c.ShouldBindJSON(&req); err != nil || !statusValidos[req.Status] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido"})
		return
	}

	rows, err := ctrl.db.Query(c.Request.Context(),
		"UPDATE uni_exams SET status = $1 WHERE id = $2 AND user_id = $3 RETURNING *",
		req.Status, id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	prova, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prova não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, prova)
}

// DELETE /api/university/exams/:id — remove uma prova
func (ctrl *ExamsController) DeletarProva(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM uni_exams WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
