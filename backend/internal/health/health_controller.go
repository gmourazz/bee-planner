package health

import (
	"net/http"
	"regexp"
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

var dataRegex = regexp.MustCompile(`^\d{4}-\d{2}-\d{2}$`)

// @Summary      Listar logs de saúde
// @Tags         Health
// @Produce      json
// @Param        since query string false "Filtrar a partir de (YYYY-MM-DD)"
// @Success      200 {array} map[string]interface{}
// @Security     BearerAuth
// @Router       /health [get]
func (ctrl *Controller) ListarLogs(c *gin.Context) {
	user := middleware.CurrentUser(c)

	query := "SELECT * FROM health_logs WHERE user_id = $1"
	args := []any{user.ID}

	if since := c.Query("since"); since != "" {
		args = append(args, since)
		query += " AND log_date >= $" + strconv.Itoa(len(args))
	}
	query += " ORDER BY log_date"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logs, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, logs)
}

type upsertLogRequest struct {
	Water          *int     `json:"water"`
	Sleep          *float64 `json:"sleep"`
	Mood           *int     `json:"mood"`
	Exercises      []string `json:"exercises"`
	Steps          *int     `json:"steps"`
	ActiveCalories *int     `json:"active_calories"`
	AvgHeartRate   *int     `json:"avg_heart_rate"`
}

type syncRequest struct {
	Token          string `json:"token"`
	Date           string `json:"date"`
	Steps          *int   `json:"steps"`
	ActiveCalories *int   `json:"active_calories"`
	AvgHeartRate   *int   `json:"avg_heart_rate"`
}

// SyncFromShortcut recebe dados do iOS Shortcut (sem autenticação Bearer, usa sync_token)
func (ctrl *Controller) SyncFromShortcut(c *gin.Context) {
	var req syncRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.Token == "" || req.Date == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "token e date são obrigatórios"})
		return
	}
	if !dataRegex.MatchString(req.Date) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida (YYYY-MM-DD)"})
		return
	}

	var userID string
	err := ctrl.db.QueryRow(c.Request.Context(),
		"SELECT id FROM profiles WHERE sync_token = $1", req.Token).Scan(&userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	columns := []string{"user_id", "log_date"}
	args := []any{userID, req.Date}
	updateSets := []string{}
	addField := func(col string, val any) {
		args = append(args, val)
		columns = append(columns, col)
		updateSets = append(updateSets, col+" = EXCLUDED."+col)
	}

	if req.Steps != nil {
		addField("steps", *req.Steps)
	}
	if req.ActiveCalories != nil {
		addField("active_calories", *req.ActiveCalories)
	}
	if req.AvgHeartRate != nil {
		addField("avg_heart_rate", *req.AvgHeartRate)
	}

	if len(updateSets) == 0 {
		c.JSON(http.StatusOK, gin.H{"ok": true, "message": "Nenhum dado enviado"})
		return
	}

	placeholders := make([]string, len(args))
	for i := range args {
		placeholders[i] = "$" + strconv.Itoa(i+1)
	}
	query := "INSERT INTO health_logs (" + strings.Join(columns, ", ") + ") VALUES (" +
		strings.Join(placeholders, ", ") + ") ON CONFLICT (user_id, log_date) DO UPDATE SET " +
		strings.Join(updateSets, ", ") + " RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	log, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ok": true, "log": log})
}

// GetSyncToken retorna (ou gera) o sync_token do usuário para uso no iOS Shortcut
func (ctrl *Controller) GetSyncToken(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var token string
	err := ctrl.db.QueryRow(c.Request.Context(),
		"SELECT sync_token FROM profiles WHERE id = $1", user.ID).Scan(&token)
	if err != nil || token == "" {
		err = ctrl.db.QueryRow(c.Request.Context(),
			"UPDATE profiles SET sync_token = gen_random_uuid() WHERE id = $1 RETURNING sync_token",
			user.ID).Scan(&token)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao obter token"})
			return
		}
	}
	c.JSON(http.StatusOK, gin.H{"sync_token": token})
}

// @Summary      Criar ou atualizar log de saúde do dia
// @Tags         Health
// @Accept       json
// @Produce      json
// @Param        date path string        true "Data (YYYY-MM-DD)"
// @Param        body body upsertLogRequest true "Dados do log"
// @Success      200 {object} map[string]interface{}
// @Security     BearerAuth
// @Router       /health/{date} [put]
func (ctrl *Controller) UpsertLog(c *gin.Context) {
	user := middleware.CurrentUser(c)
	date := c.Param("date")

	if !dataRegex.MatchString(date) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data inválida (YYYY-MM-DD)"})
		return
	}

	var req upsertLogRequest
	c.ShouldBindJSON(&req)

	columns := []string{"user_id", "log_date"}
	args := []any{user.ID, date}
	updateSets := []string{}
	addField := func(column string, value any) {
		args = append(args, value)
		columns = append(columns, column)
		updateSets = append(updateSets, column+" = EXCLUDED."+column)
	}

	if req.Water != nil {
		addField("water", *req.Water)
	}
	if req.Sleep != nil {
		addField("sleep", *req.Sleep)
	}
	if req.Mood != nil {
		addField("mood", *req.Mood)
	}
	if req.Exercises != nil {
		addField("exercises", req.Exercises)
	}
	if req.Steps != nil {
		addField("steps", *req.Steps)
	}
	if req.ActiveCalories != nil {
		addField("active_calories", *req.ActiveCalories)
	}
	if req.AvgHeartRate != nil {
		addField("avg_heart_rate", *req.AvgHeartRate)
	}

	if len(updateSets) == 0 {
		updateSets = append(updateSets, "log_date = EXCLUDED.log_date")
	}

	placeholders := make([]string, len(args))
	for i := range args {
		placeholders[i] = "$" + strconv.Itoa(i+1)
	}

	query := "INSERT INTO health_logs (" + strings.Join(columns, ", ") + ") VALUES (" +
		strings.Join(placeholders, ", ") + ") ON CONFLICT (user_id, log_date) DO UPDATE SET " +
		strings.Join(updateSets, ", ") + " RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	log, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, log)
}
