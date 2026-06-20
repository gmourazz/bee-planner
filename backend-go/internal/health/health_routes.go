package health

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de saúde no grupo /api/health. Todas exigem login.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	router.GET("", ctrl.ListarLogs)
	router.PUT("/:date", ctrl.UpsertLog)
}
