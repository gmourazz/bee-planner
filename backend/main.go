package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/handlers"
	"github.com/gmourazz/bee-planner/middleware"
	"github.com/joho/godotenv"
)

func main() {
	// Carrega variáveis de ambiente do .env
	if err := godotenv.Load("../.env"); err != nil {
		godotenv.Load(".env")
	}

	config.InitSupabase()

	port := os.Getenv("PORT")
	if port == "" {
		port = "3001"
	}

	r := gin.Default()

	// CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type,Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	api := r.Group("/api")

	// ── Auth — rotas públicas ─────────────────────────────────────────────────
	auth := api.Group("/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
		auth.POST("/logout", handlers.Logout)
	}

	// Callbacks OAuth — públicos (browser redireciona sem header de auth)
	api.GET("/integrations/google/callback", handlers.GoogleCallback)
	api.GET("/integrations/outlook/callback", handlers.OutlookCallback)

	// ── Rotas protegidas ──────────────────────────────────────────────────────
	p := api.Group("/", middleware.RequireAuth)
	{
		// Perfil
		profile := p.Group("/profile")
		{
			profile.GET("/me", handlers.GetMyProfile)
			profile.PUT("/me", handlers.UpdateMyProfile)
			profile.GET("/all", middleware.RequireAdmin, handlers.GetAllProfiles)
			profile.PUT("/:id/role", middleware.RequireAdmin, handlers.UpdateUserRole)
		}

		// Hábitos
		habits := p.Group("/habits")
		{
			habits.GET("", handlers.ListHabits)
			habits.POST("", handlers.CreateHabit)
			habits.PUT("/:id", handlers.UpdateHabit)
			habits.DELETE("/:id", handlers.DeleteHabit)
			habits.POST("/:id/toggle", handlers.ToggleHabit)
		}

		// Metas
		goals := p.Group("/goals")
		{
			goals.GET("", handlers.ListGoals)
			goals.POST("", handlers.CreateGoal)
			goals.PUT("/:id", handlers.UpdateGoal)
			goals.PATCH("/:id/progress", handlers.UpdateProgress)
			goals.DELETE("/:id", handlers.DeleteGoal)
		}

		// Notas
		notes := p.Group("/notes")
		{
			notes.GET("", handlers.ListNotes)
			notes.POST("", handlers.CreateNote)
			notes.PUT("/:id", handlers.UpdateNote)
			notes.DELETE("/:id", handlers.DeleteNote)
			notes.PATCH("/:id/pin", handlers.TogglePin)
		}

		// Eventos do calendário
		events := p.Group("/events")
		{
			events.GET("", handlers.ListEvents)
			events.POST("", handlers.CreateEvent)
			events.PUT("/:id", handlers.UpdateEvent)
			events.DELETE("/:id", handlers.DeleteEvent)
		}

		// Livros
		books := p.Group("/books")
		{
			books.GET("", handlers.ListBooks)
			books.POST("", handlers.CreateBook)
			books.DELETE("/:id", handlers.DeleteBook)
		}

		// Cursos e certificações
		courses := p.Group("/courses")
		{
			courses.GET("", handlers.ListCourses)
			courses.POST("", handlers.CreateCourse)
			courses.PUT("/:id", handlers.UpdateCourse)
			courses.DELETE("/:id", handlers.DeleteCourse)
		}

		// Universitário
		uni := p.Group("/university")
		{
			uni.GET("/subjects", handlers.ListSubjects)
			uni.POST("/subjects", handlers.CreateSubject)
			uni.PUT("/subjects/:id", handlers.UpdateSubject)
			uni.DELETE("/subjects/:id", handlers.DeleteSubject)

			uni.GET("/schedule", handlers.ListSchedule)
			uni.POST("/schedule", handlers.CreateClass)
			uni.DELETE("/schedule/:id", handlers.DeleteClass)

			uni.GET("/exams", handlers.ListExams)
			uni.POST("/exams", handlers.CreateExam)
			uni.PATCH("/exams/:id/toggle", handlers.ToggleExam)
			uni.DELETE("/exams/:id", handlers.DeleteExam)
		}

		// Finanças
		finance := p.Group("/finance")
		{
			finance.GET("", handlers.ListTransactions)
			finance.POST("", handlers.CreateTransaction)
			finance.PUT("/:id", handlers.UpdateTransaction)
			finance.DELETE("/:id", handlers.DeleteTransaction)
		}

		// Saúde
		health := p.Group("/health")
		{
			health.GET("", handlers.ListLogs)
			health.PUT("/:date", handlers.UpsertLog)
		}

		// Integrações (Google Calendar / Outlook)
		integrations := p.Group("/integrations")
		{
			integrations.GET("/status", handlers.IntegrationStatus)

			integrations.GET("/google/connect", handlers.GoogleConnect)
			integrations.POST("/google/disconnect", handlers.GoogleDisconnect)
			integrations.GET("/google/events", handlers.GoogleListEvents)
			integrations.POST("/google/events", handlers.GoogleCreateEvent)

			integrations.GET("/outlook/connect", handlers.OutlookConnect)
			integrations.POST("/outlook/disconnect", handlers.OutlookDisconnect)
			integrations.POST("/outlook/events", handlers.OutlookCreateEvent)
		}

		// Configurações
		settings := p.Group("/settings")
		{
			settings.GET("", handlers.GetSettings)
			settings.POST("", handlers.SaveSettings)
			settings.DELETE("/account", handlers.DeleteAccount)
		}
	}

	log.Printf("BeePlanner Go backend rodando em http://localhost:%s", port)
	r.Run(":" + port)
}
