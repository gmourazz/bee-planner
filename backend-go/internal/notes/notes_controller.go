package notes

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

// GET /api/notes — lista as notas do usuário, fixadas primeiro, depois por data
func (ctrl *Controller) ListarNotas(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM notes WHERE user_id = $1 ORDER BY is_pinned DESC, created_at DESC",
		user.ID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	notas, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"notes": notas})
}

type criarNotaRequest struct {
	Title    string  `json:"title"`
	Content  *string `json:"content"`
	Category *string `json:"category"`
	Color    *string `json:"color"`
	IsPinned *bool   `json:"isPinned"`
}

// POST /api/notes — cria uma nova nota
func (ctrl *Controller) CriarNota(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarNotaRequest
	c.ShouldBindJSON(&req)

	title := strings.TrimSpace(req.Title)
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título da nota é obrigatório"})
		return
	}

	content := ""
	if req.Content != nil {
		content = *req.Content
	}
	category := "Pessoal"
	if req.Category != nil {
		category = *req.Category
	}
	color := "#FCD34D"
	if req.Color != nil {
		color = *req.Color
	}
	isPinned := false
	if req.IsPinned != nil {
		isPinned = *req.IsPinned
	}

	rows, err := ctrl.db.Query(c.Request.Context(), `
		INSERT INTO notes (user_id, title, content, category, color, is_pinned)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING *`,
		user.ID, title, content, category, color, isPinned,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	nota, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"note": nota})
}

type editarNotaRequest struct {
	Title    *string `json:"title"`
	Content  *string `json:"content"`
	Category *string `json:"category"`
	Color    *string `json:"color"`
	IsPinned *bool   `json:"isPinned"`
}

// PUT /api/notes/:id — edita os campos enviados de uma nota
func (ctrl *Controller) EditarNota(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req editarNotaRequest
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
	if req.Content != nil {
		addField("content", *req.Content)
	}
	if req.Category != nil {
		addField("category", *req.Category)
	}
	if req.Color != nil {
		addField("color", *req.Color)
	}
	if req.IsPinned != nil {
		addField("is_pinned", *req.IsPinned)
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, id, user.ID)
	query := "UPDATE notes SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	nota, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"note": nota})
}

// DELETE /api/notes/:id — remove a nota do usuário
func (ctrl *Controller) DeletarNota(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM notes WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Nota removida com sucesso"})
}

type togglePinRequest struct {
	IsPinned *bool `json:"isPinned"`
}

// PATCH /api/notes/:id/pin — alterna o pin da nota
func (ctrl *Controller) TogglePin(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req togglePinRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.IsPinned == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O campo \"isPinned\" (boolean) é obrigatório"})
		return
	}

	var isPinned bool
	err := ctrl.db.QueryRow(c.Request.Context(),
		"UPDATE notes SET is_pinned = $1 WHERE id = $2 AND user_id = $3 RETURNING is_pinned",
		*req.IsPinned, id, user.ID,
	).Scan(&isPinned)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Nota não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"isPinned": isPinned})
}
