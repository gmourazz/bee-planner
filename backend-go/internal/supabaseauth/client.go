// Package supabaseauth chama a API REST do GoTrue (auth do Supabase).
// O cadastro/login de usuários não é uma tabela comum do Postgres — é gerenciado
// pelo serviço de auth do Supabase, então essas operações precisam ser feitas via REST,
// mesmo com o resto do backend acessando o Postgres direto via pgx.
package supabaseauth

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type Client struct {
	baseURL string
	anonKey string
}

func NewClient(supabaseURL, anonKey string) *Client {
	return &Client{baseURL: supabaseURL + "/auth/v1", anonKey: anonKey}
}

type AuthUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
}

type AuthSession struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
	TokenType    string `json:"token_type"`
}

type authError struct {
	Error            string `json:"error"`
	ErrorDescription string `json:"error_description"`
	Msg              string `json:"msg"`
}

func (c *Client) do(method, path string, body any, accessToken string) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewReader(b)
	}

	req, err := http.NewRequest(method, c.baseURL+path, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", c.anonKey)
	if accessToken != "" {
		req.Header.Set("Authorization", "Bearer "+accessToken)
	} else {
		req.Header.Set("Authorization", "Bearer "+c.anonKey)
	}

	return http.DefaultClient.Do(req)
}

// parseError extrai a mensagem de erro retornada pelo GoTrue
func parseError(resp *http.Response) string {
	defer resp.Body.Close()
	var e authError
	if err := json.NewDecoder(resp.Body).Decode(&e); err != nil {
		return fmt.Sprintf("erro inesperado da API de autenticação (status %d)", resp.StatusCode)
	}
	if e.ErrorDescription != "" {
		return e.ErrorDescription
	}
	if e.Msg != "" {
		return e.Msg
	}
	return e.Error
}

// SignUp cria um novo usuário. metadata vai para raw_user_meta_data (lido pelo trigger handle_new_user)
func (c *Client) SignUp(email, password string, metadata map[string]any) (*AuthUser, error) {
	resp, err := c.do(http.MethodPost, "/signup", map[string]any{
		"email":    email,
		"password": password,
		"data":     metadata,
	}, "")
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("%s", parseError(resp))
	}

	// Com a confirmação de e-mail desativada, o GoTrue retorna a sessão completa
	// (com o usuário aninhado em "user"); com confirmação ativa, retorna só o usuário no nível raiz.
	var result struct {
		AuthUser
		User *AuthUser `json:"user"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}
	if result.User != nil {
		return result.User, nil
	}
	return &result.AuthUser, nil
}

// SignInWithPassword autentica o usuário e retorna a sessão (access/refresh token)
func (c *Client) SignInWithPassword(email, password string) (*AuthUser, *AuthSession, error) {
	resp, err := c.do(http.MethodPost, "/token?grant_type=password", map[string]any{
		"email":    email,
		"password": password,
	}, "")
	if err != nil {
		return nil, nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, nil, fmt.Errorf("%s", parseError(resp))
	}

	var result struct {
		AuthSession
		User AuthUser `json:"user"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, nil, err
	}
	return &result.User, &result.AuthSession, nil
}

// GetUser valida o access token e retorna o usuário correspondente (equivalente a supabase.auth.getUser)
func (c *Client) GetUser(accessToken string) (*AuthUser, error) {
	resp, err := c.do(http.MethodGet, "/user", nil, accessToken)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("%s", parseError(resp))
	}

	var user AuthUser
	if err := json.NewDecoder(resp.Body).Decode(&user); err != nil {
		return nil, err
	}
	return &user, nil
}
