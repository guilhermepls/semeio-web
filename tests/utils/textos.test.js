import { describe, expect, it } from 'vitest'
import {
  mensagemDeIncentivo,
  saudacao,
  textoSequencia,
} from '../../src/utils/textos.js'

describe('saudacao', () => {
  it.each([
    [5, 'Bom dia'],
    [11, 'Bom dia'],
    [12, 'Boa tarde'],
    [17, 'Boa tarde'],
    [18, 'Boa noite'],
    [23, 'Boa noite'],
  ])('às %ih diz "%s"', (hora, esperado) => {
    expect(saudacao(new Date(2026, 9, 20, hora))).toBe(esperado)
  })
})

describe('textoSequencia', () => {
  it('convida a começar quando não há sequência', () => {
    expect(textoSequencia(0)).toBe('Comece sua sequência hoje')
  })

  it('usa o singular para 1 dia', () => {
    expect(textoSequencia(1)).toBe('1 dia seguido')
  })

  it('usa o plural para vários dias', () => {
    expect(textoSequencia(7)).toBe('7 dias seguidos')
  })
})

describe('mensagemDeIncentivo', () => {
  it('pede para cadastrar um hábito quando não há nenhum', () => {
    expect(mensagemDeIncentivo({ feitos: 0, total: 0, sequencia: 0 })).toBe(
      'Cadastre um hábito para começar.',
    )
  })

  it('incentiva o primeiro passo quando nada foi feito', () => {
    expect(mensagemDeIncentivo({ feitos: 0, total: 4, sequencia: 3 })).toBe(
      'Um passo de cada vez. Comece pelo que for mais fácil.',
    )
  })

  it('avisa que falta só um hábito', () => {
    expect(mensagemDeIncentivo({ feitos: 3, total: 4, sequencia: 0 })).toBe(
      'Falta só um. Você está perto de fechar o dia.',
    )
  })

  it('conta quantos hábitos faltam', () => {
    expect(mensagemDeIncentivo({ feitos: 1, total: 4, sequencia: 0 })).toBe(
      'Bom começo. Faltam 3 hábitos para fechar o dia.',
    )
  })

  it('comemora o dia completo sem sequência', () => {
    expect(mensagemDeIncentivo({ feitos: 4, total: 4, sequencia: 1 })).toBe(
      'Dia completo. Obrigado por cuidar de você hoje.',
    )
  })

  it('cita a sequência quando o dia está completo', () => {
    expect(mensagemDeIncentivo({ feitos: 4, total: 4, sequencia: 7 })).toBe(
      'Dia completo e 7 dias seguidos. Continue assim.',
    )
  })
})
