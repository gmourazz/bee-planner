package finance

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

var tiposValidos = map[string]bool{"income": true, "expense": true}

// @Summary      Listar transações
// @Tags         Finance
// @Produce      json
// @Success      200 {array} map[string]interface{}
// @Security     BearerAuth
// @Router       /finance [get]
func (ctrl *Controller) ListarTransacoes(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM transactions WHERE user_id = $1 ORDER BY date DESC, created_at DESC", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	transacoes, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, transacoes)
}

type criarTransacaoRequest struct {
	Description string   `json:"description"`
	Amount      *float64 `json:"amount"`
	Type        string   `json:"type"`
	Category    string   `json:"category"`
	Label       *string  `json:"label"`
	Date        string   `json:"date"`
	Recurring   *bool    `json:"recurring"`
}

// @Summary      Criar transação
// @Tags         Finance
// @Accept       json
// @Produce      json
// @Param        body body criarTransacaoRequest true "Dados da transação"
// @Success      201 {object} map[string]interface{}
// @Security     BearerAuth
// @Router       /finance [post]
func (ctrl *Controller) CriarTransacao(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarTransacaoRequest
	c.ShouldBindJSON(&req)

	description := strings.TrimSpace(req.Description)
	if description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Descrição obrigatória"})
		return
	}
	if req.Amount == nil || *req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor inválido"})
		return
	}
	if !tiposValidos[req.Type] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo inválido"})
		return
	}

	label := ""
	if req.Label != nil {
		label = *req.Label
	}
	recurring := false
	if req.Recurring != nil {
		recurring = *req.Recurring
	}

	rows, err := ctrl.db.Query(c.Request.Context(), `
		INSERT INTO transactions (user_id, description, amount, type, category, label, date, recurring)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING *`,
		user.ID, description, *req.Amount, req.Type, req.Category, label, req.Date, recurring,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	transacao, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, transacao)
}

type editarTransacaoRequest struct {
	Description *string  `json:"description"`
	Amount      *float64 `json:"amount"`
	Type        *string  `json:"type"`
	Category    *string  `json:"category"`
	Label       *string  `json:"label"`
	Date        *string  `json:"date"`
	Recurring   *bool    `json:"recurring"`
}

// @Summary      Editar transação
// @Tags         Finance
// @Accept       json
// @Produce      json
// @Param        id   path string                true "ID da transação"
// @Param        body body editarTransacaoRequest true "Campos a atualizar"
// @Success      200 {object} map[string]interface{}
// @Failure      404 {object} map[string]string
// @Security     BearerAuth
// @Router       /finance/{id} [put]
func (ctrl *Controller) EditarTransacao(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req editarTransacaoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if req.Amount != nil && *req.Amount <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Valor inválido"})
		return
	}
	if req.Type != nil && !tiposValidos[*req.Type] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo inválido"})
		return
	}

	setClauses := []string{}
	args := []any{}
	addField := func(column string, value any) {
		args = append(args, value)
		setClauses = append(setClauses, column+" = $"+strconv.Itoa(len(args)))
	}

	if req.Description != nil {
		addField("description", strings.TrimSpace(*req.Description))
	}
	if req.Amount != nil {
		addField("amount", *req.Amount)
	}
	if req.Type != nil {
		addField("type", *req.Type)
	}
	if req.Category != nil {
		addField("category", *req.Category)
	}
	if req.Label != nil {
		addField("label", *req.Label)
	}
	if req.Date != nil {
		addField("date", *req.Date)
	}
	if req.Recurring != nil {
		addField("recurring", *req.Recurring)
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, id, user.ID)
	query := "UPDATE transactions SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	transacao, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transação não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, transacao)
}

// @Summary      Deletar transação
// @Tags         Finance
// @Produce      json
// @Param        id path string true "ID da transação"
// @Success      204
// @Security     BearerAuth
// @Router       /finance/{id} [delete]
func (ctrl *Controller) DeletarTransacao(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM transactions WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
