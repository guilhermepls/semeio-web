const PAGINAS = {
  hoje: 'Hoje – Semeio',
  calendario: 'Calendário – Semeio',
}

export function iniciarRotas() {
  let atual = 'hoje'
  let primeira = true

  function aplicar() {
    const nome = location.hash.replace('#/', '')
    if (Object.hasOwn(PAGINAS, nome)) atual = nome

    for (const pagina of document.querySelectorAll('[data-pagina]')) {
      pagina.hidden = pagina.dataset.pagina !== atual
    }

    for (const link of document.querySelectorAll('[data-rota]')) {
      if (link.dataset.rota === atual) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }

    document.title = PAGINAS[atual]
    if (!primeira) document.querySelector('#conteudo').focus()
    primeira = false
    document.dispatchEvent(new CustomEvent('pagina:aberta', { detail: atual }))
  }

  window.addEventListener('hashchange', aplicar)
  aplicar()
}
