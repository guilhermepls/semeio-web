import { formatarData, hoje, somarDias } from '../utils/datas.js'

export const LIMITE_DIAS = 365

export function primeiroDiaPermitido() {
  return somarDias(hoje(), -LIMITE_DIAS)
}

function dataExiste(data) {
  const [ano, m, dia] = data.split('-').map(Number)
  return formatarData(new Date(ano, m - 1, dia)) === data
}

export function validarData(data) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !dataExiste(data)) {
    throw new Error('Data inválida.')
  }
  if (data > hoje()) throw new Error('Não é possível marcar um dia futuro.')
  if (data < primeiroDiaPermitido()) {
    throw new Error(
      `Só é possível consultar e editar os últimos ${LIMITE_DIAS} dias.`,
    )
  }
}
