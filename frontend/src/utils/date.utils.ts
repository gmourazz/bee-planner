// Funções utilitárias de data

// Calcula a sequência (streak) de dias consecutivos com base em um array de datas
export function calcStreak(datas: string[]): number {
  const conjunto = new Set(datas)
  let streak = 0
  const d = new Date()
  while (true) {
    const chave = d.toISOString().split('T')[0]
    if (conjunto.has(chave)) { streak++; d.setDate(d.getDate() - 1) }
    else break
  }
  return streak
}

// Retorna os últimos 7 dias como objetos Date
export function getLast7Days(): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d
  })
}

// Retorna as chaves dos últimos 7 dias no formato 'YYYY-MM-DD'
export function getLast7Keys(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return d.toISOString().split('T')[0]
  })
}
