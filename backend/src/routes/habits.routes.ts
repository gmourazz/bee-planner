import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import {
  listarHabitos,
  criarHabito,
  editarHabito,
  deletarHabito,
  toggleConclusao,
} from '../controllers/habits.controller'

const router = Router()

// Todas as rotas de hábitos exigem usuário autenticado
router.use(requireAuth)

// GET  /api/habits          → lista hábitos com conclusões e sequência
// POST /api/habits          → cria novo hábito
router.get('/',  listarHabitos)
router.post('/', criarHabito)

// PUT    /api/habits/:id    → edita nome, ícone ou cor
// DELETE /api/habits/:id    → remove hábito e suas conclusões
router.put('/:id',    editarHabito)
router.delete('/:id', deletarHabito)

// POST /api/habits/:id/toggle   → marca/desmarca uma data  { date: "YYYY-MM-DD" }
router.post('/:id/toggle', toggleConclusao)

export default router
