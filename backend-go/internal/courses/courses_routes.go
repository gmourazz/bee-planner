package courses

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de cursos no grupo /api/courses. Todas exigem login.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	router.GET("", ctrl.ListarCursos)
	router.POST("", ctrl.CriarCurso)
	router.PUT("/:id", ctrl.EditarCurso)
	router.DELETE("/:id", ctrl.DeletarCurso)
}
