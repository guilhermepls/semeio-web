import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { primeiroDiaPermitido, validarData } from '../../src/data/validacao.js'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 20, 12, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('primeiroDiaPermitido', () => {
  it('fica 365 dias antes de hoje', () => {
    expect(primeiroDiaPermitido()).toBe('2025-10-20')
  })
})

describe('validarData', () => {
  it.each(['2026-10-20', '2025-10-20', '2026-09-30'])('aceita %s', (data) => {
    expect(() => validarData(data)).not.toThrow()
  })

  it('recusa o dia anterior ao limite de 365 dias', () => {
    expect(() => validarData('2025-10-19')).toThrow(
      'Só é possível consultar e editar os últimos 365 dias.',
    )
  })

  it('recusa dia futuro', () => {
    expect(() => validarData('2026-10-21')).toThrow(
      'Não é possível marcar um dia futuro.',
    )
  })

  it.each(['20/10/2026', '2026-02-30'])('recusa %s como inválida', (data) => {
    expect(() => validarData(data)).toThrow('Data inválida.')
  })
})
