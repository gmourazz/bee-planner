import { Router } from 'express'
import { getMyProfile, updateMyProfile, getAllProfiles, updateUserRole } from '../controllers/profile.controller'
import { requireAuth, requireAdmin } from '../middlewares/auth.middleware'

const router = Router()

// Todas as rotas de perfil exigem login (requireAuth vem primeiro)
// O fluxo é: requisição → requireAuth → controller

// GET  /api/profile/me  → retorna o perfil do usuário logado
router.get('/me', requireAuth, getMyProfile)

// PUT  /api/profile/me  → atualiza nome, foto ou bio do usuário logado
router.put('/me', requireAuth, updateMyProfile)

// GET  /api/profile/all → [só admin] lista todos os usuários
router.get('/all', requireAuth, requireAdmin, getAllProfiles)

// PUT  /api/profile/:id/role → [só admin] muda o role de um usuário
router.put('/:id/role', requireAuth, requireAdmin, updateUserRole)

export default router
