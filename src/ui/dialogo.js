import { icones } from './icones.js'

let contador = 0

export function criarDialogo(titulo) {
  contador += 1
  const idTitulo = `dialogo-titulo-${contador}`

  const elemento = document.createElement('dialog')
  elemento.className = 'dialogo'
  elemento.setAttribute('aria-labelledby', idTitulo)
  elemento.innerHTML = `
    <div class="dialogo__conteudo">
      <div class="dialogo__topo">
        <h2 class="dialogo__titulo" id="${idTitulo}"></h2>
        <button type="button" class="icone-botao" aria-label="Fechar">${icones.fechar}</button>
      </div>
      <div class="dialogo__corpo"></div>
    </div>
  `
  elemento.querySelector('.dialogo__titulo').textContent = titulo

  elemento
    .querySelector('.icone-botao')
    .addEventListener('click', () => elemento.close())

  elemento.addEventListener('click', (evento) => {
    if (evento.target === elemento) elemento.close()
  })

  elemento.addEventListener('close', () => elemento.remove())

  return {
    elemento,
    corpo: elemento.querySelector('.dialogo__corpo'),
    abrir() {
      document.body.append(elemento)
      elemento.showModal()
    },
    fechar() {
      elemento.close()
    },
  }
}
