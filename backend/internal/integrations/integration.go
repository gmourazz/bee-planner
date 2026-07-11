// Package integrations implementa as integrações OAuth com Google Calendar e Outlook.
package integrations

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type calendarIntegration struct {
	GoogleAccessToken   *string
	GoogleRefreshToken  *string
	GoogleTokenExpiry   *time.Time
	OutlookAccessToken  *string
	OutlookRefreshToken *string
	OutlookTokenExpiry  *time.Time
}

// getIntegration busca a linha de calendar_integrations do usuário.
// Retorna uma struct zerada (sem erro) se o usuário ainda não tem nenhuma integração.
func getIntegration(ctx context.Context, db *pgxpool.Pool, userID string) (*calendarIntegration, error) {
	var integ calendarIntegration
	err := db.QueryRow(ctx, `
		SELECT google_access_token, google_refresh_token, google_token_expiry,
		       outlook_access_token, outlook_refresh_token, outlook_token_expiry
		FROM calendar_integrations WHERE user_id = $1`, userID,
	).Scan(
		&integ.GoogleAccessToken, &integ.GoogleRefreshToken, &integ.GoogleTokenExpiry,
		&integ.OutlookAccessToken, &integ.OutlookRefreshToken, &integ.OutlookTokenExpiry,
	)
	if err == pgx.ErrNoRows {
		return &calendarIntegration{}, nil
	}
	if err != nil {
		return nil, err
	}
	return &integ, nil
}
