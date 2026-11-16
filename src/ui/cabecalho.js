import { abrirDialogoHabito } from './dialogoHabito.js'
import { icones } from './icones.js'

export function montarCabecalho(raiz) {
  raiz.innerHTML = `
    <div class="conteudo cabecalho__faixa">
      <a class="cabecalho__marca" href="#/hoje">Semeio</a>
      <nav class="cabecalho__nav" aria-label="Principal">
        <a href="#/hoje" data-rota="hoje">Hoje</a>
        <a href="#/calendario" data-rota="calendario">Calendário</a>
      </nav>
      <button type="button" class="botao" data-novo>${icones.mais}<span>Novo hábito</span></button>
    </div>
  `
  raiz
    .querySelector('[data-novo]')
    .addEventListener('click', () => abrirDialogoHabito())
}
