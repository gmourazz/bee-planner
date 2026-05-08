import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export const register = async (req: Request, res: Response) => {
  const { email, password, name, phone } = req.body
  // phone é opcional — usuário pode cadastrar sem telefone

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, phone } // esses dados ficam em raw_user_meta_data no Supabase
                            // o trigger handle_new_user lê daqui e salva no profiles
    }
  })

  if (error) return res.status(400).json({ error: error.message })
  return res.status(201).json({ user: data.user })
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) return res.status(401).json({ error: error.message })
  return res.status(200).json({ user: data.user, session: data.session })
}

export const logout = async (req: Request, res: Response) => {
  const { error } = await supabase.auth.signOut()
  if (error) return res.status(400).json({ error: error.message })
  return res.status(200).json({ message: 'Logout realizado com sucesso' })
}