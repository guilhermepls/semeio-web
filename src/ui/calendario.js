import { primeiroDiaPermitido } from '../data/validacao.js'
import {
  dataPorExtenso,
  diaDaSemanaDoPrimeiro,
  diasDoMes,
  diaEstaNoIntervalo,
  hoje,
  mesAnterior,
  mesDe,
  mesSeguinte,
  nomeDoMes,
  podeAvancarMes,
  podeRetrocederMes,
} from '../utils/datas.js'
import { icones } from './icones.js'

export function montarCalendario(raiz) {
  const secao = document.createElement('section')
  secao.className = 'calendario'
  secao.setAttribute('aria-labelledby', 'calendario-titulo')
  secao.innerHTML = `
    <div class="calendario__cabecalho">
      <button
        type="button"
        class="icone-botao calendario__nav-botao"
        data-acao="anterior"
        aria-label="Mês anterior"
      >
        ${icones.anterior}
      </button>
      <h2 id="calendario-titulo" class="calendario__mes" aria-live="polite"></h2>
      <button
        type="button"
        class="icone-botao calendario__nav-botao"
        data-acao="proximo"
        aria-label="Próximo mês"
      >
        ${icones.proximo}
      </button>
    </div>
    <div class="calendario__semana" aria-hidden="true">
      <span>Dom</span>
      <span>Seg</span>
      <span>Ter</span>
      <span>Qua</span>
      <span>Qui</span>
      <span>Sex</span>
      <span>Sáb</span>
    </div>
    <div class="calendario__grade" role="grid" aria-labelledby="calendario-titulo"></div>
  `
  raiz.append(secao)

  const titulo = secao.querySelector('#calendario-titulo')
  const botaoAnterior = secao.querySelector('[data-acao="anterior"]')
  const botaoProximo = secao.querySelector('[data-acao="proximo"]')
  const grade = secao.querySelector('.calendario__grade')

  let mesExibido = mesDe(hoje())

  function criarElementoDia(dia, dataHoje, limite) {
    const el = document.createElement('div')
    const numero = Number(dia.split('-')[2])
    const ehHoje = dia === dataHoje
    const permitido = diaEstaNoIntervalo(dia, limite, dataHoje)

    el.className = 'calendario__dia'
    el.setAttribute('role', 'gridcell')
    el.dataset.data = dia

    let rotulo = dataPorExtenso(dia)
    if (ehHoje) {
      el.classList.add('calendario__dia--hoje')
      rotulo += ', hoje'
    }
    if (!permitido) {
      el.classList.add('calendario__dia--desabilitado')
      el.setAttribute('aria-disabled', 'true')
    }

    el.setAttribute('aria-label', rotulo)
    el.innerHTML = `<span class="calendario__dia-numero">${numero}</span>`
    return el
  }

  function desenharGrade(dataHoje, limite) {
    const fragmento = document.createDocumentFragment()
    const offset = diaDaSemanaDoPrimeiro(mesExibido)
    const dias = diasDoMes(mesExibido)

    for (let i = 0; i < offset; i += 1) {
      const vazio = document.createElement('div')
      vazio.className = 'calendario__vazio'
      vazio.setAttribute('aria-hidden', 'true')
      fragmento.append(vazio)
    }

    for (const dia of dias) {
      fragmento.append(criarElementoDia(dia, dataHoje, limite))
    }

    grade.replaceChildren(fragmento)
  }

  function atualizar() {
    const dataHoje = hoje()
    const limite = primeiroDiaPermitido()

    titulo.textContent = nomeDoMes(mesExibido)
    botaoAnterior.disabled = !podeRetrocederMes(mesExibido, limite)
    botaoProximo.disabled = !podeAvancarMes(mesExibido, dataHoje)

    desenharGrade(dataHoje, limite)
  }

  botaoAnterior.addEventListener('click', () => {
    const limite = primeiroDiaPermitido()
    if (podeRetrocederMes(mesExibido, limite)) {
      mesExibido = mesAnterior(mesExibido)
      atualizar()
    }
  })

  botaoProximo.addEventListener('click', () => {
    const dataHoje = hoje()
    if (podeAvancarMes(mesExibido, dataHoje)) {
      mesExibido = mesSeguinte(mesExibido)
      atualizar()
    }
  })

  document.addEventListener('pagina:aberta', (evento) => {
    if (evento.detail === 'calendario') {
      atualizar()
    }
  })

  atualizar()
}
