package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/supabaseauth"
)

// AuthenticatedUser fica disponível em c.Get("user") nas rotas protegidas
type AuthenticatedUser struct {
	ID    string
	Email string
	Role  string
}

// RequireAuth valida o token Bearer com o GoTrue e busca o role na tabela profiles
func RequireAuth(db *pgxpool.Pool, authClient *supabaseauth.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token de autenticação não fornecido"})
			return
		}

		token := strings.TrimPrefix(authHeader, "Bearer ")

		authUser, err := authClient.GetUser(token)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado"})
			return
		}

		role := "user"
		err = db.QueryRow(context.Background(),
			"SELECT role FROM profiles WHERE id = $1", authUser.ID,
		).Scan(&role)
		if err != nil {
			role = "user"
		}

		c.Set("user", &AuthenticatedUser{
			ID:    authUser.ID,
			Email: authUser.Email,
			Role:  role,
		})

		c.Next()
	}
}

// RequireAdmin só deixa passar se o usuário autenticado for admin
func RequireAdmin(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists || user.(*AuthenticatedUser).Role != "admin" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Acesso restrito a administradores"})
		return
	}
	c.Next()
}

// CurrentUser extrai o usuário autenticado do contexto (usar dentro dos handlers)
func CurrentUser(c *gin.Context) *AuthenticatedUser {
	user, _ := c.Get("user")
	if user == nil {
		return nil
	}
	return user.(*AuthenticatedUser)
}
