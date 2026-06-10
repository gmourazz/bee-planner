import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarNotas, criarNota, editarNota, deletarNota, togglePin } from '../controllers/notes.controller'

const router = Router()

// Todas as rotas de notas exigem autenticação
router.use(requireAuth)

// GET  /api/notes     → lista todas as notas do usuário
// POST /api/notes     → cria nova nota
router.get('/',  listarNotas)
router.post('/', criarNota)

// PUT    /api/notes/:id      → edita campos da nota
// DELETE /api/notes/:id      → remove a nota
router.put('/:id',    editarNota)
router.delete('/:id', deletarNota)

// PATCH /api/notes/:id/pin   → alterna pin  { isPinned: boolean }
router.patch('/:id/pin', togglePin)

export default router
