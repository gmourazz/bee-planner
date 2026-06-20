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

// GET /api/health?since=YYYY-MM-DD — lista os logs de saúde do usuário
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
	Water     *int     `json:"water"`
	Sleep     *float64 `json:"sleep"`
	Mood      *int     `json:"mood"`
	Exercises []string `json:"exercises"`
	Steps     *int     `json:"steps"`
}

// PUT /api/health/:date — cria ou atualiza o log do dia (YYYY-MM-DD)
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
