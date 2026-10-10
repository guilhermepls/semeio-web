const pad = (n) => String(n).padStart(2, '0')

function separarMes(mes) {
  const [ano, m] = mes.split('-').map(Number)
  return { ano, m }
}

export function formatarData(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function hoje() {
  return formatarData(new Date())
}

export function mesDe(data) {
  return data.slice(0, 7)
}
export function diasDoMes(mes) {
  const { ano, m } = separarMes(mes)
  const total = new Date(ano, m, 0).getDate()
  return Array.from({ length: total }, (_, i) => `${mes}-${pad(i + 1)}`)
}

export function mesAnterior(mes) {
  const { ano, m } = separarMes(mes)
  return mesDe(formatarData(new Date(ano, m - 2, 1)))
}

export function mesSeguinte(mes) {
  const { ano, m } = separarMes(mes)
  return mesDe(formatarData(new Date(ano, m, 1)))
}

export function diaDaSemanaDoPrimeiro(mes) {
  const { ano, m } = separarMes(mes)
  return new Date(ano, m - 1, 1).getDay()
}

export function nomeDoMes(mes) {
  const { ano, m } = separarMes(mes)
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(ano, m - 1, 1))
}
