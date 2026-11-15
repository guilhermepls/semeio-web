import { listarHabitos, salvarHabitos } from './storage.js'
import { hoje, mesDe } from '../utils/datas.js'

const TIPOS = ['objetivo', 'comum']

function validar(habitos, habito) {
  if (!habito.nome) throw new Error('Informe o nome do hábito.')
  if (habito.nome.length > 60) {
    throw new Error('O nome deve ter até 60 caracteres.')
  }
  if (!TIPOS.includes(habito.tipo)) throw new Error('Tipo de hábito inválido.')

  const outros = habitos.filter((h) => !h.arquivado && h.id !== habito.id)

  if (outros.some((h) => h.nome.toLowerCase() === habito.nome.toLowerCase())) {
    throw new Error('Já existe um hábito com esse nome.')
  }
  if (habito.tipo === 'objetivo') {
    const objetivoAtual = outros.find(
      (h) => h.tipo === 'objetivo' && h.mes === habito.mes,
    )
    if (objetivoAtual) {
      throw new Error(`Este mês já tem um objetivo: "${objetivoAtual.nome}".`)
    }
  }
}

export async function listarAtivos() {
  const habitos = await listarHabitos()
  return habitos.filter((h) => !h.arquivado)
}

export async function criarHabito({ nome, tipo }) {
  const habitos = await listarHabitos()
  const novo = {
    id: crypto.randomUUID(),
    nome: nome.trim(),
    tipo,
    mes: mesDe(hoje()),
    arquivado: false,
  }
  validar(habitos, novo)
  await salvarHabitos([...habitos, novo])
  return novo
}

export async function editarHabito(id, { nome, tipo }) {
  const habitos = await listarHabitos()
  const atual = habitos.find((h) => h.id === id)
  if (!atual) throw new Error('Hábito não encontrado.')

  const editado = { ...atual, nome: nome.trim(), tipo }
  validar(habitos, editado)
  await salvarHabitos(habitos.map((h) => (h.id === id ? editado : h)))
}

export async function arquivarHabito(id) {
  const habitos = await listarHabitos()
  await salvarHabitos(
    habitos.map((h) => (h.id === id ? { ...h, arquivado: true } : h)),
  )
}
