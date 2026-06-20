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

type SubjectsController struct {
	db *pgxpool.Pool
}

func NewSubjectsController(db *pgxpool.Pool) *SubjectsController {
	return &SubjectsController{db: db}
}

// GET /api/university/subjects — lista as matérias do usuário
func (ctrl *SubjectsController) ListarMaterias(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT * FROM uni_subjects WHERE user_id = $1 ORDER BY created_at", user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	materias, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, materias)
}

type materiaRequest struct {
	Name          string   `json:"name"`
	Professor     *string  `json:"professor"`
	Credits       *int     `json:"credits"`
	Grade         *float64 `json:"grade"`
	Attendance    *float64 `json:"attendance"`
	Absences      *int     `json:"absences"`
	MaxAbsences   *int     `json:"max_absences"`
	SubjectStatus *string  `json:"subject_status"`
	StartDate     *string  `json:"start_date"`
	EndDate       *string  `json:"end_date"`
	ColorIdx      *int     `json:"color_idx"`
	Icon          *string  `json:"icon"`
	Semester      *string  `json:"semester"`
}

// POST /api/university/subjects — cria uma nova matéria. Campos não enviados ficam com o default do banco.
func (ctrl *SubjectsController) CriarMateria(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req materiaRequest
	c.ShouldBindJSON(&req)

	name := strings.TrimSpace(req.Name)
	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome obrigatório"})
		return
	}

	columns := []string{"user_id", "name"}
	args := []any{user.ID, name}
	addField := func(column string, value any) {
		args = append(args, value)
		columns = append(columns, column)
	}

	if req.Professor != nil {
		addField("professor", *req.Professor)
	}
	if req.Credits != nil {
		addField("credits", *req.Credits)
	}
	if req.Grade != nil {
		addField("grade", *req.Grade)
	}
	if req.Attendance != nil {
		addField("attendance", *req.Attendance)
	}
	if req.Absences != nil {
		addField("absences", *req.Absences)
	}
	if req.MaxAbsences != nil {
		addField("max_absences", *req.MaxAbsences)
	}
	if req.SubjectStatus != nil {
		addField("subject_status", *req.SubjectStatus)
	}
	if req.StartDate != nil {
		addField("start_date", *req.StartDate)
	}
	if req.EndDate != nil {
		addField("end_date", *req.EndDate)
	}
	if req.ColorIdx != nil {
		addField("color_idx", *req.ColorIdx)
	}
	if req.Icon != nil {
		addField("icon", *req.Icon)
	}
	if req.Semester != nil {
		addField("semester", *req.Semester)
	}

	placeholders := make([]string, len(args))
	for i := range args {
		placeholders[i] = "$" + strconv.Itoa(i+1)
	}

	query := "INSERT INTO uni_subjects (" + strings.Join(columns, ", ") + ") VALUES (" +
		strings.Join(placeholders, ", ") + ") RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	materia, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, materia)
}

// PUT /api/university/subjects/:id — edita os campos enviados de uma matéria
func (ctrl *SubjectsController) EditarMateria(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	var req materiaRequest
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

	if req.Name != "" {
		addField("name", strings.TrimSpace(req.Name))
	}
	if req.Professor != nil {
		addField("professor", *req.Professor)
	}
	if req.Credits != nil {
		addField("credits", *req.Credits)
	}
	if req.Grade != nil {
		addField("grade", *req.Grade)
	}
	if req.Attendance != nil {
		addField("attendance", *req.Attendance)
	}
	if req.Absences != nil {
		addField("absences", *req.Absences)
	}
	if req.MaxAbsences != nil {
		addField("max_absences", *req.MaxAbsences)
	}
	if req.SubjectStatus != nil {
		addField("subject_status", *req.SubjectStatus)
	}
	if req.StartDate != nil {
		addField("start_date", *req.StartDate)
	}
	if req.EndDate != nil {
		addField("end_date", *req.EndDate)
	}
	if req.ColorIdx != nil {
		addField("color_idx", *req.ColorIdx)
	}
	if req.Icon != nil {
		addField("icon", *req.Icon)
	}
	if req.Semester != nil {
		addField("semester", *req.Semester)
	}

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	args = append(args, id, user.ID)
	query := "UPDATE uni_subjects SET " + strings.Join(setClauses, ", ") +
		" WHERE id = $" + strconv.Itoa(len(args)-1) + " AND user_id = $" + strconv.Itoa(len(args)) +
		" RETURNING *"

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	materia, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err == pgx.ErrNoRows {
		c.JSON(http.StatusNotFound, gin.H{"error": "Matéria não encontrada"})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, materia)
}

// DELETE /api/university/subjects/:id — remove uma matéria
func (ctrl *SubjectsController) DeletarMateria(c *gin.Context) {
	user := middleware.CurrentUser(c)
	id := c.Param("id")

	_, err := ctrl.db.Exec(c.Request.Context(),
		"DELETE FROM uni_subjects WHERE id = $1 AND user_id = $2", id, user.ID,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
