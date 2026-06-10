import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

// ──────────────────────────────────────────────────────────
// Função auxiliar: calcula a sequência atual de dias consecutivos
// Percorre os dias para trás a partir de hoje contando conclusões
// ──────────────────────────────────────────────────────────
function calcularSequencia(conclusoes: string[]): number {
  const conjunto = new Set(conclusoes) // acesso O(1) por data
  let sequencia = 0
  const hoje = new Date()

  while (true) {
    const chave = hoje.toISOString().split('T')[0]
    if (conjunto.has(chave)) {
      sequencia++
      hoje.setDate(hoje.getDate() - 1)
    } else {
      break
    }
  }

  return sequencia
}

// ──────────────────────────────────────────────────────────
// GET /api/habits
// Retorna todos os hábitos do usuário logado.
// Inclui as conclusões dos últimos 60 dias e a sequência atual.
// ──────────────────────────────────────────────────────────
export const listarHabitos = async (req: Request, res: Response) => {
  const userId = req.user!.id

  // Busca todos os hábitos do usuário
  const { data: habitos, error } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })

  if (!habitos || habitos.length === 0) {
    return res.status(200).json({ habits: [] })
  }

  // Data limite: últimos 60 dias (suficiente para o gráfico semanal)
  const desde = new Date()
  desde.setDate(desde.getDate() - 60)
  const dataLimite = desde.toISOString().split('T')[0]

  // Busca todas as conclusões dos hábitos do usuário no período
  const { data: conclusoes } = await supabase
    .from('habit_completions')
    .select('habit_id, date')
    .eq('user_id', userId)
    .gte('date', dataLimite)

  // Agrupa as datas de conclusão por habit_id
  const conclusoesPorHabito: Record<string, string[]> = {}
  for (const c of conclusoes ?? []) {
    if (!conclusoesPorHabito[c.habit_id]) conclusoesPorHabito[c.habit_id] = []
    conclusoesPorHabito[c.habit_id].push(c.date)
  }

  // Monta a resposta no formato que o frontend espera
  const resultado = habitos.map(h => {
    const datas = conclusoesPorHabito[h.id] ?? []

    // Transforma o array de datas em Record<string, boolean>
    const completions: Record<string, boolean> = {}
    for (const d of datas) completions[d] = true

    return {
      id:          h.id,
      name:        h.name,
      iconKey:     h.icon_key,
      color:       h.color,
      completions,
      streak:      calcularSequencia(datas),
      created_at:  h.created_at,
    }
  })

  return res.status(200).json({ habits: resultado })
}

// ──────────────────────────────────────────────────────────
// POST /api/habits
// Cria um novo hábito para o usuário logado.
// Body: { name, iconKey, color }
// ──────────────────────────────────────────────────────────
export const criarHabito = async (req: Request, res: Response) => {
  const userId = req.user!.id
  const { name, iconKey, color } = req.body

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'O nome do hábito é obrigatório' })
  }

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id:  userId,
      name:     name.trim(),
      icon_key: iconKey ?? 'droplets',
      color:    color   ?? '#3B82F6',
    })
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })

  return res.status(201).json({
    habit: {
      id:          data.id,
      name:        data.name,
      iconKey:     data.icon_key,
      color:       data.color,
      completions: {},
      streak:      0,
      created_at:  data.created_at,
    }
  })
}

// ──────────────────────────────────────────────────────────
// PUT /api/habits/:id
// Edita nome, ícone ou cor de um hábito existente.
// Body: { name?, iconKey?, color? }
// ──────────────────────────────────────────────────────────
export const editarHabito = async (req: Request, res: Response) => {
  const userId  = req.user!.id
  const habitId = req.params.id
  const { name, iconKey, color } = req.body

  const updates: Record<string, unknown> = {}
  if (name    !== undefined) updates.name     = name.trim()
  if (iconKey !== undefined) updates.icon_key = iconKey
  if (color   !== undefined) updates.color    = color

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ error: 'Nenhum campo para atualizar' })
  }

  const { data, error } = await supabase
    .from('habits')
    .update(updates)
    .eq('id', habitId)
    .eq('user_id', userId)  // garante que só edita o próprio hábito
    .select()
    .single()

  if (error) return res.status(400).json({ error: error.message })
  if (!data)  return res.status(404).json({ error: 'Hábito não encontrado' })

  return res.status(200).json({
    habit: {
      id:      data.id,
      name:    data.name,
      iconKey: data.icon_key,
      color:   data.color,
    }
  })
}

// ──────────────────────────────────────────────────────────
// DELETE /api/habits/:id
// Remove o hábito e todas as suas conclusões (cascade).
// ──────────────────────────────────────────────────────────
export const deletarHabito = async (req: Request, res: Response) => {
  const userId  = req.user!.id
  const habitId = req.params.id

  const { error } = await supabase
    .from('habits')
    .delete()
    .eq('id', habitId)
    .eq('user_id', userId)  // só deleta se for do próprio usuário

  if (error) return res.status(400).json({ error: error.message })

  return res.status(200).json({ message: 'Hábito removido com sucesso' })
}

// ──────────────────────────────────────────────────────────
// POST /api/habits/:id/toggle
// Marca ou desmarca um hábito em uma data específica.
// Body: { date } — formato YYYY-MM-DD
// Se já estava marcado → desmarca. Se não → marca.
// ──────────────────────────────────────────────────────────
export const toggleConclusao = async (req: Request, res: Response) => {
  const userId  = req.user!.id
  const habitId = req.params.id
  const { date } = req.body

  if (!date) {
    return res.status(400).json({ error: 'O campo "date" (YYYY-MM-DD) é obrigatório' })
  }

  // Verifica se o hábito pertence ao usuário
  const { data: habito } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', userId)
    .single()

  if (!habito) return res.status(404).json({ error: 'Hábito não encontrado' })

  // Verifica se já existe conclusão nessa data
  const { data: existente } = await supabase
    .from('habit_completions')
    .select('id')
    .eq('habit_id', habitId)
    .eq('date', date)
    .single()

  if (existente) {
    // Já estava marcado → desmarca
    await supabase.from('habit_completions').delete().eq('id', existente.id)
    return res.status(200).json({ completed: false, date })
  } else {
    // Não estava marcado → marca
    await supabase.from('habit_completions').insert({
      habit_id: habitId,
      user_id:  userId,
      date,
    })
    return res.status(200).json({ completed: true, date })
  }
}
