package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// ── Matérias ──────────────────────────────────────────────────────────────────

// GET /api/university/subjects
func ListSubjects(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("uni_subjects").
		Select("*").Eq("user_id", user.ID).Order("created_at", true).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar matérias"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(body, &rows)
	if rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, rows)
}

// POST /api/university/subjects
func CreateSubject(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Name          string   `json:"name"`
		Professor     string   `json:"professor"`
		Credits       *int     `json:"credits"`
		Grade         *float64 `json:"grade"`
		Attendance    *float64 `json:"attendance"`
		Absences      *int     `json:"absences"`
		MaxAbsences   *int     `json:"max_absences"`
		SubjectStatus string   `json:"subject_status"`
		StartDate     string   `json:"start_date"`
		EndDate       string   `json:"end_date"`
		ColorIdx      *int     `json:"color_idx"`
		Icon          string   `json:"icon"`
		Semester      string   `json:"semester"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Name) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome obrigatório"})
		return
	}

	status_ := body.SubjectStatus
	if status_ == "" {
		status_ = "open"
	}
	absences := 0
	if body.Absences != nil {
		absences = *body.Absences
	}
	maxAbsences := 0
	if body.MaxAbsences != nil {
		maxAbsences = *body.MaxAbsences
	}

	resp, status, err := config.Supabase.From("uni_subjects").Insert(map[string]any{
		"user_id":        user.ID,
		"name":           strings.TrimSpace(body.Name),
		"professor":      body.Professor,
		"credits":        body.Credits,
		"grade":          body.Grade,
		"attendance":     body.Attendance,
		"absences":       absences,
		"max_absences":   maxAbsences,
		"subject_status": status_,
		"start_date":     nilIfEmpty(body.StartDate),
		"end_date":       nilIfEmpty(body.EndDate),
		"color_idx":      body.ColorIdx,
		"icon":           body.Icon,
		"semester":       body.Semester,
	})
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar matéria"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// PUT /api/university/subjects/:id
func UpdateSubject(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Name          *string  `json:"name"`
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
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Name != nil          { updates["name"]           = strings.TrimSpace(*body.Name) }
	if body.Professor != nil     { updates["professor"]      = *body.Professor }
	if body.Credits != nil       { updates["credits"]        = *body.Credits }
	if body.Grade != nil         { updates["grade"]          = *body.Grade }
	if body.Attendance != nil    { updates["attendance"]     = *body.Attendance }
	if body.Absences != nil      { updates["absences"]       = *body.Absences }
	if body.MaxAbsences != nil   { updates["max_absences"]   = *body.MaxAbsences }
	if body.SubjectStatus != nil { updates["subject_status"] = *body.SubjectStatus }
	if body.StartDate != nil     { updates["start_date"]     = nilIfEmpty(*body.StartDate) }
	if body.EndDate != nil       { updates["end_date"]       = nilIfEmpty(*body.EndDate) }
	if body.ColorIdx != nil      { updates["color_idx"]      = *body.ColorIdx }
	if body.Icon != nil          { updates["icon"]           = *body.Icon }
	if body.Semester != nil      { updates["semester"]       = *body.Semester }

	resp, status, err := config.Supabase.From("uni_subjects").
		Eq("id", id).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar matéria"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Matéria não encontrada"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// DELETE /api/university/subjects/:id
func DeleteSubject(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("uni_subjects").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar matéria"})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── Grade horária ─────────────────────────────────────────────────────────────

// GET /api/university/schedule
func ListSchedule(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("uni_schedule").
		Select("*").Eq("user_id", user.ID).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar grade"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(body, &rows)
	if rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, rows)
}

// POST /api/university/schedule
func CreateClass(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		SubjectName string `json:"subject_name"`
		Room        string `json:"room"`
		DayOfWeek   *int   `json:"day_of_week"`
		TimeStart   string `json:"time_start"`
		ColorIdx    *int   `json:"color_idx"`
		Semester    string `json:"semester"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.SubjectName) == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nome da matéria obrigatório"})
		return
	}

	resp, status, err := config.Supabase.From("uni_schedule").Insert(map[string]any{
		"user_id":      user.ID,
		"subject_name": strings.TrimSpace(body.SubjectName),
		"room":         body.Room,
		"day_of_week":  body.DayOfWeek,
		"time_start":   body.TimeStart,
		"color_idx":    body.ColorIdx,
		"semester":     body.Semester,
	})
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar aula"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// DELETE /api/university/schedule/:id
func DeleteClass(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("uni_schedule").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar aula"})
		return
	}
	c.Status(http.StatusNoContent)
}

// ── Provas ────────────────────────────────────────────────────────────────────

// GET /api/university/exams
func ListExams(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("uni_exams").
		Select("*").Eq("user_id", user.ID).Order("exam_date", true).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar provas"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(body, &rows)
	if rows == nil {
		rows = []map[string]any{}
	}
	c.JSON(http.StatusOK, rows)
}

// POST /api/university/exams
func CreateExam(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Subject     string `json:"subject"`
		ExamDate    string `json:"exam_date"`
		Type        string `json:"type"`
		Description string `json:"description"`
		Status      string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if strings.TrimSpace(body.Subject) == "" || body.ExamDate == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Matéria e data obrigatórias"})
		return
	}

	examStatus := body.Status
	if examStatus == "" {
		examStatus = "pending"
	}

	resp, status, err := config.Supabase.From("uni_exams").Insert(map[string]any{
		"user_id":     user.ID,
		"subject":     strings.TrimSpace(body.Subject),
		"exam_date":   body.ExamDate,
		"type":        body.Type,
		"description": body.Description,
		"status":      examStatus,
	})
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar prova"})
		return
	}
	c.JSON(http.StatusCreated, rows[0])
}

// PATCH /api/university/exams/:id/toggle
func ToggleExam(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	var body struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if body.Status != "pending" && body.Status != "done" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Status inválido"})
		return
	}

	resp, status, err := config.Supabase.From("uni_exams").
		Eq("id", id).Eq("user_id", user.ID).Update(map[string]any{"status": body.Status})
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao atualizar prova"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Prova não encontrada"})
		return
	}
	c.JSON(http.StatusOK, rows[0])
}

// DELETE /api/university/exams/:id
func DeleteExam(c *gin.Context) {
	user := middleware.GetUser(c)
	id := c.Param("id")

	_, status, err := config.Supabase.From("uni_exams").
		Eq("id", id).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar prova"})
		return
	}
	c.Status(http.StatusNoContent)
}
