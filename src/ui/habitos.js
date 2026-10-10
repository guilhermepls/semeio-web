import {
  arquivarHabito,
  criarHabito,
  editarHabito,
  listarAtivos,
} from '../data/habitos.js'

const ROTULO_TIPO = { foco: 'Foco do mês', baseline: 'Baseline' }

export function montarHabitos(raiz) {
  const secao = document.createElement('section')
  secao.className = 'habitos'
  secao.setAttribute('aria-labelledby', 'habitos-titulo')
  secao.innerHTML = `
    <h2 id="habitos-titulo">Hábitos</h2>
    <form class="habitos__form" novalidate>
      <div class="campo">
        <label for="habito-nome">Nome do hábito</label>
        <input id="habito-nome" name="nome" type="text" maxlength="60" autocomplete="off" required />
      </div>
      <fieldset class="campo">
        <legend>Tipo</legend>
        <label><input type="radio" name="tipo" value="baseline" checked /> Baseline</label>
        <label><input type="radio" name="tipo" value="foco" /> Foco do mês</label>
      </fieldset>
      <p class="erro" role="alert"></p>
      <div class="habitos__acoes">
        <button type="submit" class="botao">Adicionar hábito</button>
        <button type="button" class="botao botao--secundario" hidden>Cancelar</button>
      </div>
    </form>
    <ul class="habitos__lista"></ul>
  `
  raiz.append(secao)

  const form = secao.querySelector('form')
  const campoNome = form.elements.nome
  const erro = secao.querySelector('.erro')
  const botaoEnviar = form.querySelector('[type="submit"]')
  const botaoCancelar = form.querySelector('.botao--secundario')
  const lista = secao.querySelector('.habitos__lista')

  let editandoId = null

  function sairDaEdicao() {
    editandoId = null
    form.reset()
    botaoEnviar.textContent = 'Adicionar hábito'
    botaoCancelar.hidden = true
  }

  function entrarNaEdicao(habito) {
    editandoId = habito.id
    campoNome.value = habito.nome
    form.elements.tipo.value = habito.tipo
    botaoEnviar.textContent = 'Salvar alterações'
    botaoCancelar.hidden = false
    erro.textContent = ''
    campoNome.focus()
  }

  function criarBotao(texto, rotulo, aoClicar) {
    const botao = document.createElement('button')
    botao.type = 'button'
    botao.className = 'botao botao--secundario botao--pequeno'
    botao.textContent = texto
    botao.setAttribute('aria-label', rotulo)
    botao.addEventListener('click', aoClicar)
    return botao
  }

  function criarItem(habito) {
    const item = document.createElement('li')

    const nome = document.createElement('span')
    nome.className = 'habitos__nome'
    nome.textContent = habito.nome

    const tipo = document.createElement('span')
    tipo.className = 'habitos__tipo'
    tipo.textContent = ROTULO_TIPO[habito.tipo]

    const editar = criarBotao('Editar', `Editar ${habito.nome}`, () =>
      entrarNaEdicao(habito),
    )

    const arquivar = criarBotao(
      'Arquivar',
      `Arquivar ${habito.nome}`,
      async () => {
        await arquivarHabito(habito.id)
        if (editandoId === habito.id) sairDaEdicao()
        await desenharLista()
      },
    )

    item.append(nome, tipo, editar, arquivar)
    return item
  }

  async function desenharLista() {
    const habitos = await listarAtivos()
    lista.replaceChildren()

    if (habitos.length === 0) {
      const vazio = document.createElement('li')
      vazio.textContent = 'Nenhum hábito cadastrado ainda.'
      lista.append(vazio)
      return
    }

    for (const habito of habitos) lista.append(criarItem(habito))
  }

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    const dados = { nome: campoNome.value, tipo: form.elements.tipo.value }

    try {
      if (editandoId) await editarHabito(editandoId, dados)
      else await criarHabito(dados)
    } catch (e) {
      erro.textContent = e.message
      campoNome.focus()
      return
    }

    erro.textContent = ''
    sairDaEdicao()
    await desenharLista()
    campoNome.focus()
  })

  botaoCancelar.addEventListener('click', () => {
    erro.textContent = ''
    sairDaEdicao()
  })

  desenharLista()
}
