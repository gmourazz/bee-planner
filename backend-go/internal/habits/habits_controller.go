package habits

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
)

type Controller struct {
	db *pgxpool.Pool
}

func NewController(db *pgxpool.Pool) *Controller {
	return &Controller{db: db}
}

type habitRow struct {
	ID        string    `db:"id"`
	Name      string    `db:"name"`
	IconKey   string    `db:"icon_key"`
	Color     string    `db:"color"`
	CreatedAt time.Time `db:"created_at"`
}

// calcularSequencia calcula a sequência atual de dias consecutivos,
// percorrendo os dias para trás a partir de hoje (em UTC, igual ao toISOString() do Node).
func calcularSequencia(datas []string) int {
	conjunto := make(map[string]bool, len(datas))
	for _, d := range datas {
		conjunto[d] = true
	}

	sequencia := 0
	hoje := time.Now().UTC()
	for {
		chave := hoje.Format("2006-01-02")
		if !conjunto[chave] {
			break
		}
		sequencia++
		hoje = hoje.AddDate(0, 0, -1)
	}

	return sequencia
}

// GET /api/habits — lista os hábitos do usuário com conclusões dos últimos 60 dias e sequência atual
func (ctrl *Controller) ListarHabitos(c *gin.Context) {
	ctx := c.Request.Context()
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(ctx,
		"SELECT id::text, name, icon_key, color, created_at FROM habits WHERE user_id = $1 ORDER BY created_at ASC",
		user.ID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	habitos, err := pgx.CollectRows(rows, pgx.RowToStructByName[habitRow])
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(habitos) == 0 {
		c.JSON(http.StatusOK, gin.H{"habits": []gin.H{}})
		return
	}

	dataLimite := time.Now().UTC().AddDate(0, 0, -60).Format("2006-01-02")

	completionRows, err := ctrl.db.Query(ctx,
		"SELECT habit_id::text, date::text FROM habit_completions WHERE user_id = $1 AND date >= $2",
		user.ID, dataLimite,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	conclusoesPorHabito := map[string][]string{}
	for completionRows.Next() {
		var habitID, date string
		if err := completionRows.Scan(&habitID, &date); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		conclusoesPorHabito[habitID] = append(conclusoesPorHabito[habitID], date)
	}

	resultado := make([]gin.H, 0, len(habitos))
	for _, h := range habitos {
		datas := conclusoesPorHabito[h.ID]

		completions := gin.H{}
		for _, d := range datas {
			completions[d] = true
		}

		resultado = append(resultado, gin.H{
			"id":          h.ID,
			"name":        h.Name,
			"iconKey":     h.IconKey,
			"color":       h.Color,
			"completions": completions,
			"streak":      calcularSequencia(datas),
			"created_at":  h.CreatedAt,
		})
	}

	c.JSON(http.StatusOK, gin.H{"habits": resultado})
}

type criarHabitoRequest struct {
	Name    string `json:"name"`
	IconKey string `json:"iconKey"`
	Color   string `json:"color"`
}

// POST /api/habits — cria um novo hábito para o usuário logado
func (ctrl *Controller) CriarHabito(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req criarHabitoRequest
	c.ShouldBindJSON(&req)

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O nome do hábito é obrigatório"})
		return
	}

	iconKey := req.IconKey
	if iconKey == "" {
		iconKey = "droplets"
	}
	color := req.Color
	if color == "" {
		color = "#3B82F6"
	}

	var habit habitRow
	err := ctrl.db.QueryRow(c.Request.Context(),
		"INSERT INTO habits (user_id, name, icon_key, color) VALUES ($1, $2, $3, $4) RETURNING id::text, name, icon_key, color, created_at",
		user.ID, name, iconKey, color,
	).Scan(&habit.ID, &habit.Name, &habit.IconKey, &habit.Color, &habit.CreatedAt)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"habit": gin.H{
			"id":          habit.ID,
			"name":        habit.Name,
			"iconKey":     habit.IconKey,
			"color":       habit.Color,
			"completions": gin.H{},
			"streak":      0,
			"created_at":  habit.CreatedAt,
		},
	})
}

type editarHabitoRequest struct {
	Name    *string `json:"name"`
	IconKey *string `json:"iconKey"`
	Color   *string `json:"color"`
}

// PUT /api/habits/:id — edita nome, ícone ou cor de um hábito existente
func (ctrl *Controller) EditarHabito(c *gin.Context) {
	user := middleware.CurrentUser(c)
	habitID := c.Param("id")

	var req editarHabitoRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	setClauses := []string{}
	args := []any{}
	addField := func(column, value string) {
		args = append(args, value)
		setClauses = append(setClauses, column+" = $"+strconv.Itoa(len(args)))
	}

	if req.Name != nil {
		addField("name", strings.TrimSpace(*req.Name))
	}
	if req.IconKey != nil {
		addField("icon_key", *req.IconKey)
	}
	if req.Color != nil {
		addField("color", *req.Color)
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, habitID, user.ID)
	query := "UPDATE habits SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING id::text, name, icon_key, color"

	var id, name, iconKey, color string
	err := ctrl.db.QueryRow(c.Request.Context(), query, args...).Scan(&id, &name, &iconKey, &color)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hábito não encontrado"})
		return
	}
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"habit": gin.H{
			"id":      id,
			"name":    name,
			"iconKey": iconKey,
			"color":   color,
		},
	})
}

// DELETE /api/habits/:id — remove o hábito e suas conclusões (cascade)
func (ctrl *Controller) DeletarHabito(c *gin.Context) {
	user := middleware.CurrentUser(c)
	habitID := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM habits WHERE id = $1 AND user_id = $2", habitID, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Hábito removido com sucesso"})
}

type toggleRequest struct {
	Date string `json:"date"`
}

// POST /api/habits/:id/toggle — marca ou desmarca um hábito em uma data específica
func (ctrl *Controller) ToggleConclusao(c *gin.Context) {
	ctx := c.Request.Context()
	user := middleware.CurrentUser(c)
	habitID := c.Param("id")

	var req toggleRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O campo \"date\" (YYYY-MM-DD) é obrigatório"})
		return
	}

	var donoID string
	err := ctrl.db.QueryRow(ctx,
		"SELECT id::text FROM habits WHERE id = $1 AND user_id = $2", habitID, user.ID,
	).Scan(&donoID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hábito não encontrado"})
		return
	}

	var existenteID string
	err = ctrl.db.QueryRow(ctx,
		"SELECT id::text FROM habit_completions WHERE habit_id = $1 AND date = $2", habitID, req.Date,
	).Scan(&existenteID)

	if err == nil {
		// já estava marcado → desmarca
		ctrl.db.Exec(ctx, "DELETE FROM habit_completions WHERE id = $1", existenteID)
		c.JSON(http.StatusOK, gin.H{"completed": false, "date": req.Date})
		return
	}

	// não estava marcado → marca
	ctrl.db.Exec(ctx,
		"INSERT INTO habit_completions (habit_id, user_id, date) VALUES ($1, $2, $3)",
		habitID, user.ID, req.Date,
	)
	c.JSON(http.StatusOK, gin.H{"completed": true, "date": req.Date})
}
