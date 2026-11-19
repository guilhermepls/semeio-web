import { buscarDia, LIMITE_MOMENTO, salvarDia } from '../data/dias.js'
import { listarAtivos } from '../data/habitos.js'
import { marcarHabito, registrosDoDia } from '../data/registros.js'
import { dataPorExtenso } from '../utils/datas.js'
import { criarSeletorHumor } from './humor.js'
import { icones } from './icones.js'

export function montarDia(raiz, opcoes = {}) {
  const secao = document.createElement('section')
  secao.className = 'dia cartao'
  secao.setAttribute('aria-labelledby', 'dia-titulo')
  secao.hidden = true
  secao.innerHTML = `
    <div class="dia__cabecalho">
      <div>
        <h2 id="dia-titulo" class="dia__titulo">Detalhes do dia</h2>
        <p class="dia__extenso" aria-live="polite"></p>
      </div>
      <button
        type="button"
        class="icone-botao dia__fechar"
        aria-label="Voltar ao calendário"
        title="Voltar ao calendário"
      >
        ${icones.fechar}
      </button>
    </div>
    <p class="erro" role="alert"></p>
    <div class="dia__secao-habitos">
      <h3 class="dia__subtitulo">Hábitos</h3>
      <ul class="dia__lista"></ul>
    </div>
    <form class="dia__registro" novalidate>
      <div class="dia__campo">
        <label for="dia-momento">Momento memorável</label>
        <textarea id="dia-momento" rows="3"></textarea>
      </div>
      <div class="dia__humor"></div>
      <p class="erro erro--registro" role="alert"></p>
      <button type="submit" class="botao">Salvar o dia</button>
      <p class="dia__aviso" role="status"></p>
    </form>
  `
  raiz.append(secao)

  const extenso = secao.querySelector('.dia__extenso')
  const botaoFechar = secao.querySelector('.dia__fechar')
  const erro = secao.querySelector('.erro')
  const lista = secao.querySelector('.dia__lista')
  const form = secao.querySelector('.dia__registro')
  const campoMomento = secao.querySelector('#dia-momento')
  const erroRegistro = secao.querySelector('.erro--registro')
  const aviso = secao.querySelector('.dia__aviso')

  const humor = criarSeletorHumor()
  secao.querySelector('.dia__humor').append(humor.elemento)
  campoMomento.maxLength = LIMITE_MOMENTO

  let dataAtual = null

  function criarItem(habito, data, feito) {
    const item = document.createElement('li')
    const rotulo = document.createElement('label')
    const caixa = document.createElement('input')
    caixa.type = 'checkbox'
    caixa.checked = feito

    caixa.addEventListener('change', async () => {
      try {
        await marcarHabito(data, habito.id, caixa.checked)
        erro.textContent = ''
      } catch (e) {
        caixa.checked = !caixa.checked
        erro.textContent = e.message
      }
    })

    const nome = document.createElement('span')
    nome.textContent = habito.nome

    rotulo.append(caixa, nome)
    item.append(rotulo)
    return item
  }

  async function desenharHabitos(data) {
    const [habitos, registros] = await Promise.all([
      listarAtivos(),
      registrosDoDia(data),
    ])

    lista.replaceChildren()
    if (habitos.length === 0) {
      const vazio = document.createElement('li')
      vazio.textContent = 'Nenhum hábito cadastrado para este dia.'
      lista.append(vazio)
      return
    }

    for (const habito of habitos) {
      const registro = registros.find((r) => r.habitoId === habito.id)
      lista.append(criarItem(habito, data, registro?.feito === true))
    }
  }

  async function carregar(data) {
    dataAtual = data
    extenso.textContent = dataPorExtenso(data)
    erro.textContent = ''
    erroRegistro.textContent = ''
    aviso.textContent = ''

    await desenharHabitos(data)

    const dia = await buscarDia(data)
    campoMomento.value = dia.momento || ''
    humor.definir(dia.humor)

    secao.hidden = false
    secao.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  function fechar() {
    secao.hidden = true
    dataAtual = null
    opcoes.aoFechar?.()
  }

  botaoFechar.addEventListener('click', fechar)

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    if (!dataAtual) return
    aviso.textContent = ''
    erroRegistro.textContent = ''

    try {
      await salvarDia(dataAtual, {
        momento: campoMomento.value,
        humor: humor.obter(),
      })
    } catch (e) {
      erroRegistro.textContent = e.message
      return
    }

    campoMomento.value = campoMomento.value.trim()
    aviso.textContent = 'Dia salvo.'
  })

  document.addEventListener('habitos:alterados', () => {
    if (dataAtual && !secao.hidden) {
      desenharHabitos(dataAtual)
    }
  })

  document.addEventListener('pagina:aberta', (evento) => {
    if (evento.detail !== 'calendario') {
      fechar()
    }
  })

  return {
    carregar,
    fechar,
    obterDataAtual() {
      return dataAtual
    },
  }
}
