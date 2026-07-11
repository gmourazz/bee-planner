package integrations

import (
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/config"
	"beeplanerofc/backend-go/internal/middleware"
	"beeplanerofc/backend-go/internal/supabaseauth"
)

// RegisterRoutes registra as rotas de integrações no grupo /api/integrations.
// Os callbacks OAuth (google/callback, outlook/callback) são públicos — o provedor
// redireciona pra lá sem token, a identidade do usuário vem do "state" codificado.
func RegisterRoutes(router *gin.RouterGroup, db *pgxpool.Pool, authClient *supabaseauth.Client, env *config.Env) {
	auth := middleware.RequireAuth(db, authClient)

	status := NewStatusController(db)
	google := NewGoogleController(db, env)
	outlook := NewOutlookController(db, env)

	router.GET("/status", auth, status.Status)

	router.GET("/google/connect", auth, google.Connect)
	router.GET("/google/callback", google.Callback)
	router.DELETE("/google", auth, google.Disconnect)
	router.GET("/google/events", auth, google.ListEvents)
	router.POST("/google/events", auth, google.CreateEvent)

	router.GET("/outlook/connect", auth, outlook.Connect)
	router.GET("/outlook/callback", outlook.Callback)
	router.DELETE("/outlook", auth, outlook.Disconnect)
	router.POST("/outlook/events", auth, outlook.CreateEvent)
}
