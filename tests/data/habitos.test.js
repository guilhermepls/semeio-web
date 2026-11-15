import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const banco = vi.hoisted(() => ({ habitos: [], registros: [] }))

vi.mock('../../src/data/storage.js', () => ({
  listarHabitos: async () => banco.habitos,
  salvarHabitos: async (habitos) => {
    banco.habitos = habitos
  },
  listarRegistros: async () => banco.registros,
  salvarRegistros: async (registros) => {
    banco.registros = registros
  },
}))

import {
  arquivarHabito,
  criarHabito,
  editarHabito,
  excluirHabito,
  listarAtivos,
} from '../../src/data/habitos.js'

function habito(sobrescrever = {}) {
  return {
    id: 'h1',
    nome: 'Meditar',
    tipo: 'comum',
    mes: '2026-10',
    arquivado: false,
    ...sobrescrever,
  }
}

beforeEach(() => {
  banco.habitos = []
  banco.registros = []
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 9, 20, 12, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe('listarAtivos', () => {
  it('devolve só os hábitos que não estão arquivados', async () => {
    banco.habitos = [
      habito({ id: 'h1', nome: 'Meditar' }),
      habito({ id: 'h2', nome: 'Correr', arquivado: true }),
    ]
    const ativos = await listarAtivos()
    expect(ativos).toHaveLength(1)
    expect(ativos[0].nome).toBe('Meditar')
  })
})

describe('criarHabito', () => {
  it('cria o hábito no mês atual, ativo e sem espaços nas pontas', async () => {
    const criado = await criarHabito({
      nome: '  Ler 20 minutos  ',
      tipo: 'comum',
    })
    expect(criado).toMatchObject({
      nome: 'Ler 20 minutos',
      tipo: 'comum',
      mes: '2026-10',
      arquivado: false,
    })
    expect(criado.id).toEqual(expect.any(String))
    expect(await listarAtivos()).toHaveLength(1)
  })

  it('gera ids diferentes para hábitos diferentes', async () => {
    const a = await criarHabito({ nome: 'Ler', tipo: 'comum' })
    const b = await criarHabito({ nome: 'Correr', tipo: 'comum' })
    expect(a.id).not.toBe(b.id)
  })

  it('recusa nome vazio ou só com espaços', async () => {
    await expect(criarHabito({ nome: '', tipo: 'comum' })).rejects.toThrow(
      'Informe o nome do hábito.',
    )
    await expect(criarHabito({ nome: '   ', tipo: 'comum' })).rejects.toThrow(
      'Informe o nome do hábito.',
    )
  })

  it('aceita nome com 60 caracteres e recusa com 61', async () => {
    await criarHabito({ nome: 'a'.repeat(60), tipo: 'comum' })
    await expect(
      criarHabito({ nome: 'b'.repeat(61), tipo: 'comum' }),
    ).rejects.toThrow('O nome deve ter até 60 caracteres.')
  })

  it('recusa tipo inválido', async () => {
    await expect(criarHabito({ nome: 'Ler', tipo: 'diario' })).rejects.toThrow(
      'Tipo de hábito inválido.',
    )
  })

  it('recusa nome repetido, ignorando maiúsculas e minúsculas', async () => {
    banco.habitos = [habito()]
    await expect(
      criarHabito({ nome: 'MEDITAR', tipo: 'comum' }),
    ).rejects.toThrow('Já existe um hábito com esse nome.')
  })

  it('permite reaproveitar o nome de um hábito arquivado', async () => {
    banco.habitos = [habito({ arquivado: true })]
    await criarHabito({ nome: 'Meditar', tipo: 'comum' })
    expect(await listarAtivos()).toHaveLength(1)
  })

  it('recusa um segundo objetivo no mês e cita o objetivo atual', async () => {
    banco.habitos = [habito({ tipo: 'objetivo' })]
    await expect(
      criarHabito({ nome: 'Correr', tipo: 'objetivo' }),
    ).rejects.toThrow('Este mês já tem um objetivo: "Meditar".')
  })

  it('permite um hábito comum mesmo com objetivo no mês', async () => {
    banco.habitos = [habito({ tipo: 'objetivo' })]
    await criarHabito({ nome: 'Correr', tipo: 'comum' })
    expect(await listarAtivos()).toHaveLength(2)
  })

  it('permite um objetivo quando o objetivo existente é de outro mês', async () => {
    banco.habitos = [habito({ tipo: 'objetivo', mes: '2026-09' })]
    await criarHabito({ nome: 'Correr', tipo: 'objetivo' })
    expect(await listarAtivos()).toHaveLength(2)
  })

  it('não grava nada quando a validação falha', async () => {
    banco.habitos = [habito()]
    await expect(
      criarHabito({ nome: 'Meditar', tipo: 'comum' }),
    ).rejects.toThrow()
    expect(banco.habitos).toEqual([habito()])
  })
})

describe('editarHabito', () => {
  it('altera nome e tipo e mantém id e mês', async () => {
    banco.habitos = [habito()]
    await editarHabito('h1', { nome: ' Meditar 10 min ', tipo: 'objetivo' })
    expect(banco.habitos[0]).toEqual(
      habito({ nome: 'Meditar 10 min', tipo: 'objetivo' }),
    )
  })

  it('permite salvar mantendo o próprio nome', async () => {
    banco.habitos = [habito()]
    await editarHabito('h1', { nome: 'Meditar', tipo: 'objetivo' })
    expect(banco.habitos[0].tipo).toBe('objetivo')
  })

  it('recusa o nome de outro hábito ativo', async () => {
    banco.habitos = [
      habito({ id: 'h1', nome: 'Meditar' }),
      habito({ id: 'h2', nome: 'Correr' }),
    ]
    await expect(
      editarHabito('h2', { nome: 'meditar', tipo: 'comum' }),
    ).rejects.toThrow('Já existe um hábito com esse nome.')
  })

  it('recusa virar objetivo se o mês já tem outro objetivo', async () => {
    banco.habitos = [
      habito({ id: 'h1', nome: 'Meditar', tipo: 'objetivo' }),
      habito({ id: 'h2', nome: 'Correr' }),
    ]
    await expect(
      editarHabito('h2', { nome: 'Correr', tipo: 'objetivo' }),
    ).rejects.toThrow('Este mês já tem um objetivo: "Meditar".')
  })

  it('recusa um id que não existe', async () => {
    await expect(
      editarHabito('nao-existe', { nome: 'Ler', tipo: 'comum' }),
    ).rejects.toThrow('Hábito não encontrado.')
  })
})

describe('arquivarHabito', () => {
  it('tira o hábito da lista de ativos, mas mantém o dado salvo', async () => {
    banco.habitos = [habito()]
    await arquivarHabito('h1')
    expect(await listarAtivos()).toHaveLength(0)
    expect(banco.habitos).toHaveLength(1)
    expect(banco.habitos[0].arquivado).toBe(true)
  })

  it('arquiva só o hábito pedido', async () => {
    banco.habitos = [
      habito({ id: 'h1', nome: 'Meditar' }),
      habito({ id: 'h2', nome: 'Correr' }),
    ]
    await arquivarHabito('h1')
    const ativos = await listarAtivos()
    expect(ativos.map((h) => h.nome)).toEqual(['Correr'])
  })

  it('libera o objetivo do mês para outro hábito', async () => {
    banco.habitos = [habito({ tipo: 'objetivo' })]
    await arquivarHabito('h1')
    await criarHabito({ nome: 'Correr', tipo: 'objetivo' })
    const ativos = await listarAtivos()
    expect(ativos.map((h) => h.nome)).toEqual(['Correr'])
  })
})

describe('excluirHabito', () => {
  it('apaga o hábito e os registros dele', async () => {
    banco.habitos = [habito({ id: 'h1' }), habito({ id: 'h2', nome: 'Correr' })]
    banco.registros = [
      { data: '2026-10-15', habitoId: 'h1', feito: true },
      { data: '2026-10-15', habitoId: 'h2', feito: true },
    ]
    await excluirHabito('h1')
    expect(banco.habitos.map((h) => h.id)).toEqual(['h2'])
    expect(banco.registros).toEqual([
      { data: '2026-10-15', habitoId: 'h2', feito: true },
    ])
  })

  it('libera o objetivo do mês', async () => {
    banco.habitos = [habito({ tipo: 'objetivo' })]
    await excluirHabito('h1')
    await criarHabito({ nome: 'Correr', tipo: 'objetivo' })
    expect(await listarAtivos()).toHaveLength(1)
  })

  it('recusa um id que não existe', async () => {
    await expect(excluirHabito('nao-existe')).rejects.toThrow(
      'Hábito não encontrado.',
    )
  })
})
