const CHAVE = 'semeio:v1'

const VAZIO = { habitos: [], registros: [], dias: [] }

function ler() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return structuredClone(VAZIO)
    return { ...structuredClone(VAZIO), ...JSON.parse(bruto) }
  } catch {
    return structuredClone(VAZIO)
  }
}

function gravar(dados) {
  localStorage.setItem(CHAVE, JSON.stringify(dados))
}

export async function listarHabitos() {
  return ler().habitos
}

export async function salvarHabitos(habitos) {
  gravar({ ...ler(), habitos })
}

export async function listarRegistros() {
  return ler().registros
}

export async function salvarRegistros(registros) {
  gravar({ ...ler(), registros })
}

export async function listarDias() {
  return ler().dias
}

export async function salvarDias(dias) {
  gravar({ ...ler(), dias })
}

export async function exportarTudo() {
  return ler()
}
