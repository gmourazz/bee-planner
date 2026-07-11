package profile

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de perfil no grupo /api/profile.
// Todas exigem login (requireAuth); /all e /:id/role exigem admin.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client) {
	ctrl := NewController(db)

	router.Use(middleware.RequireAuth(db, authClient))

	router.GET("/me", ctrl.GetMyProfile)
	router.PUT("/me", ctrl.UpdateMyProfile)
	router.GET("/all", middleware.RequireAdmin, ctrl.GetAllProfiles)
	router.PUT("/:id/role", middleware.RequireAdmin, ctrl.UpdateUserRole)
}
