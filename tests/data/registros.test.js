import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const banco = vi.hoisted(() => ({ registros: [] }))

vi.mock('../../src/data/storage.js', () => ({
  listarRegistros: async () => banco.registros,
  salvarRegistros: async (registros) => {
    banco.registros = registros
  },
}))

import { marcarHabito, registrosDoDia } from '../../src/data/registros.js'

const DIA = '2026-10-15'
const OUTRO_DIA = '2026-10-16'

beforeEach(() => {
  banco.registros = []
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 20, 12, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('marcarHabito', () => {
  it('registra o hábito como feito no dia', async () => {
    await marcarHabito(DIA, 'h1', true)
    expect(await registrosDoDia(DIA)).toEqual([
      { data: DIA, habitoId: 'h1', feito: true },
    ])
  })

  it('atualiza o registro em vez de duplicar', async () => {
    await marcarHabito(DIA, 'h1', true)
    await marcarHabito(DIA, 'h1', false)
    const registros = await registrosDoDia(DIA)
    expect(registros).toHaveLength(1)
    expect(registros[0].feito).toBe(false)
  })

  it('mantém dias e hábitos separados', async () => {
    await marcarHabito(DIA, 'h1', true)
    await marcarHabito(DIA, 'h2', true)
    await marcarHabito(OUTRO_DIA, 'h1', true)
    expect(await registrosDoDia(DIA)).toHaveLength(2)
    expect(await registrosDoDia(OUTRO_DIA)).toHaveLength(1)
  })

  it('aceita o primeiro dia do mês e o dia de hoje', async () => {
    await marcarHabito('2026-10-01', 'h1', true)
    await marcarHabito('2026-10-20', 'h1', true)
    expect(await registrosDoDia('2026-10-01')).toHaveLength(1)
    expect(await registrosDoDia('2026-10-20')).toHaveLength(1)
  })

  it('recusa dia futuro', async () => {
    await expect(marcarHabito('2026-10-21', 'h1', true)).rejects.toThrow(
      'Não é possível marcar um dia futuro.',
    )
  })

  it('recusa dia de mês anterior', async () => {
    await expect(marcarHabito('2026-09-30', 'h1', true)).rejects.toThrow(
      'Só é possível marcar dias dentro do mês atual.',
    )
  })

  it('recusa data em formato inválido', async () => {
    await expect(marcarHabito('15/10/2026', 'h1', true)).rejects.toThrow(
      'Data inválida.',
    )
  })
})
