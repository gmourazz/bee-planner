package courses

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

// GET /api/courses — lista os cursos do usuário, do mais recente ao mais antigo
func (ctrl *Controller) ListarCursos(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM courses WHERE user_id = $1 ORDER BY created_at DESC", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	cursos, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, cursos)
}

type cursoRequest struct {
	Title             string  `json:"title"`
	Platform          *string `json:"platform"`
	Duration          *string `json:"duration"`
	Progress          *int    `json:"progress"`
	Status            *string `json:"status"`
	StartDate         *string `json:"start_date"`
	EndDate           *string `json:"end_date"`
	Certificate       *bool   `json:"certificate"`
	CertificateExpiry *string `json:"certificate_expiry"`
	Credential        *string `json:"credential"`
}

// POST /api/courses — cria um novo curso. Campos não enviados ficam com o default do banco.
func (ctrl *Controller) CriarCurso(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req cursoRequest
	c.ShouldBindJSON(&req)

	title := strings.TrimSpace(req.Title)
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Título obrigatório"})
		return
	}

	columns := []string{"user_id", "title"}
	args := []any{user.ID, title}
	addField := func(column string, value any) {
		args = append(args, value)
		columns = append(columns, column)
	}

	if req.Platform != nil {
		addField("platform", *req.Platform)
	}
	if req.Duration != nil {
		addField("duration", *req.Duration)
	}
	if req.Progress != nil {
		addField("progress", *req.Progress)
	}
	if req.Status != nil {
		addField("status", *req.Status)
	}
	if req.StartDate != nil {
		addField("start_date", *req.StartDate)
	}
	if req.EndDate != nil {
		addField("end_date", *req.EndDate)
	}
	if req.Certificate != nil {
		addField("certificate", *req.Certificate)
	}
	if req.CertificateExpiry != nil {
		addField("certificate_expiry", *req.CertificateExpiry)
	}
	if req.Credential != nil {
		addField("credential", *req.Credential)
	}

	placeholders := make([]string, len(args))
	for i := range args {
		placeholders[i] = "$" + strconv.Itoa(i+1)
	}

	query := "INSERT INTO courses (" + strings.Join(columns, ", ") + ") VALUES (" +
		strings.Join(placeholders, ", ") + ") RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	curso, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, curso)
}

// PUT /api/courses/:id — edita os campos enviados de um curso
func (ctrl *Controller) EditarCurso(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req cursoRequest
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

	if req.Title != "" {
		addField("title", strings.TrimSpace(req.Title))
	}
	if req.Platform != nil {
		addField("platform", *req.Platform)
	}
	if req.Duration != nil {
		addField("duration", *req.Duration)
	}
	if req.Progress != nil {
		addField("progress", *req.Progress)
	}
	if req.Status != nil {
		addField("status", *req.Status)
	}
	if req.StartDate != nil {
		addField("start_date", *req.StartDate)
	}
	if req.EndDate != nil {
		addField("end_date", *req.EndDate)
	}
	if req.Certificate != nil {
		addField("certificate", *req.Certificate)
	}
	if req.CertificateExpiry != nil {
		addField("certificate_expiry", *req.CertificateExpiry)
	}
	if req.Credential != nil {
		addField("credential", *req.Credential)
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, id, user.ID)
	query := "UPDATE courses SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	curso, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso não encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, curso)
}

// DELETE /api/courses/:id — remove um curso
func (ctrl *Controller) DeletarCurso(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM courses WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
