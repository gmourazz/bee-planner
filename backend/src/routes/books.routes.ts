import { Router } from 'express'
import { requireAuth } from '../middlewares/auth.middleware'
import { listarLivros, criarLivro, deletarLivro } from '../controllers/books.controller'

const router = Router()

router.use(requireAuth)

// GET  /api/books     → lista livros do usuário
// POST /api/books     → adiciona novo livro
router.get('/',  listarLivros)
router.post('/', criarLivro)

// DELETE /api/books/:id  → remove livro
router.delete('/:id', deletarLivro)

export default router
