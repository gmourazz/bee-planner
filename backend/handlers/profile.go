package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// GET /api/profile/me
func GetMyProfile(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("profiles").
		Select("*").Eq("id", user.ID).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}

	var profiles []map[string]any
	if err := json.Unmarshal(body, &profiles); err != nil || len(profiles) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"profile": profiles[0]})
}

// PUT /api/profile/me
func UpdateMyProfile(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Name      *string `json:"name"`
		Phone     *string `json:"phone"`
		AvatarURL *string `json:"avatar_url"`
		Bio       *string `json:"bio"`
		Birthdate *string `json:"birthdate"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Name != nil      { updates["name"]       = *body.Name }
	if body.Phone != nil     { updates["phone"]      = *body.Phone }
	if body.AvatarURL != nil { updates["avatar_url"] = *body.AvatarURL }
	if body.Bio != nil       { updates["bio"]        = *body.Bio }
	if body.Birthdate != nil { updates["birthdate"]  = *body.Birthdate }

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	resp, status, err := config.Supabase.From("profiles").
		Eq("id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusBadRequest, errResp)
		return
	}

	var profiles []map[string]any
	json.Unmarshal(resp, &profiles)
	if len(profiles) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"profile": profiles[0]})
}

// GET /api/profile/all  [admin]
func GetAllProfiles(c *gin.Context) {
	body, status, err := config.Supabase.From("profiles").
		Select("id,name,email,role,avatar_url,created_at").
		Order("created_at", false).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao buscar perfis"})
		return
	}

	var profiles []map[string]any
	json.Unmarshal(body, &profiles)
	c.JSON(http.StatusOK, gin.H{"profiles": profiles})
}

// PUT /api/profile/:id/role  [admin]
func UpdateUserRole(c *gin.Context) {
	id := c.Param("id")

	var body struct {
		Role string `json:"role" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	allowed := map[string]bool{"user": true, "pro": true, "admin": true}
	if !allowed[body.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role inválido. Use: user, pro, admin"})
		return
	}

	resp, status, err := config.Supabase.From("profiles").
		Eq("id", id).Update(map[string]any{"role": body.Role})
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusBadRequest, errResp)
		return
	}

	var profiles []map[string]any
	json.Unmarshal(resp, &profiles)
	if len(profiles) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"profile": profiles[0]})
}
