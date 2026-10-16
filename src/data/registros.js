import { listarRegistros, salvarRegistros } from './storage.js'
import { validarData } from './validacao.js'

export async function registrosDoDia(data) {
  const registros = await listarRegistros()
  return registros.filter((r) => r.data === data)
}

export async function marcarHabito(data, habitoId, feito) {
  validarData(data)
  const registros = await listarRegistros()
  const outros = registros.filter(
    (r) => !(r.data === data && r.habitoId === habitoId),
  )
  await salvarRegistros([...outros, { data, habitoId, feito }])
}
