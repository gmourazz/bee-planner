package health

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de saúde no grupo /api/health.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	// Rota pública — sync via iOS Shortcut (autenticação por sync_token no body)
	router.POST("/sync", ctrl.SyncFromShortcut)

	// Rotas autenticadas
	authed := router.Group("")
	authed.Use(middleware.RequireAuth(db, authClient))
	authed.GET("", ctrl.ListarLogs)
	authed.PUT("/:date", ctrl.UpsertLog)
	authed.GET("/sync-token", ctrl.GetSyncToken)
}
