package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
)

// POST /api/auth/register
func Register(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=6"`
		Name     string `json:"name"`
		Phone    string `json:"phone"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload := map[string]any{
		"email":    body.Email,
		"password": body.Password,
		"data":     map[string]any{"name": body.Name, "phone": body.Phone},
	}
	resp, status, err := config.Supabase.AuthSignUp(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(status, errResp)
		return
	}

	var result map[string]any
	json.Unmarshal(resp, &result)
	c.JSON(http.StatusCreated, gin.H{"user": result["user"]})
}

// POST /api/auth/login
func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload := map[string]any{"email": body.Email, "password": body.Password}
	resp, status, err := config.Supabase.AuthSignIn(payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusUnauthorized, errResp)
		return
	}

	var result map[string]any
	json.Unmarshal(resp, &result)
	c.JSON(http.StatusOK, gin.H{"user": result["user"], "session": result["session"]})
}

// POST /api/auth/logout
func Logout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Logout realizado com sucesso"})
}
