import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarEventos, criarEvento, editarEvento, deletarEvento } from '../controllers/events.controller'

const router = Router()

// Todas as rotas de eventos exigem autenticação
router.use(requireAuth)

router.get('/',     listarEventos)
router.post('/',    criarEvento)
router.put('/:id',  editarEvento)
router.delete('/:id', deletarEvento)

export default router
