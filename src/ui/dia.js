import { listarAtivos } from '../data/habitos.js'
import { marcarHabito, registrosDoDia } from '../data/registros.js'
import { dataPorExtenso, hoje, mesDe } from '../utils/datas.js'

export function montarDia(raiz) {
  const secao = document.createElement('section')
  secao.className = 'dia'
  secao.setAttribute('aria-labelledby', 'dia-titulo')
  secao.innerHTML = `
    <h2 id="dia-titulo">Marcar o dia</h2>
    <div class="dia__data">
      <label for="dia-data">Data</label>
      <input id="dia-data" type="date" />
    </div>
    <p class="dia__extenso" aria-live="polite"></p>
    <p class="erro" role="alert"></p>
    <ul class="dia__lista"></ul>
  `
  raiz.append(secao)

  const campoData = secao.querySelector('#dia-data')
  const extenso = secao.querySelector('.dia__extenso')
  const erro = secao.querySelector('.erro')
  const lista = secao.querySelector('.dia__lista')

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

  async function desenhar() {
    const dataDeHoje = hoje()
    campoData.min = `${mesDe(dataDeHoje)}-01`
    campoData.max = dataDeHoje
    if (!campoData.value) campoData.value = dataDeHoje

    const data = campoData.value
    extenso.textContent = dataPorExtenso(data)
    const [habitos, registros] = await Promise.all([
      listarAtivos(),
      registrosDoDia(data),
    ])

    lista.replaceChildren()

    if (habitos.length === 0) {
      const vazio = document.createElement('li')
      vazio.textContent = 'Cadastre um hábito para começar a marcar.'
      lista.append(vazio)
      return
    }

    for (const habito of habitos) {
      const registro = registros.find((r) => r.habitoId === habito.id)
      lista.append(criarItem(habito, data, registro?.feito === true))
    }
  }

  campoData.addEventListener('change', () => {
    if (!campoData.value || !campoData.checkValidity()) {
      erro.textContent = 'Escolha uma data entre o dia 1 do mês e hoje.'
      campoData.value = hoje()
    } else {
      erro.textContent = ''
    }
    desenhar()
  })

  document.addEventListener('habitos:alterados', desenhar)

  desenhar()
}
