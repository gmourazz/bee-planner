package config

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
)

// SupabaseClient encapsula as credenciais e expõe métodos para chamar a API REST do Supabase
type SupabaseClient struct {
	URL        string
	ServiceKey string
	AnonKey    string
	httpClient *http.Client
}

var Supabase *SupabaseClient

func InitSupabase() {
	Supabase = &SupabaseClient{
		URL:        os.Getenv("SUPABASE_URL"),
		ServiceKey: os.Getenv("SUPABASE_SERVICE_KEY"),
		AnonKey:    os.Getenv("SUPABASE_ANON_KEY"),
		httpClient: &http.Client{},
	}
}

// doRequest faz uma requisição autenticada com SERVICE_KEY (acesso total, sem RLS)
func (s *SupabaseClient) doRequest(method, path string, body any) ([]byte, int, error) {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		reqBody = bytes.NewReader(b)
	}

	url := s.URL + path
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("apikey", s.ServiceKey)
	req.Header.Set("Authorization", "Bearer "+s.ServiceKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, err
}

// doAuthRequest faz requisição para a Auth Admin API do Supabase
func (s *SupabaseClient) doAuthRequest(method, path string, body any) ([]byte, int, error) {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, 0, err
		}
		reqBody = bytes.NewReader(b)
	}

	url := s.URL + "/auth/v1" + path
	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("apikey", s.ServiceKey)
	req.Header.Set("Authorization", "Bearer "+s.ServiceKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, err
}

// RawRequest expõe doRequest publicamente para queries complexas
func (s *SupabaseClient) RawRequest(method, restPath string, body any) ([]byte, int, error) {
	return s.doRequest(method, "/rest/v1/"+restPath, body)
}

// AuthSignUp registra um novo usuário
func (s *SupabaseClient) AuthSignUp(payload any) ([]byte, int, error) {
	return s.doAuthRequest("POST", "/signup", payload)
}

// AuthSignIn autentica com email/senha
func (s *SupabaseClient) AuthSignIn(payload any) ([]byte, int, error) {
	return s.doAuthRequest("POST", "/token?grant_type=password", payload)
}

// GetUser valida um JWT e retorna os dados do usuário via Auth API
func (s *SupabaseClient) GetUser(token string) ([]byte, int, error) {
	req, err := http.NewRequest("GET", s.URL+"/auth/v1/user", nil)
	if err != nil {
		return nil, 0, err
	}
	req.Header.Set("apikey", s.AnonKey)
	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	return body, resp.StatusCode, err
}

// DeleteUser remove um usuário via Auth Admin API
func (s *SupabaseClient) DeleteUser(userID string) ([]byte, int, error) {
	return s.doAuthRequest("DELETE", "/admin/users/"+userID, nil)
}

// Upsert insere ou atualiza baseado na coluna de conflito
func (s *SupabaseClient) Upsert(table string, data any, conflictCol string) ([]byte, int, error) {
	b, err := json.Marshal(data)
	if err != nil {
		return nil, 0, err
	}

	path := fmt.Sprintf("%s/rest/v1/%s?on_conflict=%s", s.URL, table, conflictCol)
	req, err := http.NewRequest("POST", path, bytes.NewReader(b))
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("apikey", s.ServiceKey)
	req.Header.Set("Authorization", "Bearer "+s.ServiceKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "resolution=merge-duplicates,return=representation")

	resp, err := s.httpClient.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	return respBody, resp.StatusCode, err
}

// From monta um QueryBuilder para a tabela informada
func (s *SupabaseClient) From(table string) *QueryBuilder {
	return &QueryBuilder{client: s, table: table, filters: map[string]string{}}
}

// QueryBuilder permite encadear filtros antes de executar a query
type QueryBuilder struct {
	client  *SupabaseClient
	table   string
	filters map[string]string
	columns string
	orderBy []string
}

func (q *QueryBuilder) Select(columns string) *QueryBuilder {
	q.columns = columns
	return q
}

func (q *QueryBuilder) Eq(column, value string) *QueryBuilder {
	q.filters[column] = "eq." + value
	return q
}

func (q *QueryBuilder) Gte(column, value string) *QueryBuilder {
	q.filters[column] = "gte." + value
	return q
}

func (q *QueryBuilder) Order(column string, ascending bool) *QueryBuilder {
	dir := "asc"
	if !ascending {
		dir = "desc"
	}
	q.orderBy = append(q.orderBy, column+"."+dir)
	return q
}

func (q *QueryBuilder) buildFilters() string {
	var parts []string
	for col, filter := range q.filters {
		parts = append(parts, col+"="+filter)
	}
	if len(q.orderBy) > 0 {
		parts = append(parts, "order="+strings.Join(q.orderBy, ","))
	}
	return strings.Join(parts, "&")
}

func (q *QueryBuilder) Get() ([]byte, int, error) {
	cols := q.columns
	if cols == "" {
		cols = "*"
	}
	filters := q.buildFilters()
	path := fmt.Sprintf("/rest/v1/%s?select=%s", q.table, cols)
	if filters != "" {
		path += "&" + filters
	}
	return q.client.doRequest("GET", path, nil)
}

func (q *QueryBuilder) Insert(data any) ([]byte, int, error) {
	path := fmt.Sprintf("/rest/v1/%s", q.table)
	return q.client.doRequest("POST", path, data)
}

func (q *QueryBuilder) Update(data any) ([]byte, int, error) {
	filters := q.buildFilters()
	path := fmt.Sprintf("/rest/v1/%s", q.table)
	if filters != "" {
		path += "?" + filters
	}
	return q.client.doRequest("PATCH", path, data)
}

func (q *QueryBuilder) Delete() ([]byte, int, error) {
	filters := q.buildFilters()
	path := fmt.Sprintf("/rest/v1/%s", q.table)
	if filters != "" {
		path += "?" + filters
	}
	return q.client.doRequest("DELETE", path, nil)
}
