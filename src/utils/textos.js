export function saudacao(agora = new Date()) {
  const hora = agora.getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

export function textoSequencia(dias) {
  if (dias <= 0) return 'Comece sua sequência hoje'
  return dias === 1 ? '1 dia seguido' : `${dias} dias seguidos`
}

export function mensagemDeIncentivo({ feitos, total, sequencia }) {
  if (total === 0) return 'Cadastre um hábito para começar.'

  if (feitos === total) {
    return sequencia >= 2
      ? `Dia completo e ${sequencia} dias seguidos. Continue assim.`
      : 'Dia completo. Obrigado por cuidar de você hoje.'
  }

  if (feitos === 0) {
    return 'Um passo de cada vez. Comece pelo que for mais fácil.'
  }

  const restam = total - feitos
  return restam === 1
    ? 'Falta só um. Você está perto de fechar o dia.'
    : `Bom começo. Faltam ${restam} hábitos para fechar o dia.`
}
