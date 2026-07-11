package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Env guarda as variáveis de ambiente carregadas do .env
type Env struct {
	Port                  string
	SupabaseURL           string
	SupabaseAnonKey       string
	SupabaseServiceKey    string
	DatabaseURL           string
	FrontendURL           string
	BackendURL            string
	GoogleClientID        string
	GoogleClientSecret    string
	MicrosoftClientID     string
	MicrosoftClientSecret string
}

// LoadEnv lê o arquivo .env (se existir) e retorna as variáveis necessárias
func LoadEnv() *Env {
	if err := godotenv.Load(); err != nil {
		log.Println("Aviso: arquivo .env não encontrado, usando variáveis do sistema")
	}

	return &Env{
		Port:                  getEnv("PORT", "3001"),
		SupabaseURL:           os.Getenv("SUPABASE_URL"),
		SupabaseAnonKey:       os.Getenv("SUPABASE_ANON_KEY"),
		SupabaseServiceKey:    os.Getenv("SUPABASE_SERVICE_KEY"),
		DatabaseURL:           os.Getenv("DATABASE_URL"),
		FrontendURL:           getEnv("FRONTEND_URL", "http://localhost:5173"),
		BackendURL:            getEnv("BACKEND_URL", "http://localhost:3001"),
		GoogleClientID:        os.Getenv("GOOGLE_CLIENT_ID"),
		GoogleClientSecret:    os.Getenv("GOOGLE_CLIENT_SECRET"),
		MicrosoftClientID:     os.Getenv("MICROSOFT_CLIENT_ID"),
		MicrosoftClientSecret: os.Getenv("MICROSOFT_CLIENT_SECRET"),
	}
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
