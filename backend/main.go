// @title           BeePlanner API
// @version         1.0
// @description     API do BeePlanner — autenticação via JWT (Bearer). Todas as rotas /api/* (exceto /auth) exigem o header Authorization: Bearer <token>.
// @host            localhost:3001
// @BasePath        /api
// @securityDefinitions.apikey BearerAuth
// @in              header
// @name            Authorization
// @description     Formato: Bearer <seu_jwt>

package main

import (
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	ginSwagger "github.com/swaggo/gin-swagger"
	swaggerFiles "github.com/swaggo/files"

	_ "beeplanerofc/backend-go/docs"
	"beeplanerofc/backend-go/internal/auth"
	"beeplanerofc/backend-go/internal/books"
	"beeplanerofc/backend-go/internal/config"
	"beeplanerofc/backend-go/internal/courses"
	"beeplanerofc/backend-go/internal/events"
	"beeplanerofc/backend-go/internal/finance"
	"beeplanerofc/backend-go/internal/goals"
	"beeplanerofc/backend-go/internal/habits"
	"beeplanerofc/backend-go/internal/health"
	"beeplanerofc/backend-go/internal/integrations"
	"beeplanerofc/backend-go/internal/notes"
	"beeplanerofc/backend-go/internal/profile"
	"beeplanerofc/backend-go/internal/supabaseauth"
	"beeplanerofc/backend-go/internal/university"
)

func main() {
	env := config.LoadEnv()

	db := config.NewDatabasePool(env.DatabaseURL)
	defer db.Close()

	authClient := supabaseauth.NewClient(env.SupabaseURL, env.SupabaseAnonKey)

	router := gin.Default()
	router.RedirectTrailingSlash = false // evita 301/307 em rotas tipo "/api/habits" (Express não faz isso)

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	api := router.Group("/api")

	// Rotas de autenticação (register, login, logout)
	auth.RegisterRoutes(api.Group("/auth"), authClient)

	// Rotas de perfil (ver perfil, editar, admin)
	profile.RegisterRoutes(api.Group("/profile"), db, authClient)

	// Rotas de hábitos (listar, criar, editar, deletar, toggle de conclusão)
	habits.RegisterRoutes(api.Group("/habits"), db, authClient)

	// Rotas de metas e objetivos (anuais e mensais)
	goals.RegisterRoutes(api.Group("/goals"), db, authClient)

	// Rotas de notas (listar, criar, editar, deletar, toggle pin)
	notes.RegisterRoutes(api.Group("/notes"), db, authClient)

	// Rotas de eventos do calendário (listar, criar, editar, deletar)
	events.RegisterRoutes(api.Group("/events"), db, authClient)

	// Rotas de livros lidos (listar, criar, deletar)
	books.RegisterRoutes(api.Group("/books"), db, authClient)

	// Rotas de cursos e certificações
	courses.RegisterRoutes(api.Group("/courses"), db, authClient)

	// Rotas universitárias (matérias, grade, provas)
	university.RegisterRoutes(api.Group("/university"), db, authClient)

	// Rotas financeiras (transações)
	finance.RegisterRoutes(api.Group("/finance"), db, authClient)

	// Rotas de saúde e bem-estar (log diário)
	health.RegisterRoutes(api.Group("/health"), db, authClient)

	// Integrações OAuth com Google Calendar e Outlook
	integrations.RegisterRoutes(api.Group("/integrations"), db, authClient, env)

	// Swagger UI em /swagger/index.html
	router.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	log.Printf("🚀 Backend Go rodando em http://localhost:%s\n", env.Port)
	log.Printf("📖 Swagger UI em http://localhost:%s/swagger/index.html\n", env.Port)
	if err := router.Run(":" + env.Port); err != nil {
		log.Fatalf("Erro ao iniciar o servidor: %v", err)
	}
}
