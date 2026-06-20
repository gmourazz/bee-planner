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

// GET /api/integrations/status — diz se o usuário tem Google/Outlook conectados
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
