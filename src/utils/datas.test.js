import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  diaDaSemanaDoPrimeiro,
  diasDoMes,
  formatarData,
  hoje,
  mesAnterior,
  mesDe,
  mesSeguinte,
  nomeDoMes,
} from './datas.js'

describe('formatarData', () => {
  it('formata com zeros à esquerda', () => {
    expect(formatarData(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('formata dezembro e dia 31', () => {
    expect(formatarData(new Date(2026, 11, 31))).toBe('2026-12-31')
  })
})

describe('hoje', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('usa o dia local, mesmo às 23h30', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 10, 23, 30))
    expect(hoje()).toBe('2026-10-10')
  })
})

describe('mesDe', () => {
  it('extrai o mês de uma data', () => {
    expect(mesDe('2026-10-10')).toBe('2026-10')
  })
})

describe('diasDoMes', () => {
  it('devolve 31 dias em outubro, do primeiro ao último', () => {
    const dias = diasDoMes('2026-10')
    expect(dias).toHaveLength(31)
    expect(dias[0]).toBe('2026-10-01')
    expect(dias[30]).toBe('2026-10-31')
  })

  it('devolve 30 dias em abril', () => {
    expect(diasDoMes('2026-04')).toHaveLength(30)
  })

  it('devolve 28 dias em fevereiro de ano comum', () => {
    expect(diasDoMes('2026-02')).toHaveLength(28)
  })

  it('devolve 29 dias em fevereiro de ano bissexto', () => {
    expect(diasDoMes('2028-02')).toHaveLength(29)
  })
})

describe('mesAnterior', () => {
  it('volta um mês', () => {
    expect(mesAnterior('2026-10')).toBe('2026-09')
  })

  it('volta de janeiro para dezembro do ano anterior', () => {
    expect(mesAnterior('2026-01')).toBe('2025-12')
  })
})

describe('mesSeguinte', () => {
  it('avança um mês', () => {
    expect(mesSeguinte('2026-10')).toBe('2026-11')
  })

  it('avança de dezembro para janeiro do ano seguinte', () => {
    expect(mesSeguinte('2026-12')).toBe('2027-01')
  })
})

describe('diaDaSemanaDoPrimeiro', () => {
  it('outubro de 2026 começa na quinta (4)', () => {
    expect(diaDaSemanaDoPrimeiro('2026-10')).toBe(4)
  })

  it('fevereiro de 2026 começa no domingo (0)', () => {
    expect(diaDaSemanaDoPrimeiro('2026-02')).toBe(0)
  })
})

describe('nomeDoMes', () => {
  it('escreve o mês por extenso em português', () => {
    expect(nomeDoMes('2026-10')).toBe('outubro de 2026')
  })
})
