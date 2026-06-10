// Tipos relacionados ao perfil do usuário

export interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  birthdate: string | null
  avatar_url: string | null
  role: string
  created_at: string
}
