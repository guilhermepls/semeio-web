function svg(caminho, tamanho = 20, traco = 2) {
  return `<svg width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${caminho}</svg>`
}

export const icones = {
  mais: svg('<path d="M12 5v14M5 12h14"/>'),
  fechar: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  marcado: svg('<path d="M5 12l5 5 9-10"/>', 18, 3),
  ajustes: svg(
    '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
  ),
  anterior: svg('<path d="M15 18l-6-6 6-6"/>'),
  proximo: svg('<path d="M9 18l6-6-6-6"/>'),
}
