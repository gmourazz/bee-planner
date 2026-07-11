package config

import (
	"context"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"
)

// NewDatabasePool cria o pool de conexões direto com o Postgres do Supabase
func NewDatabasePool(databaseURL string) *pgxpool.Pool {
	pool, err := pgxpool.New(context.Background(), databaseURL)
	if err != nil {
		log.Fatalf("Erro ao conectar no Postgres: %v", err)
	}

	if err := pool.Ping(context.Background()); err != nil {
		log.Fatalf("Erro ao verificar conexão com o Postgres: %v", err)
	}

	return pool
}
