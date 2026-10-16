const OPCOES = ['', '1', '2', '3', '4', '5']

export function criarSeletorHumor() {
  const conjunto = document.createElement('fieldset')
  conjunto.className = 'humor'
  conjunto.setAttribute('aria-describedby', 'humor-dica')

  const legenda = document.createElement('legend')
  legenda.textContent = 'Humor do dia'

  const dica = document.createElement('p')
  dica.id = 'humor-dica'
  dica.className = 'humor__dica'
  dica.textContent = '1 é o pior, 5 é o melhor.'

  const opcoes = document.createElement('div')
  opcoes.className = 'humor__opcoes'

  for (const valor of OPCOES) {
    const rotulo = document.createElement('label')

    const radio = document.createElement('input')
    radio.type = 'radio'
    radio.name = 'humor'
    radio.value = valor

    const texto = document.createElement('span')
    texto.textContent = valor === '' ? 'Sem registro' : valor

    rotulo.append(radio, texto)
    opcoes.append(rotulo)
  }

  conjunto.append(legenda, dica, opcoes)

  return {
    elemento: conjunto,
    obter() {
      const marcado = conjunto.querySelector('input:checked')
      return marcado && marcado.value !== '' ? Number(marcado.value) : null
    },
    definir(humor) {
      const valor = humor === null ? '' : String(humor)
      conjunto.querySelector(`input[value="${valor}"]`).checked = true
    },
  }
}
