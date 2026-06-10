import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import {
  listarMaterias, criarMateria, editarMateria, deletarMateria,
  listarGrade, criarAula, deletarAula,
  listarProvas, criarProva, toggleProva, deletarProva,
} from '../controllers/university.controller'

const router = Router()

router.use(requireAuth)

// Matérias
router.get('/subjects',        listarMaterias)
router.post('/subjects',       criarMateria)
router.put('/subjects/:id',    editarMateria)
router.delete('/subjects/:id', deletarMateria)

// Grade horária
router.get('/schedule',        listarGrade)
router.post('/schedule',       criarAula)
router.delete('/schedule/:id', deletarAula)

// Provas
router.get('/exams',           listarProvas)
router.post('/exams',          criarProva)
router.patch('/exams/:id',     toggleProva)
router.delete('/exams/:id',    deletarProva)

export default router
