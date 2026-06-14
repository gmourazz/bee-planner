package middleware

import (
	"encoding/json"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
)

type UserClaims struct {
	ID    string
	Email string
	Role  string
}

const UserKey = "user"

// RequireAuth valida o JWT Bearer e injeta os dados do usuário no contexto
func RequireAuth(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if !strings.HasPrefix(authHeader, "Bearer ") {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token de autenticação não fornecido"})
		return
	}

	token := strings.TrimPrefix(authHeader, "Bearer ")

	// Valida o token com a Auth API do Supabase
	body, status, err := config.Supabase.GetUser(token)
	if err != nil || status != http.StatusOK {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido ou expirado"})
		return
	}

	var userResp struct {
		ID    string `json:"id"`
		Email string `json:"email"`
	}
	if err := json.Unmarshal(body, &userResp); err != nil || userResp.ID == "" {
		c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
		return
	}

	// Busca o role do perfil
	profileBody, _, _ := config.Supabase.From("profiles").
		Select("role").
		Eq("id", userResp.ID).
		Get()

	role := "user"
	var profiles []struct {
		Role string `json:"role"`
	}
	if json.Unmarshal(profileBody, &profiles) == nil && len(profiles) > 0 {
		role = profiles[0].Role
	}

	c.Set(UserKey, UserClaims{
		ID:    userResp.ID,
		Email: userResp.Email,
		Role:  role,
	})
	c.Next()
}

// RequireAdmin bloqueia quem não for admin
func RequireAdmin(c *gin.Context) {
	user := GetUser(c)
	if user.Role != "admin" {
		c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Acesso restrito a administradores"})
		return
	}
	c.Next()
}

// GetUser extrai o usuário autenticado do contexto
func GetUser(c *gin.Context) UserClaims {
	val, _ := c.Get(UserKey)
	u, _ := val.(UserClaims)
	return u
}
