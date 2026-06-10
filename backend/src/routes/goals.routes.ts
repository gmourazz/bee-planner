import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarMetas, criarMeta, editarMeta, atualizarProgresso, deletarMeta } from '../controllers/goals.controller'

const router = Router()

router.use(requireAuth)

router.get('/',          listarMetas)
router.post('/',         criarMeta)
router.put('/:id',       editarMeta)
router.patch('/:id',     atualizarProgresso)
router.delete('/:id',    deletarMeta)

export default router
