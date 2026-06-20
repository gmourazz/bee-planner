package books

import (
	"net/http"
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

// GET /api/books — lista os livros do usuário, do mais recente ao mais antigo
func (ctrl *Controller) ListarLivros(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM books WHERE user_id = $1 ORDER BY created_at DESC", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	livros, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"books": livros})
}

type criarLivroRequest struct {
	Title    string   `json:"title"`
	Author   string   `json:"author"`
	Rating   *int     `json:"rating"`
	Review   *string  `json:"review"`
	Genres   []string `json:"genres"`
	ColorIdx *int     `json:"colorIdx"`
}

// POST /api/books — cria um novo livro
func (ctrl *Controller) CriarLivro(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarLivroRequest
	c.ShouldBindJSON(&req)

	title := strings.TrimSpace(req.Title)
	author := strings.TrimSpace(req.Author)
	if title == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O título é obrigatório"})
		return
	}
	if author == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O autor é obrigatório"})
		return
	}

	rating := 5
	if req.Rating != nil {
		rating = *req.Rating
	}
	review := ""
	if req.Review != nil {
		review = *req.Review
	}
	genres := req.Genres
	if genres == nil {
		genres = []string{}
	}
	colorIdx := 0
	if req.ColorIdx != nil {
		colorIdx = *req.ColorIdx
	}

	rows, err := ctrl.db.Query(c.Request.Context(), `
		INSERT INTO books (user_id, title, author, rating, review, genres, color_idx)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING *`,
		user.ID, title, author, rating, review, genres, colorIdx,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	livro, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"book": livro})
}

// DELETE /api/books/:id — remove o livro do usuário
func (ctrl *Controller) DeletarLivro(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM books WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Livro removido com sucesso"})
}
