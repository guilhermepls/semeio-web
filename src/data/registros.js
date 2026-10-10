import { listarRegistros, salvarRegistros } from './storage.js'
import { hoje, mesDe } from '../utils/datas.js'

function validarData(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data inválida.')
  if (data > hoje()) throw new Error('Não é possível marcar um dia futuro.')
  if (mesDe(data) < mesDe(hoje())) {
    throw new Error('Só é possível marcar dias dentro do mês atual.')
  }
}

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
