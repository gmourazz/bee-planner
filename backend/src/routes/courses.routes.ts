import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarCursos, criarCurso, editarCurso, deletarCurso } from '../controllers/courses.controller'

const router = Router()

router.get('/',     requireAuth, listarCursos)
router.post('/',    requireAuth, criarCurso)
router.put('/:id',  requireAuth, editarCurso)
router.delete('/:id', requireAuth, deletarCurso)

export default router
