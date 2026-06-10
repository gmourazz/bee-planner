import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarTransacoes, criarTransacao, editarTransacao, deletarTransacao } from '../controllers/finance.controller'

const router = Router()

router.use(requireAuth)

router.get('/',       listarTransacoes)
router.post('/',      criarTransacao)
router.put('/:id',    editarTransacao)
router.delete('/:id', deletarTransacao)

export default router
