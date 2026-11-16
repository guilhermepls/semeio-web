import { describe, expect, it } from 'vitest'
import { calcularSequencia, contarFeitos } from '../../src/data/progresso.js'

const HOJE = '2026-10-20'
const habitos = [{ id: 'a' }, { id: 'b' }]

function completo(data) {
  return [
    { data, habitoId: 'a', feito: true },
    { data, habitoId: 'b', feito: true },
  ]
}

describe('contarFeitos', () => {
  it('conta só os hábitos listados que foram feitos', () => {
    const registros = [
      { data: HOJE, habitoId: 'a', feito: true },
      { data: HOJE, habitoId: 'b', feito: false },
      { data: HOJE, habitoId: 'outro', feito: true },
    ]
    expect(contarFeitos(habitos, registros)).toBe(1)
  })

  it('devolve zero sem registros', () => {
    expect(contarFeitos(habitos, [])).toBe(0)
  })
})

describe('calcularSequencia', () => {
  it('devolve zero quando não há hábitos', () => {
    expect(calcularSequencia([], completo(HOJE), HOJE)).toBe(0)
  })

  it('conta hoje e os dias anteriores completos', () => {
    const registros = [
      ...completo('2026-10-20'),
      ...completo('2026-10-19'),
      ...completo('2026-10-18'),
    ]
    expect(calcularSequencia(habitos, registros, HOJE)).toBe(3)
  })

  it('não quebra a sequência quando hoje ainda está em aberto', () => {
    const registros = [
      { data: '2026-10-20', habitoId: 'a', feito: true },
      ...completo('2026-10-19'),
      ...completo('2026-10-18'),
    ]
    expect(calcularSequencia(habitos, registros, HOJE)).toBe(2)
  })

  it('para no primeiro dia incompleto', () => {
    const registros = [
      ...completo('2026-10-20'),
      { data: '2026-10-19', habitoId: 'a', feito: true },
      ...completo('2026-10-18'),
    ]
    expect(calcularSequencia(habitos, registros, HOJE)).toBe(1)
  })

  it('ignora registros marcados como não feitos', () => {
    const registros = [
      { data: '2026-10-19', habitoId: 'a', feito: true },
      { data: '2026-10-19', habitoId: 'b', feito: false },
    ]
    expect(calcularSequencia(habitos, registros, HOJE)).toBe(0)
  })

  it('atravessa a virada de mês', () => {
    const registros = [
      ...completo('2026-11-01'),
      ...completo('2026-10-31'),
      ...completo('2026-10-30'),
    ]
    expect(calcularSequencia(habitos, registros, '2026-11-01')).toBe(3)
  })

  it('respeita o limite de dias', () => {
    const registros = [
      ...completo('2026-10-20'),
      ...completo('2026-10-19'),
      ...completo('2026-10-18'),
      ...completo('2026-10-17'),
    ]
    expect(calcularSequencia(habitos, registros, HOJE, 3)).toBe(3)
  })
})
