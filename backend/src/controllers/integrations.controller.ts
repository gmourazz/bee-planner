import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

const FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:5173'
const BACKEND_URL  = process.env.BACKEND_URL  ?? 'http://localhost:3001'

// ── Google Calendar ──────────────────────────────────────────────────────────

const GOOGLE_CLIENT_ID     = process.env.GOOGLE_CLIENT_ID     ?? ''
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET ?? ''
const GOOGLE_REDIRECT_URI  = `${BACKEND_URL}/api/integrations/google/callback`

const GOOGLE_SCOPES        = 'https://www.googleapis.com/auth/calendar'

// Retorna a URL de autorização do Google OAuth
export async function googleConnect(req: Request, res: Response) {
  if (!GOOGLE_CLIENT_ID) {
    return res.status(503).json({ error: 'GOOGLE_CLIENT_ID não configurado no servidor' })
  }

  // Codifica o user_id no "state" para recuperar após o callback
  const state = Buffer.from(req.user!.id).toString('base64')

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth')
  url.searchParams.set('client_id',     GOOGLE_CLIENT_ID)
  url.searchParams.set('redirect_uri',  GOOGLE_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope',         GOOGLE_SCOPES)
  url.searchParams.set('access_type',   'offline')
  url.searchParams.set('prompt',        'consent')
  url.searchParams.set('state',         state)

  res.json({ url: url.toString() })
}

// Callback que o Google redireciona após aprovação
export async function googleCallback(req: Request, res: Response) {
  const { code, state, error } = req.query as Record<string, string>

  if (error || !code || !state) {
    return res.redirect(`${FRONTEND_URL}/datas?integration=google&status=error`)
  }

  const userId = Buffer.from(state, 'base64').toString('utf8')

  try {
    // Troca o code por tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id:     GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri:  GOOGLE_REDIRECT_URI,
        grant_type:    'authorization_code',
      }),
    })

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }

    if (!tokens.access_token) {
      console.error('[Google OAuth] Resposta do token:', JSON.stringify(tokens))
      throw new Error('Token inválido')
    }

    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    const { error: dbError } = await supabase.from('calendar_integrations').upsert({
      user_id:              userId,
      google_access_token:  tokens.access_token,
      google_refresh_token: tokens.refresh_token ?? null,
      google_token_expiry:  expiry,
      updated_at:           new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (dbError) {
      console.error('[Google OAuth] Erro ao salvar no banco:', dbError)
      throw new Error(dbError.message)
    }

    console.log('[Google OAuth] Conectado com sucesso para userId:', userId)
    res.send(oauthSuccessPage('google', FRONTEND_URL))
  } catch (err) {
    console.error('[Google OAuth] Erro no callback:', err)
    res.send(oauthErrorPage('google', FRONTEND_URL))
  }
}

// Desconecta a integração com Google
export async function googleDisconnect(req: Request, res: Response) {
  await supabase.from('calendar_integrations').update({
    google_access_token:  null,
    google_refresh_token: null,
    google_token_expiry:  null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', req.user!.id)

  res.json({ ok: true })
}

// Lista eventos do Google Calendar do usuário (30 dias para trás e 90 para frente)
export async function googleListEvents(req: Request, res: Response) {
  const { data: integration } = await supabase
    .from('calendar_integrations')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('user_id', req.user!.id)
    .single()

  if (!integration?.google_access_token) return res.json([])

  const accessToken = await getValidGoogleToken(integration, req.user!.id)

  const timeMin = new Date()
  timeMin.setDate(timeMin.getDate() - 30)
  const timeMax = new Date()
  timeMax.setDate(timeMax.getDate() + 90)
  const params = `timeMin=${timeMin.toISOString()}&timeMax=${timeMax.toISOString()}&singleEvents=true&orderBy=startTime&maxResults=250`

  // Busca todos os calendários da conta para não perder eventos fora do "primary"
  let calendarIds: string[] = ['primary']
  try {
    const listRes = await fetch(
      'https://www.googleapis.com/calendar/v3/users/me/calendarList?minAccessRole=reader',
      { headers: { Authorization: `Bearer ${accessToken}` } },
    )
    if (listRes.ok) {
      const listData = await listRes.json() as { items?: Array<{ id: string }> }
      calendarIds = (listData.items ?? []).map(c => c.id)
    }
  } catch { /* usa só primary se falhar */ }

  // Busca eventos de todos os calendários em paralelo
  const arrays = await Promise.all(
    calendarIds.map(async (calId) => {
      try {
        const r = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calId)}/events?${params}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        )
        if (!r.ok) return []
        const d = await r.json() as { items?: any[] }
        return d.items ?? []
      } catch { return [] }
    }),
  )

  // Deduplica por ID (evento compartilhado pode aparecer em mais de um calendário)
  const seen = new Set<string>()
  const events = arrays
    .flat()
    .filter((e: any) => {
      if (!e.start?.date && !e.start?.dateTime) return false
      if (seen.has(e.id)) return false
      seen.add(e.id)
      // Ignora eventos criados pelo BeePlanner — já existem nos eventos locais
      if ((e.summary ?? '').startsWith('[BeePlanner]')) return false
      return true
    })
    .map((e: any) => ({
      id:     `google_${e.id}`,
      title:  e.summary ?? '(sem título)',
      date:   (e.start.date ?? e.start.dateTime?.split('T')[0]) as string,
      type:   'Google Agenda',
      source: 'google',
    }))

  res.setHeader('Cache-Control', 'no-store')
  res.json(events)
}

