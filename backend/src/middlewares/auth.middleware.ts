import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

// Extende o tipo padrão do Express para incluir o campo "user" na requisição.
// Assim, qualquer rota protegida pode acessar req.user com os dados do usuário logado.
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string     // id único do usuário no Supabase
        email: string  // e-mail do usuário
        role: string   // papel: 'user', 'pro' ou 'admin'
      }
    }
  }
}

// Middleware de autenticação
// Um "middleware" é uma função que roda ANTES da lógica principal da rota.
// Aqui ele verifica se o usuário está logado antes de deixar acessar o endpoint.
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Pega o cabeçalho "Authorization" da requisição.
  // Ele deve vir no formato: "Bearer TOKEN_AQUI"
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Se não vier o token, bloqueia com erro 401 (não autorizado)
    return res.status(401).json({ error: 'Token de autenticação não fornecido' })
  }

  // Extrai só o token, removendo o prefixo "Bearer "
  const token = authHeader.split(' ')[1]

  // Verifica o token com o Supabase e obtém os dados do usuário
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data.user) {
    // Token inválido ou expirado
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }

  // Busca o perfil do usuário na tabela profiles para pegar o "role" (papel)
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single()

  // Salva os dados do usuário no objeto req para as rotas usarem depois
  req.user = {
    id: data.user.id,
    email: data.user.email ?? '',
    role: profile?.role ?? 'user'
  }

  // Chama next() para continuar para a rota de destino
  next()
}

// Middleware de autorização — só deixa passar se o usuário for admin
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    // Se não for admin, bloqueia com erro 403 (proibido)
    return res.status(403).json({ error: 'Acesso restrito a administradores' })
  }
  next()
}
