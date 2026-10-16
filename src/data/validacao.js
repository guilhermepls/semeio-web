import { hoje, mesDe } from '../utils/datas.js'

export function validarData(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data)) throw new Error('Data inválida.')
  if (data > hoje()) throw new Error('Não é possível marcar um dia futuro.')
  if (mesDe(data) < mesDe(hoje())) {
    throw new Error('Só é possível marcar dias dentro do mês atual.')
  }
}
