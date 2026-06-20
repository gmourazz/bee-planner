package profile

import (
	"fmt"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/dbutil"
	"beeplanerofc/backend-go/internal/middleware"
)

type Controller struct {
	db *pgxpool.Pool
}

func NewController(db *pgxpool.Pool) *Controller {
	return &Controller{db: db}
}

// GET /api/profile/me — retorna o perfil do usuário logado
func (ctrl *Controller) GetMyProfile(c *gin.Context) {
	user := middleware.CurrentUser(c)

	rows, err := ctrl.db.Query(c.Request.Context(), "SELECT * FROM profiles WHERE id = $1", user.ID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}

	profileData, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Perfil não encontrado"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": profileData})
}

type updateProfileRequest struct {
	Name      *string `json:"name"`
	Phone     *string `json:"phone"`
	AvatarURL *string `json:"avatar_url"`
	Bio       *string `json:"bio"`
	Birthdate *string `json:"birthdate"`
}

// PUT /api/profile/me — atualiza apenas os campos enviados do perfil logado.
// O campo "role" não pode ser alterado pelo próprio usuário.
func (ctrl *Controller) UpdateMyProfile(c *gin.Context) {
	user := middleware.CurrentUser(c)

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	setClauses := []string{}
	args := []any{}
	addField := func(column string, value *string) {
		if value == nil {
			return
		}
		args = append(args, *value)
		setClauses = append(setClauses, fmt.Sprintf("%s = $%d", column, len(args)))
	}

	addField("name", req.Name)
	addField("phone", req.Phone)
	addField("avatar_url", req.AvatarURL)
	addField("bio", req.Bio)
	addField("birthdate", req.Birthdate)

	if len(setClauses) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Nenhum campo para atualizar foi enviado"})
		return
	}

	args = append(args, user.ID)
	query := fmt.Sprintf(
		"UPDATE profiles SET %s WHERE id = $%d RETURNING *",
		strings.Join(setClauses, ", "), len(args),
	)

	rows, err := ctrl.db.Query(c.Request.Context(), query, args...)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profileData, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": profileData})
}

// GET /api/profile/all [somente admin] — lista todos os usuários
func (ctrl *Controller) GetAllProfiles(c *gin.Context) {
	rows, err := ctrl.db.Query(c.Request.Context(),
		"SELECT id, name, email, role, avatar_url, created_at FROM profiles ORDER BY created_at DESC",
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profiles, err := pgx.CollectRows(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"profiles": profiles})
}

type updateRoleRequest struct {
	Role string `json:"role"`
}

var rolesPermitidos = map[string]bool{"user": true, "pro": true, "admin": true}

// PUT /api/profile/:id/role [somente admin] — altera o papel de qualquer usuário
func (ctrl *Controller) UpdateUserRole(c *gin.Context) {
	id := c.Param("id")

	var req updateRoleRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dados inválidos"})
		return
	}

	if !rolesPermitidos[req.Role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Role inválido. Use: user, pro, admin"})
		return
	}

	rows, err := ctrl.db.Query(c.Request.Context(),
		"UPDATE profiles SET role = $1 WHERE id = $2 RETURNING *", req.Role, id,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	profileData, err := pgx.CollectOneRow(rows, dbutil.RowToMap)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"profile": profileData})
}
