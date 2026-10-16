import { listarDias, salvarDias } from './storage.js'
import { validarData } from './validacao.js'

export const LIMITE_MOMENTO = 500

export async function buscarDia(data) {
  const dias = await listarDias()
  return dias.find((d) => d.data === data) ?? { data, momento: '', humor: null }
}

export async function salvarDia(data, { momento, humor }) {
  validarData(data)

  const texto = momento.trim()
  if (texto.length > LIMITE_MOMENTO) {
    throw new Error(`O momento deve ter até ${LIMITE_MOMENTO} caracteres.`)
  }
  if (
    humor !== null &&
    !(Number.isInteger(humor) && humor >= 1 && humor <= 5)
  ) {
    throw new Error('O humor deve ser um número de 1 a 5.')
  }

  const dias = await listarDias()
  const outros = dias.filter((d) => d.data !== data)

  if (!texto && humor === null) {
    await salvarDias(outros)
    return
  }
  await salvarDias([...outros, { data, momento: texto, humor }])
}
