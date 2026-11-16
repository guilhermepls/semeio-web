import { criarHabito, editarHabito, listarAtivos } from '../data/habitos.js'
import { hoje, mesDe } from '../utils/datas.js'
import { criarDialogo } from './dialogo.js'

export async function abrirDialogoHabito({
  habito = null,
  tipoInicial = 'comum',
} = {}) {
  const editando = habito !== null
  const ativos = await listarAtivos()
  const mesAtual = mesDe(hoje())
  const objetivoAtual = ativos.find(
    (h) => h.tipo === 'objetivo' && h.mes === mesAtual && h.id !== habito?.id,
  )

  const dialogo = criarDialogo(editando ? 'Editar hábito' : 'Novo hábito')
  dialogo.corpo.innerHTML = `
    <p class="texto-apoio">Comece pequeno. Um hábito simples, repetido, vale mais que um plano ambicioso.</p>
    <form class="dialogo__form" novalidate>
      <div class="campo">
        <label class="campo__rotulo" for="habito-nome">Nome do hábito</label>
        <input id="habito-nome" name="nome" type="text" maxlength="60" autocomplete="off" required autofocus />
        <p class="texto-apoio">Escolha algo claro, que caiba no seu dia.</p>
      </div>
      <fieldset class="campo">
        <legend class="campo__rotulo">Tipo de hábito</legend>
        <label class="opcao">
          <input type="radio" name="tipo" value="objetivo" />
          <span>
            <span class="opcao__titulo">Objetivo do mês</span>
            <span class="texto-apoio">O hábito que recebe sua atenção principal. Só um por mês.</span>
          </span>
        </label>
        <p class="texto-apoio" data-aviso-objetivo hidden></p>
        <label class="opcao">
          <input type="radio" name="tipo" value="comum" />
          <span>
            <span class="opcao__titulo">Hábito comum</span>
            <span class="texto-apoio">Rotinas de apoio ao seu dia. Você pode ter quantas quiser.</span>
          </span>
        </label>
      </fieldset>
      <p class="erro" role="alert"></p>
      <div class="dialogo__acoes">
        <button type="button" class="botao botao--neutro" data-cancelar>Cancelar</button>
        <button type="submit" class="botao"></button>
      </div>
    </form>
  `

  const form = dialogo.corpo.querySelector('form')
  const erro = form.querySelector('.erro')
  const avisoObjetivo = form.querySelector('[data-aviso-objetivo]')
  const radioObjetivo = form.querySelector('input[value="objetivo"]')

  form.elements.nome.value = habito?.nome ?? ''
  form.querySelector('[type="submit"]').textContent = editando
    ? 'Salvar alterações'
    : 'Adicionar hábito'

  let tipo = habito?.tipo ?? tipoInicial
  if (objetivoAtual) {
    radioObjetivo.disabled = true
    avisoObjetivo.hidden = false
    avisoObjetivo.textContent = `Neste mês já existe um: ${objetivoAtual.nome}. Para trocar, use Configurar no hábito que será o novo objetivo.`
    if (tipo === 'objetivo') tipo = 'comum'
  }
  form.elements.tipo.value = tipo

  form
    .querySelector('[data-cancelar]')
    .addEventListener('click', () => dialogo.fechar())

  form.addEventListener('submit', async (evento) => {
    evento.preventDefault()
    const dados = {
      nome: form.elements.nome.value,
      tipo: form.elements.tipo.value,
    }

    try {
      if (editando) await editarHabito(habito.id, dados)
      else await criarHabito(dados)
    } catch (e) {
      erro.textContent = e.message
      form.elements.nome.focus()
      return
    }

    dialogo.fechar()
    document.dispatchEvent(new CustomEvent('habitos:alterados'))
  })

  dialogo.abrir()
}
