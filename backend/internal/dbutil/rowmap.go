// Package dbutil tem helpers compartilhados para ler resultados do pgx
// no mesmo formato que o frontend já espera (vindo do PostgREST/supabase-js).
package dbutil

import (
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// RowToMap funciona como pgx.RowToMap, mas formata colunas UUID como string
// (o pgx decodifica como [16]byte por padrão, o que viraria array de números no JSON)
// e colunas DATE como "AAAA-MM-DD" (o pgx decodifica como time.Time, que serializa
// com horário incluído).
func RowToMap(row pgx.CollectableRow) (map[string]any, error) {
	raw, err := pgx.RowToMap(row)
	if err != nil {
		return nil, err
	}

	for _, field := range row.FieldDescriptions() {
		key := string(field.Name)
		value := raw[key]
		if value == nil {
			continue
		}

		switch field.DataTypeOID {
		case pgtype.UUIDOID:
			if b, ok := value.([16]byte); ok {
				raw[key] = formatUUID(b)
			}
		case pgtype.DateOID:
			if t, ok := value.(time.Time); ok {
				raw[key] = t.Format("2006-01-02")
			}
		}
	}

	return raw, nil
}

func formatUUID(b [16]byte) string {
	return fmt.Sprintf("%x-%x-%x-%x-%x", b[0:4], b[4:6], b[6:8], b[8:10], b[10:16])
}
