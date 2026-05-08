import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import profileRoutes from './routes/profile.routes'

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

app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`)
})