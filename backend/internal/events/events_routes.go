package events

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de eventos no grupo /api/events. Todas exigem login.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	router.GET("", ctrl.ListarEventos)
	router.POST("", ctrl.CriarEvento)
	router.PUT("/:id", ctrl.EditarEvento)
	router.DELETE("/:id", ctrl.DeletarEvento)
}