// Cria um evento no Google Calendar do usuário
export async function googleCreateEvent(req: Request, res: Response) {
  const { title, date, type } = req.body

  const { data: integration } = await supabase
    .from('calendar_integrations')
    .select('google_access_token, google_refresh_token, google_token_expiry')
    .eq('user_id', req.user!.id)
    .single()

  if (!integration?.google_access_token) {
    return res.status(400).json({ error: 'Google Calendar não conectado' })
  }

  const accessToken = await getValidGoogleToken(integration, req.user!.id)

  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 1)

  const gcalRes = await fetch(
    'https://www.googleapis.com/calendar/v3/calendars/primary/events',
    {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary:     `[BeePlanner] ${title}`,
        description: `Categoria: ${type}`,
        start: { date },
        end:   { date: endDate.toISOString().split('T')[0] },
      }),
    },
  )

  if (!gcalRes.ok) {
    const err = await gcalRes.json()
    return res.status(500).json({ error: err.error?.message ?? 'Erro ao criar evento no Google' })
  }

  res.json({ ok: true })
}

// ── Outlook (Microsoft Graph) ────────────────────────────────────────────────

const MICROSOFT_CLIENT_ID     = process.env.MICROSOFT_CLIENT_ID     ?? ''
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET ?? ''
const MICROSOFT_REDIRECT_URI  = `${BACKEND_URL}/api/integrations/outlook/callback`
const MICROSOFT_TENANT        = 'common'
const MICROSOFT_SCOPES        = 'Calendars.ReadWrite offline_access'

// Retorna a URL de autorização da Microsoft
export async function outlookConnect(req: Request, res: Response) {
  if (!MICROSOFT_CLIENT_ID) {
    return res.status(503).json({ error: 'MICROSOFT_CLIENT_ID não configurado no servidor' })
  }

  const state = Buffer.from(req.user!.id).toString('base64')

  const url = new URL(`https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/authorize`)
  url.searchParams.set('client_id',     MICROSOFT_CLIENT_ID)
  url.searchParams.set('redirect_uri',  MICROSOFT_REDIRECT_URI)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope',         MICROSOFT_SCOPES)
  url.searchParams.set('response_mode', 'query')
  url.searchParams.set('state',         state)

  res.json({ url: url.toString() })
}

