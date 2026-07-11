package integrations

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"

	"beeplanerofc/backend-go/internal/middleware"
)

type StatusController struct {
	db *pgxpool.Pool
}

func NewStatusController(db *pgxpool.Pool) *StatusController {
	return &StatusController{db: db}
}

// @Summary      Status das integrações
// @Tags         Integrations
// @Produce      json
// @Success      200 {object} map[string]bool
// @Security     BearerAuth
// @Router       /integrations/status [get]
func (ctrl *StatusController) Status(c *gin.Context) {
	user := middleware.CurrentUser(c)

	integ, err := getIntegration(c.Request.Context(), ctrl.db, user.ID)
	if err != nil {
		integ = &calendarIntegration{}
	}

	c.JSON(http.StatusOK, gin.H{
		"google":  integ.GoogleAccessToken != nil,
		"outlook": integ.OutlookAccessToken != nil,
	})
}
