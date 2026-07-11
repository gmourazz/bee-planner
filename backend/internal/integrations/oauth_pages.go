package integrations

import "fmt"

// oauthSuccessPage e oauthErrorPage geram a página que fecha o popup do OAuth
// e avisa a janela que abriu via postMessage. provider e frontendURL são sempre
// valores fixos do servidor (nunca vêm de input do usuário).
func oauthSuccessPage(provider, frontendURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'oauth_callback', provider: '%s', status: 'success' }, '%s');
    window.close();
  } else {
    window.location.href = '%s/datas?integration=%s&status=success';
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px">Conectado! Fechando...</p>
</body></html>`, provider, frontendURL, frontendURL, provider)
}

func oauthErrorPage(provider, frontendURL string) string {
	return fmt.Sprintf(`<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'oauth_callback', provider: '%s', status: 'error' }, '%s');
    window.close();
  } else {
    window.location.href = '%s/datas?integration=%s&status=error';
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px">Erro ao conectar. Fechando...</p>
</body></html>`, provider, frontendURL, frontendURL, provider)
}
