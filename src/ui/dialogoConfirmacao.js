import { criarDialogo } from './dialogo.js'

export function confirmar({ titulo, texto, rotuloConfirmar, perigo = false }) {
  return new Promise((resolver) => {
    const dialogo = criarDialogo(titulo)
    let confirmado = false

    const paragrafo = document.createElement('p')
    paragrafo.textContent = texto

    const cancelar = document.createElement('button')
    cancelar.type = 'button'
    cancelar.className = 'botao botao--neutro'
    cancelar.textContent = 'Cancelar'
    cancelar.autofocus = true
    cancelar.addEventListener('click', () => dialogo.fechar())

    const confirmarBotao = document.createElement('button')
    confirmarBotao.type = 'button'
    confirmarBotao.className = perigo ? 'botao botao--perigo-solido' : 'botao'
    confirmarBotao.textContent = rotuloConfirmar
    confirmarBotao.addEventListener('click', () => {
      confirmado = true
      dialogo.fechar()
    })

    const acoes = document.createElement('div')
    acoes.className = 'dialogo__acoes'
    acoes.append(cancelar, confirmarBotao)

    dialogo.corpo.append(paragrafo, acoes)
    dialogo.elemento.addEventListener('close', () => resolver(confirmado))
    dialogo.abrir()
  })
}
