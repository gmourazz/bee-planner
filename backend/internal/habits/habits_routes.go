package habits

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de hábitos no grupo /api/habits. Todas exigem login.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	router.GET("", ctrl.ListarHabitos)
	router.POST("", ctrl.CriarHabito)
	router.PUT("/:id", ctrl.EditarHabito)
	router.DELETE("/:id", ctrl.DeletarHabito)
	router.POST("/:id/toggle", ctrl.ToggleConclusao)
}
