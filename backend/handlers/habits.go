package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gmourazz/bee-planner/config"
	"github.com/gmourazz/bee-planner/middleware"
)

// calcularSequencia conta dias consecutivos de conclusão a partir de hoje
func calcularSequencia(conclusoes []string) int {
	conjunto := make(map[string]bool)
	for _, d := range conclusoes {
		conjunto[d] = true
	}
	sequencia := 0
	hoje := time.Now()
	for {
		chave := hoje.Format("2006-01-02")
		if conjunto[chave] {
			sequencia++
			hoje = hoje.AddDate(0, 0, -1)
		} else {
			break
		}
	}
	return sequencia
}

// GET /api/habits
func ListHabits(c *gin.Context) {
	user := middleware.GetUser(c)

	habitsBody, status, err := config.Supabase.From("habits").
		Select("*").Eq("user_id", user.ID).Order("created_at", true).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao buscar hábitos"})
		return
	}

	var habitos []map[string]any
	if err := json.Unmarshal(habitsBody, &habitos); err != nil || len(habitos) == 0 {
		c.JSON(http.StatusOK, gin.H{"habits": []any{}})
		return
	}

	// Busca conclusões dos últimos 60 dias
	desde := time.Now().AddDate(0, 0, -60).Format("2006-01-02")
	compBody, _, _ := config.Supabase.From("habit_completions").
		Select("habit_id,date").Eq("user_id", user.ID).Gte("date", desde).Get()

	var completions []map[string]any
	json.Unmarshal(compBody, &completions)

	// Agrupa datas por habit_id
	porHabito := make(map[string][]string)
	for _, comp := range completions {
		hid, _ := comp["habit_id"].(string)
		date, _ := comp["date"].(string)
		porHabito[hid] = append(porHabito[hid], date)
	}

	resultado := make([]map[string]any, 0, len(habitos))
	for _, h := range habitos {
		id, _ := h["id"].(string)
		datas := porHabito[id]

		compMap := make(map[string]bool)
		for _, d := range datas {
			compMap[d] = true
		}

		resultado = append(resultado, map[string]any{
			"id":         id,
			"name":       h["name"],
			"iconKey":    h["icon_key"],
			"color":      h["color"],
			"completions": compMap,
			"streak":     calcularSequencia(datas),
			"created_at": h["created_at"],
		})
	}

	c.JSON(http.StatusOK, gin.H{"habits": resultado})
}

// POST /api/habits
func CreateHabit(c *gin.Context) {
	user := middleware.GetUser(c)

	var body struct {
		Name    string `json:"name" binding:"required"`
		IconKey string `json:"iconKey"`
		Color   string `json:"color"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O nome do hábito é obrigatório"})
		return
	}

	iconKey := body.IconKey
	if iconKey == "" {
		iconKey = "droplets"
	}
	color := body.Color
	if color == "" {
		color = "#3B82F6"
	}

	resp, status, err := config.Supabase.From("habits").Insert(map[string]any{
		"user_id":  user.ID,
		"name":     body.Name,
		"icon_key": iconKey,
		"color":    color,
	})
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao criar hábito"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Erro ao criar hábito"})
		return
	}
	d := rows[0]
	c.JSON(http.StatusCreated, gin.H{"habit": map[string]any{
		"id":          d["id"],
		"name":        d["name"],
		"iconKey":     d["icon_key"],
		"color":       d["color"],
		"completions": map[string]bool{},
		"streak":      0,
		"created_at":  d["created_at"],
	}})
}

// PUT /api/habits/:id
func UpdateHabit(c *gin.Context) {
	user := middleware.GetUser(c)
	habitID := c.Param("id")

	var body struct {
		Name    *string `json:"name"`
		IconKey *string `json:"iconKey"`
		Color   *string `json:"color"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]any{}
	if body.Name != nil    { updates["name"]     = *body.Name }
	if body.IconKey != nil { updates["icon_key"] = *body.IconKey }
	if body.Color != nil   { updates["color"]    = *body.Color }

	if len(updates) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar"})
		return
	}

	resp, status, err := config.Supabase.From("habits").
		Eq("id", habitID).Eq("user_id", user.ID).Update(updates)
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao atualizar hábito"})
		return
	}

	var rows []map[string]any
	json.Unmarshal(resp, &rows)
	if len(rows) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hábito não encontrado"})
		return
	}
	d := rows[0]
	c.JSON(http.StatusOK, gin.H{"habit": map[string]any{
		"id":      d["id"],
		"name":    d["name"],
		"iconKey": d["icon_key"],
		"color":   d["color"],
	}})
}

// DELETE /api/habits/:id
func DeleteHabit(c *gin.Context) {
	user := middleware.GetUser(c)
	habitID := c.Param("id")

	_, status, err := config.Supabase.From("habits").
		Eq("id", habitID).Eq("user_id", user.ID).Delete()
	if err != nil || status >= 400 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Erro ao remover hábito"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Hábito removido com sucesso"})
}

// POST /api/habits/:id/toggle
func ToggleHabit(c *gin.Context) {
	user := middleware.GetUser(c)
	habitID := c.Param("id")

	var body struct {
		Date string `json:"date" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "O campo date (YYYY-MM-DD) é obrigatório"})
		return
	}

	// Verifica se o hábito pertence ao usuário
	hBody, status, err := config.Supabase.From("habits").
		Select("id").Eq("id", habitID).Eq("user_id", user.ID).Get()
	if err != nil || status >= 400 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hábito não encontrado"})
		return
	}
	var habitos []map[string]any
	json.Unmarshal(hBody, &habitos)
	if len(habitos) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hábito não encontrado"})
		return
	}

	// Verifica se já existe conclusão nessa data
	existeBody, _, _ := config.Supabase.From("habit_completions").
		Select("id").Eq("habit_id", habitID).Eq("date", body.Date).Get()
	var existentes []map[string]any
	json.Unmarshal(existeBody, &existentes)

	if len(existentes) > 0 {
		existID := fmt.Sprintf("%v", existentes[0]["id"])
		config.Supabase.From("habit_completions").Eq("id", existID).Delete()
		c.JSON(http.StatusOK, gin.H{"completed": false, "date": body.Date})
	} else {
		config.Supabase.From("habit_completions").Insert(map[string]any{
			"habit_id": habitID,
			"user_id":  user.ID,
			"date":     body.Date,
		})
		c.JSON(http.StatusOK, gin.H{"completed": true, "date": body.Date})
	}
}
