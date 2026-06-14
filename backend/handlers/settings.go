package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

var defaultMenu = map[string]bool{
	"home": true, "dashboard": true, "week": true, "habits": true,
	"dates": true, "notes": true, "books": true, "courses": true,
	"university": true, "finance": true, "health": true, "goals": true,
}

var defaultNotif = map[string]bool{
	"tasks": true, "habits": true, "exams": true, "birthdays": true, "certificates": true,
}

// GET /api/settings
func GetSettings(c *gin.Context) {
	user := middleware.GetUser(c)

	body, status, err := config.Supabase.From("user_settings").
		Select("*").Eq("user_id", user.ID).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao buscar configurações"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(body, &rows)

	if len(rows) == 0 {
		c.JSON(http.StatusOK, gin.H{
			"menu_visibility": defaultMenu,
			"notifications":   defaultNotif,
		})
		return
	}

	d := rows[0]
	menuVis := d["menu_visibility"]
	notifs := d["notifications"]
	if menuVis == nil {
		menuVis = defaultMenu
	}
	if notifs == nil {
		notifs = defaultNotif
	}
	c.JSON(http.StatusOK, gin.H{
		"menu_visibility": menuVis,
		"notifications":   notifs,
	})
}

// POST /api/settings
func SaveSettings(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		MenuVisibility map[string]bool `json:"menu_visibility"`
		Notifications  map[string]bool `json:"notifications"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	payload := map[string]any{
		"user_id":    user.ID,
		"updated_at": time.Now().UTC().Format(time.RFC3339),
	}
	if body.MenuVisibility != nil { payload["menu_visibility"] = body.MenuVisibility }
	if body.Notifications != nil  { payload["notifications"]   = body.Notifications }

	resp, status, err := config.Supabase.Upsert("user_settings", payload, "user_id")
	if err != nil || status >= 400 {
		var errResp map[string]any
		json.Unmarshal(resp, &errResp)
		c.JSON(http.StatusInternalServerError, errResp)
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao salvar configurações"})
		return
	}

	d := rows[0]
	menuVis := d["menu_visibility"]
	notifs := d["notifications"]
	if menuVis == nil { menuVis = defaultMenu }
	if notifs == nil  { notifs = defaultNotif }
	c.JSON(http.StatusOK, gin.H{
		"menu_visibility": menuVis,
		"notifications":   notifs,
	})
}

// DELETE /api/settings/account
func DeleteAccount(c *gin.Context) {
	user := middleware.GetUser(c)

	_, status, err := config.Supabase.DeleteUser(user.ID)
	if err != nil || status >= 400 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao deletar conta"})
		return
	}
	c.Status(http.StatusNoContent)
}