// Callback da Microsoft
export async function outlookCallback(req: Request, res: Response) {
  const { code, state, error } = req.query as Record<string, string>

  if (error || !code || !state) {
    return res.redirect(`${FRONTEND_URL}/datas?integration=outlook&status=error`)
  }

  const userId = Buffer.from(state, 'base64').toString('utf8')

  try {
    const tokenRes = await fetch(
      `https://login.microsoftonline.com/${MICROSOFT_TENANT}/oauth2/v2.0/token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code,
          client_id:     MICROSOFT_CLIENT_ID,
          client_secret: MICROSOFT_CLIENT_SECRET,
          redirect_uri:  MICROSOFT_REDIRECT_URI,
          grant_type:    'authorization_code',
          scope:         MICROSOFT_SCOPES,
        }),
      },
    )

    const tokens = await tokenRes.json() as {
      access_token: string
      refresh_token?: string
      expires_in: number
    }

    if (!tokens.access_token) throw new Error('Token inválido')

    const expiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

    await supabase.from('calendar_integrations').upsert({
      user_id:               userId,
      outlook_access_token:  tokens.access_token,
      outlook_refresh_token: tokens.refresh_token ?? null,
      outlook_token_expiry:  expiry,
      updated_at:            new Date().toISOString(),
    }, { onConflict: 'user_id' })

    res.send(oauthSuccessPage('outlook', FRONTEND_URL))
  } catch {
    res.send(oauthErrorPage('outlook', FRONTEND_URL))
  }
}

// Desconecta o Outlook
export async function outlookDisconnect(req: Request, res: Response) {
  await supabase.from('calendar_integrations').update({
    outlook_access_token:  null,
    outlook_refresh_token: null,
    outlook_token_expiry:  null,
    updated_at: new Date().toISOString(),
  }).eq('user_id', req.user!.id)

  res.json({ ok: true })
}

// Cria um evento no Outlook Calendar do usuário
export async function outlookCreateEvent(req: Request, res: Response) {
  const { title, date, type } = req.body

  const { data: integration } = await supabase
    .from('calendar_integrations')
    .select('outlook_access_token, outlook_refresh_token, outlook_token_expiry')
    .eq('user_id', req.user!.id)
    .single()

  if (!integration?.outlook_access_token) {
    return res.status(400).json({ error: 'Outlook não conectado' })
  }

  const startDt = `${date}T00:00:00`
  const endDate = new Date(date)
  endDate.setDate(endDate.getDate() + 1)
  const endDt = `${endDate.toISOString().split('T')[0]}T00:00:00`

  const graphRes = await fetch('https://graph.microsoft.com/v1.0/me/events', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${integration.outlook_access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      subject:  `[BeePlanner] ${title}`,
      body:     { contentType: 'text', content: `Categoria: ${type}` },
      start:    { dateTime: startDt, timeZone: 'UTC' },
      end:      { dateTime: endDt,   timeZone: 'UTC' },
      isAllDay: true,
    }),
  })

  if (!graphRes.ok) {
    const err = await graphRes.json()
    return res.status(500).json({ error: err.error?.message ?? 'Erro ao criar evento no Outlook' })
  }

  res.json({ ok: true })
}

// ── Status das integrações ───────────────────────────────────────────────────

export async function integrationStatus(req: Request, res: Response) {
  const { data } = await supabase
    .from('calendar_integrations')
    .select('google_access_token, outlook_access_token')
    .eq('user_id', req.user!.id)
    .single()

  res.json({
    google:  !!data?.google_access_token,
    outlook: !!data?.outlook_access_token,
  })
}

// ── Helper: renova token Google se expirado ──────────────────────────────────

async function getValidGoogleToken(
  integration: { google_access_token: string; google_refresh_token: string | null; google_token_expiry: string | null },
  userId: string,
): Promise<string> {
  const expiry = integration.google_token_expiry ? new Date(integration.google_token_expiry) : null
  const isExpired = expiry ? expiry.getTime() < Date.now() + 60_000 : false

  if (!isExpired) return integration.google_access_token

  if (!integration.google_refresh_token) return integration.google_access_token

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: integration.google_refresh_token,
      grant_type:    'refresh_token',
    }),
  })

  const tokens = await tokenRes.json() as { access_token: string; expires_in: number }
  if (!tokens.access_token) return integration.google_access_token

  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  await supabase.from('calendar_integrations').update({
    google_access_token: tokens.access_token,
    google_token_expiry: newExpiry,
    updated_at: new Date().toISOString(),
  }).eq('user_id', userId)

  return tokens.access_token
}

// ── Páginas HTML de callback OAuth (postMessage → fecha popup) ───────────────

function oauthSuccessPage(provider: string, frontendUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'oauth_callback', provider: '${provider}', status: 'success' }, '${frontendUrl}');
    window.close();
  } else {
    window.location.href = '${frontendUrl}/datas?integration=${provider}&status=success';
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px">Conectado! Fechando...</p>
</body></html>`
}

function oauthErrorPage(provider: string, frontendUrl: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>
<script>
  if (window.opener) {
    window.opener.postMessage({ type: 'oauth_callback', provider: '${provider}', status: 'error' }, '${frontendUrl}');
    window.close();
  } else {
    window.location.href = '${frontendUrl}/datas?integration=${provider}&status=error';
  }
</script>
<p style="font-family:sans-serif;text-align:center;margin-top:80px">Erro ao conectar. Fechando...</p>
</body></html>`
}
