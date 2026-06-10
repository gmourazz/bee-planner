import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import profileRoutes from './routes/profile.routes'
import habitsRoutes from './routes/habits.routes'
import eventsRoutes from './routes/events.routes'
import integrationsRoutes from './routes/integrations.routes'
import notesRoutes from './routes/notes.routes'
import booksRoutes from './routes/books.routes'
import coursesRoutes from './routes/courses.routes'
import universityRoutes from './routes/university.routes'
import financeRoutes from './routes/finance.routes'
import healthRoutes from './routes/health.routes'
import goalsRoutes from './routes/goals.routes'
import settingsRoutes from './routes/settings.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
}))

app.use(express.json())

// Rotas de autenticação (register, login, logout)
app.use('/api/auth', authRoutes)

// Rotas de perfil (ver perfil, editar, admin)
app.use('/api/profile', profileRoutes)

// Rotas de hábitos (listar, criar, editar, deletar, toggle de conclusão)
app.use('/api/habits', habitsRoutes)

// Rotas de eventos do calendário (listar, criar, editar, deletar)
app.use('/api/events', eventsRoutes)

// Integrações OAuth com Google Calendar e Outlook
app.use('/api/integrations', integrationsRoutes)

// Rotas de notas (listar, criar, editar, deletar, toggle pin)
app.use('/api/notes', notesRoutes)

// Rotas de livros lidos (listar, criar, deletar)
app.use('/api/books', booksRoutes)

// Rotas de cursos e certificações
app.use('/api/courses', coursesRoutes)

// Rotas universitárias (matérias, grade, provas)
app.use('/api/university', universityRoutes)

// Rotas financeiras (transações)
app.use('/api/finance', financeRoutes)

// Rotas de saúde e bem-estar (log diário)
app.use('/api/health', healthRoutes)

// Rotas de metas e objetivos (anuais e mensais)
app.use('/api/goals', goalsRoutes)

// Configurações do usuário (visibilidade de menu, notificações)
app.use('/api/settings', settingsRoutes)

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})