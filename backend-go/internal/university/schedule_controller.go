package university

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

type ScheduleController struct {
	db *pgxpool.Pool
}

func NewScheduleController(db *pgxpool.Pool) *ScheduleController {
	return &ScheduleController{db: db}
}

// GET /api/university/schedule — lista a grade horária do usuário
func (ctrl *ScheduleController) ListarGrade(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM uni_schedule WHERE user_id = $1", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	grade, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, grade)
}

type aulaRequest struct {
	SubjectName *string `json:"subject_name"`
	Room        *string `json:"room"`
	DayOfWeek   *int    `json:"day_of_week"`
	TimeStart   *string `json:"time_start"`
	ColorIdx    *int    `json:"color_idx"`
	Semester    *string `json:"semester"`
}

// POST /api/university/schedule — cria uma nova aula na grade
func (ctrl *ScheduleController) CriarAula(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req aulaRequest
	c.ShouldBindJSON(&req)

	var subjectName string
	if req.SubjectName != nil {
		subjectName = strings.TrimSpace(*req.SubjectName)
	}
	if subjectName == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome da matéria obrigatório"})
		return
	}

	columns := []string{"user_id", "subject_name"}
	args := []any{user.ID, subjectName}
	addField := func(column string, value any) {
		args = append(args, value)
		columns = append(columns, column)
	}

	if req.Room != nil {
		addField("room", *req.Room)
	}
	if req.DayOfWeek != nil {
		addField("day_of_week", *req.DayOfWeek)
	}
	if req.TimeStart != nil {
		addField("time_start", *req.TimeStart)
	}
	if req.ColorIdx != nil {
		addField("color_idx", *req.ColorIdx)
	}
	if req.Semester != nil {
		addField("semester", *req.Semester)
	}

	placeholders := make([]string, len(args))
	for i := range args {
		placeholders[i] = "$" + strconv.Itoa(i+1)
	}

	query := "INSERT INTO uni_schedule (" + strings.Join(columns, ", ") + ") VALUES (" +
		strings.Join(placeholders, ", ") + ") RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	aula, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, aula)
}

// DELETE /api/university/schedule/:id — remove uma aula da grade
func (ctrl *ScheduleController) DeletarAula(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM uni_schedule WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
