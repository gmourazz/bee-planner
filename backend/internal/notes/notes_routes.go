package notes

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de notas no grupo /api/notes. Todas exigem login.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	router.GET("", ctrl.ListarNotas)
	router.POST("", ctrl.CriarNota)
	router.PUT("/:id", ctrl.EditarNota)
	router.DELETE("/:id", ctrl.DeletarNota)
	router.PATCH("/:id/pin", ctrl.TogglePin)
}
