import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const banco = vi.hoisted(() => ({ dias: [] }))

vi.mock('../../src/data/storage.js', () => ({
  listarDias: async () => banco.dias,
  salvarDias: async (dias) => {
    banco.dias = dias
  },
}))

import { buscarDia, LIMITE_MOMENTO, salvarDia } from '../../src/data/dias.js'

const DIA = '2026-10-15'

beforeEach(() => {
  banco.dias = []
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 20, 12, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('buscarDia', () => {
  it('devolve um dia vazio quando nada foi salvo', async () => {
    expect(await buscarDia(DIA)).toEqual({
      data: DIA,
      momento: '',
      humor: null,
    })
  })
})

describe('salvarDia', () => {
  it('salva o momento e o humor', async () => {
    await salvarDia(DIA, { momento: 'Almoço em família', humor: 4 })
    expect(await buscarDia(DIA)).toEqual({
      data: DIA,
      momento: 'Almoço em família',
      humor: 4,
    })
  })

  it('substitui o registro do mesmo dia em vez de duplicar', async () => {
    await salvarDia(DIA, { momento: 'Primeiro', humor: 2 })
    await salvarDia(DIA, { momento: 'Segundo', humor: 5 })
    expect(banco.dias).toHaveLength(1)
    expect((await buscarDia(DIA)).momento).toBe('Segundo')
  })

  it('tira os espaços das pontas do momento', async () => {
    await salvarDia(DIA, { momento: '  Caminhada  ', humor: null })
    expect((await buscarDia(DIA)).momento).toBe('Caminhada')
  })

  it('aceita só o texto, com humor vazio', async () => {
    await salvarDia(DIA, { momento: 'Leitura', humor: null })
    expect((await buscarDia(DIA)).humor).toBeNull()
  })

  it('aceita só o humor, sem texto', async () => {
    await salvarDia(DIA, { momento: '', humor: 3 })
    expect(await buscarDia(DIA)).toEqual({ data: DIA, momento: '', humor: 3 })
  })

  it('apaga o registro quando texto e humor ficam vazios', async () => {
    await salvarDia(DIA, { momento: 'Algo', humor: 3 })
    await salvarDia(DIA, { momento: '   ', humor: null })
    expect(banco.dias).toHaveLength(0)
  })

  it.each([0, 6, 2.5, '3'])('recusa o humor %s', async (humor) => {
    await expect(salvarDia(DIA, { momento: 'x', humor })).rejects.toThrow(
      'O humor deve ser um número de 1 a 5.',
    )
  })

  it('aceita o momento no limite de caracteres', async () => {
    const texto = 'a'.repeat(LIMITE_MOMENTO)
    await salvarDia(DIA, { momento: texto, humor: null })
    expect((await buscarDia(DIA)).momento).toHaveLength(LIMITE_MOMENTO)
  })

  it('recusa o momento acima do limite', async () => {
    const texto = 'a'.repeat(LIMITE_MOMENTO + 1)
    await expect(
      salvarDia(DIA, { momento: texto, humor: null }),
    ).rejects.toThrow(`O momento deve ter até ${LIMITE_MOMENTO} caracteres.`)
  })

  it('recusa dia futuro', async () => {
    await expect(
      salvarDia('2026-10-21', { momento: 'x', humor: 3 }),
    ).rejects.toThrow('Não é possível marcar um dia futuro.')
  })

  it('recusa dia de mês anterior', async () => {
    await expect(
      salvarDia('2026-09-30', { momento: 'x', humor: 3 }),
    ).rejects.toThrow('Só é possível marcar dias dentro do mês atual.')
  })
})
