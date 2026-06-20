package university

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas universitárias no grupo /api/university. Todas exigem login.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	subjects := NewSubjectsController(db)
	schedule := NewScheduleController(db)
	exams := NewExamsController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	// Matérias
	router.GET("/subjects", subjects.ListarMaterias)
	router.POST("/subjects", subjects.CriarMateria)
	router.PUT("/subjects/:id", subjects.EditarMateria)
	router.DELETE("/subjects/:id", subjects.DeletarMateria)

	// Grade horária
	router.GET("/schedule", schedule.ListarGrade)
	router.POST("/schedule", schedule.CriarAula)
	router.DELETE("/schedule/:id", schedule.DeletarAula)

	// Provas
	router.GET("/exams", exams.ListarProvas)
	router.POST("/exams", exams.CriarProva)
	router.PATCH("/exams/:id", exams.ToggleProva)
	router.DELETE("/exams/:id", exams.DeletarProva)
}
