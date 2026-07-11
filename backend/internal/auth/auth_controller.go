package auth

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"beeplanerofc/backend-go/internal/supabaseauth"
)

type Controller struct {
	authClient *supabaseauth.Client
}

func NewController(authClient *supabaseauth.Client) *Controller {
	return &Controller{authClient: authClient}
}

type registerRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
	Name     string `json:"name"`
	Phone    string `json:"phone"` // opcional — usuário pode cadastrar sem telefone
}

// @Summary      Cadastrar usuário
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        body body registerRequest true "Dados de cadastro"
// @Success      201 {object} map[string]interface{}
// @Failure      400 {object} map[string]string
// @Router       /auth/register [post]
func (ctrl *Controller) Register(c *gin.Context) {
	var req registerRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	user, err := ctrl.authClient.SignUp(req.Email, req.Password, map[string]any{
		"name":  req.Name,
		"phone": req.Phone,
	})
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"user": user})
}

type loginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

// @Summary      Login
// @Tags         Auth
// @Accept       json
// @Produce      json
// @Param        body body loginRequest true "Credenciais"
// @Success      200 {object} map[string]interface{}
// @Failure      401 {object} map[string]string
// @Router       /auth/login [post]
func (ctrl *Controller) Login(c *gin.Context) {
	var req loginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	user, session, err := ctrl.authClient.SignInWithPassword(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user, "session": session})
}

// @Summary      Logout
// @Tags         Auth
// @Produce      json
// @Success      200 {object} map[string]string
// @Router       /auth/logout [post]
func (ctrl *Controller) Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logout realizado com sucesso"})
}
