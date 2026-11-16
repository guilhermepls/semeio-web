import { hoje, somarDias } from '../utils/datas.js'
import { listarAtivos } from './habitos.js'
import { listarRegistros } from './storage.js'

export function contarFeitos(habitos, registros) {
  const feitos = new Set(
    registros.filter((r) => r.feito).map((r) => r.habitoId),
  )
  return habitos.filter((h) => feitos.has(h.id)).length
}

export function calcularSequencia(
  habitos,
  registros,
  dataDeHoje,
  limiteDias = 365,
) {
  if (habitos.length === 0) return 0

  const feitosPorDia = new Map()
  for (const registro of registros) {
    if (!registro.feito) continue
    if (!feitosPorDia.has(registro.data)) {
      feitosPorDia.set(registro.data, new Set())
    }
    feitosPorDia.get(registro.data).add(registro.habitoId)
  }

  function diaCompleto(data) {
    const feitos = feitosPorDia.get(data)
    return Boolean(feitos) && habitos.every((h) => feitos.has(h.id))
  }

  let dia = dataDeHoje
  if (!diaCompleto(dia)) dia = somarDias(dia, -1)

  let total = 0
  while (total < limiteDias && diaCompleto(dia)) {
    total += 1
    dia = somarDias(dia, -1)
  }
  return total
}

export async function sequenciaAtual() {
  const [habitos, registros] = await Promise.all([
    listarAtivos(),
    listarRegistros(),
  ])
  return calcularSequencia(habitos, registros, hoje())
}
