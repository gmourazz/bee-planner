package auth

import (
	"github.com/gin-gonic/gin"

	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de autenticação (register, login, logout) no grupo /api/auth
func RegisterRoutes(router *gin.RouterGroup, authClient *supabaseauth.Client) {
	ctrl := NewController(authClient)

	router.POST("/register", ctrl.Register)
	router.POST("/login", ctrl.Login)
	router.POST("/logout", ctrl.Logout)
}
