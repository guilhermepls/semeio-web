import { listarAtivos } from '../data/habitos.js'
import { contarFeitos, sequenciaAtual } from '../data/progresso.js'
import { marcarHabito, registrosDoDia } from '../data/registros.js'
import { dataPorExtenso, hoje, mesDe } from '../utils/datas.js'
import {
  mensagemDeIncentivo,
  saudacao,
  textoSequencia,
} from '../utils/textos.js'
import { abrirDialogoConfigurar } from './dialogoConfigurar.js'
import { abrirDialogoHabito } from './dialogoHabito.js'
import { icones } from './icones.js'

export function montarHoje(raiz) {
  const secao = document.createElement('section')
  secao.className = 'hoje'
  secao.setAttribute('aria-labelledby', 'hoje-titulo')
  secao.innerHTML = `
    <p class="texto-apoio" data-data></p>
    <h1 class="hoje__saudacao" id="hoje-titulo"></h1>
    <p class="hoje__lema">Cada dia marcado é um voto na pessoa que você quer ser.</p>
    <div class="hoje__colunas">
      <div class="hoje__principal">
        <p class="erro" role="alert" data-erro></p>
        <section class="cartao cartao--vazio" data-vazio hidden>
          <h2 class="cartao__titulo">Comece pelo seu primeiro hábito</h2>
          <p class="texto-apoio">Escolha algo pequeno e claro, que caiba no seu dia. Um hábito simples, repetido, vale mais que um plano ambicioso.</p>
          <button type="button" class="botao" data-criar>Criar meu primeiro hábito</button>
        </section>
        <section data-secao-objetivo>
          <h2 class="secao-titulo">Objetivo do mês</h2>
          <div data-objetivo></div>
        </section>
        <section data-secao-comuns>
          <h2 class="secao-titulo">Hábitos comuns</h2>
          <div data-comuns></div>
        </section>
      </div>
      <aside class="hoje__lateral">
        <section class="cartao" aria-label="Progresso de hoje" data-progresso>
          <div class="cartao__linha">
            <h2 class="cartao__titulo" data-resumo></h2>
            <span class="texto-apoio" data-sequencia></span>
          </div>
          <progress class="progresso" aria-label="Progresso de hoje" value="0" max="1"></progress>
          <p class="texto-apoio" data-incentivo></p>
        </section>
        <section class="cartao">
          <h2 class="cartao__titulo">Constância vale mais que perfeição</h2>
          <p class="texto-apoio">Um dia em aberto não apaga o que você construiu. Volte amanhã e continue.</p>
          <a class="botao botao--secundario" href="#/calendario">Registrar como foi o dia</a>
        </section>
      </aside>
    </div>
  `
  raiz.append(secao)

  const buscar = (seletor) => secao.querySelector(seletor)
  const textoData = buscar('[data-data]')
  const saudacaoEl = buscar('.hoje__saudacao')
  const erro = buscar('[data-erro]')
  const painelVazio = buscar('[data-vazio]')
  const secaoObjetivo = buscar('[data-secao-objetivo]')
  const secaoComuns = buscar('[data-secao-comuns]')
  const conteudoObjetivo = buscar('[data-objetivo]')
  const conteudoComuns = buscar('[data-comuns]')
  const cartaoProgresso = buscar('[data-progresso]')
  const resumo = buscar('[data-resumo]')
  const sequenciaEl = buscar('[data-sequencia]')
  const barra = buscar('.progresso')
  const incentivo = buscar('[data-incentivo]')

  let focoPendente = null

  buscar('[data-criar]').addEventListener('click', () => abrirDialogoHabito())

  function criarLinha(habito, feito) {
    const item = document.createElement('li')
    item.className = 'habito'

    const nome = document.createElement('span')
    nome.className = 'habito__nome'
    nome.textContent = habito.nome

    const marcar = document.createElement('button')
    marcar.type = 'button'
    marcar.className = 'botao marcar'
    marcar.dataset.habitoId = habito.id
    marcar.setAttribute('aria-pressed', String(feito))
    marcar.setAttribute('aria-label', `Marcar ${habito.nome} como feito`)
    marcar.innerHTML = feito
      ? `${icones.marcado}<span>Feito</span>`
      : '<span>Marcar</span>'
    marcar.addEventListener('click', async () => {
      try {
        await marcarHabito(hoje(), habito.id, !feito)
      } catch (e) {
        erro.textContent = e.message
        return
      }
      erro.textContent = ''
      focoPendente = habito.id
      await desenhar()
      document.dispatchEvent(new CustomEvent('registros:alterados'))
    })

    const ajustes = document.createElement('button')
    ajustes.type = 'button'
    ajustes.className = 'icone-botao'
    ajustes.title = `Configurar ${habito.nome}`
    ajustes.setAttribute('aria-label', `Configurar ${habito.nome}`)
    ajustes.innerHTML = icones.ajustes
    ajustes.addEventListener('click', () => abrirDialogoConfigurar(habito))

    item.append(nome, marcar, ajustes)
    return item
  }

  function criarLista(habitos, feitos) {
    const lista = document.createElement('ul')
    lista.className = 'habito-lista'
    for (const habito of habitos) {
      lista.append(criarLinha(habito, feitos.has(habito.id)))
    }
    return lista
  }

  function criarAvisoSemObjetivo() {
    const cartao = document.createElement('div')
    cartao.className = 'cartao cartao--vazio'

    const texto = document.createElement('p')
    texto.className = 'texto-apoio'
    texto.textContent =
      'Você ainda não definiu o objetivo deste mês. Escolha o hábito que vai receber sua atenção principal.'

    const botao = document.createElement('button')
    botao.type = 'button'
    botao.className = 'botao botao--secundario'
    botao.textContent = 'Definir objetivo do mês'
    botao.addEventListener('click', () =>
      abrirDialogoHabito({ tipoInicial: 'objetivo' }),
    )

    cartao.append(texto, botao)
    return cartao
  }

  function criarAvisoSemComuns() {
    const texto = document.createElement('p')
    texto.className = 'texto-apoio'
    texto.textContent =
      'Nenhum hábito comum ainda. Eles ajudam a sustentar o seu objetivo do mês.'
    return texto
  }

  async function desenhar() {
    const dataDeHoje = hoje()
    textoData.textContent = dataPorExtenso(dataDeHoje)
    saudacaoEl.textContent = saudacao()

    const [habitos, registros, sequencia] = await Promise.all([
      listarAtivos(),
      registrosDoDia(dataDeHoje),
      sequenciaAtual(),
    ])

    const feitos = new Set(
      registros.filter((r) => r.feito).map((r) => r.habitoId),
    )
    const mesAtual = mesDe(dataDeHoje)
    const objetivo = habitos.find(
      (h) => h.tipo === 'objetivo' && h.mes === mesAtual,
    )
    const comuns = habitos.filter((h) => h !== objetivo)

    const semHabitos = habitos.length === 0
    painelVazio.hidden = !semHabitos
    secaoObjetivo.hidden = semHabitos
    secaoComuns.hidden = semHabitos
    cartaoProgresso.hidden = semHabitos

    conteudoObjetivo.replaceChildren(
      objetivo ? criarLista([objetivo], feitos) : criarAvisoSemObjetivo(),
    )
    conteudoComuns.replaceChildren(
      comuns.length > 0 ? criarLista(comuns, feitos) : criarAvisoSemComuns(),
    )

    const total = habitos.length
    const quantosFeitos = contarFeitos(habitos, registros)
    resumo.textContent = `${quantosFeitos} de ${total} ${total === 1 ? 'hábito' : 'hábitos'} hoje`
    sequenciaEl.textContent = textoSequencia(sequencia)
    barra.max = Math.max(total, 1)
    barra.value = quantosFeitos
    incentivo.textContent = mensagemDeIncentivo({
      feitos: quantosFeitos,
      total,
      sequencia,
    })

    if (focoPendente) {
      const alvo = [...secao.querySelectorAll('.marcar')].find(
        (botao) => botao.dataset.habitoId === focoPendente,
      )
      alvo?.focus()
      focoPendente = null
    }
  }

  document.addEventListener('habitos:alterados', desenhar)
  document.addEventListener('pagina:aberta', (evento) => {
    if (evento.detail === 'hoje') desenhar()
  })

  desenhar()
}
