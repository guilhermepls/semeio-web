import {
  arquivarHabito,
  definirObjetivo,
  editarHabito,
  excluirHabito,
  listarAtivos,
} from '../data/habitos.js'
import { hoje, mesDe } from '../utils/datas.js'
import { criarDialogo } from './dialogo.js'
import { confirmar } from './dialogoConfirmacao.js'
import { abrirDialogoHabito } from './dialogoHabito.js'

function criarAcao(titulo, descricao, rotulo, aoClicar) {
  const item = document.createElement('li')
  item.className = 'acao'

  const texto = document.createElement('div')
  texto.className = 'acao__texto'

  const tituloEl = document.createElement('span')
  tituloEl.className = 'acao__titulo'
  tituloEl.textContent = titulo

  const descricaoEl = document.createElement('span')
  descricaoEl.className = 'texto-apoio'
  descricaoEl.textContent = descricao

  texto.append(tituloEl, descricaoEl)

  const botao = document.createElement('button')
  botao.type = 'button'
  botao.className = 'botao botao--neutro'
  botao.textContent = rotulo
  botao.addEventListener('click', aoClicar)

  item.append(texto, botao)
  return item
}

export async function abrirDialogoConfigurar(habito) {
  const ativos = await listarAtivos()
  const mesAtual = mesDe(hoje())
  const ehObjetivoDoMes = habito.tipo === 'objetivo' && habito.mes === mesAtual
  const objetivoAtual = ativos.find(
    (h) => h.tipo === 'objetivo' && h.mes === mesAtual && h.id !== habito.id,
  )

  const dialogo = criarDialogo('Configurar hábito')

  const resumo = document.createElement('p')
  resumo.className = 'texto-apoio'
  resumo.textContent = `${habito.nome} · ${ehObjetivoDoMes ? 'Objetivo do mês' : 'Hábito comum'}`

  const erro = document.createElement('p')
  erro.className = 'erro'
  erro.setAttribute('role', 'alert')

  async function executar(acao) {
    try {
      await acao()
    } catch (e) {
      erro.textContent = e.message
      return
    }
    dialogo.fechar()
    document.dispatchEvent(new CustomEvent('habitos:alterados'))
  }

  const lista = document.createElement('ul')
  lista.className = 'acoes-lista'

  lista.append(
    criarAcao(
      'Editar nome',
      'Mude como o hábito aparece na sua lista.',
      'Editar',
      () => {
        dialogo.fechar()
        abrirDialogoHabito({ habito })
      },
    ),
  )

  if (ehObjetivoDoMes) {
    lista.append(
      criarAcao(
        'Tornar hábito comum',
        'Você ficará sem objetivo neste mês até escolher outro.',
        'Tornar comum',
        () =>
          executar(() =>
            editarHabito(habito.id, { nome: habito.nome, tipo: 'comum' }),
          ),
      ),
    )
  } else {
    const descricao = objetivoAtual
      ? `O objetivo atual, ${objetivoAtual.nome}, passa a ser comum.`
      : 'Ele passa a receber sua atenção principal neste mês.'
    lista.append(
      criarAcao('Tornar objetivo do mês', descricao, 'Tornar objetivo', () =>
        executar(() => definirObjetivo(habito.id)),
      ),
    )
  }

  lista.append(
    criarAcao(
      'Arquivar',
      'O hábito sai da sua lista, mas o histórico continua guardado.',
      'Arquivar',
      () => executar(() => arquivarHabito(habito.id)),
    ),
  )

  const zonaPerigo = document.createElement('section')
  zonaPerigo.className = 'zona-perigo'

  const tituloPerigo = document.createElement('h3')
  tituloPerigo.className = 'zona-perigo__titulo'
  tituloPerigo.textContent = 'Excluir hábito'

  const avisoPerigo = document.createElement('p')
  avisoPerigo.className = 'texto-apoio'
  avisoPerigo.textContent =
    'Isso apaga o hábito e todo o histórico dele. Vamos pedir sua confirmação antes.'

  const excluir = document.createElement('button')
  excluir.type = 'button'
  excluir.className = 'botao botao--perigo'
  excluir.textContent = 'Excluir hábito'
  excluir.addEventListener('click', async () => {
    const confirmou = await confirmar({
      titulo: 'Excluir hábito?',
      texto: `Excluir "${habito.nome}" apaga também todo o histórico dele. Se quiser manter o histórico, use Arquivar.`,
      rotuloConfirmar: 'Excluir hábito',
      perigo: true,
    })
    if (confirmou) executar(() => excluirHabito(habito.id))
  })

  zonaPerigo.append(tituloPerigo, avisoPerigo, excluir)

  const concluir = document.createElement('button')
  concluir.type = 'button'
  concluir.className = 'botao'
  concluir.textContent = 'Concluir'
  concluir.addEventListener('click', () => dialogo.fechar())

  const acoes = document.createElement('div')
  acoes.className = 'dialogo__acoes'
  acoes.append(concluir)

  dialogo.corpo.append(resumo, lista, erro, zonaPerigo, acoes)
  dialogo.abrir()
}
