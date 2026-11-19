import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/700.css'
import '@fontsource/plus-jakarta-sans/800.css'
import './styles/tokens.css'
import './styles/base.css'
import './styles/layout.css'
import './styles/botoes.css'
import './styles/formularios.css'
import './styles/dialogo.css'
import './styles/hoje.css'
import './styles/calendario.css'
import './styles/dia.css'
import './styles/humor.css'
import { montarCabecalho } from './ui/cabecalho.js'
import { montarCalendario } from './ui/calendario.js'
import { montarHoje } from './ui/hoje.js'
import { iniciarRotas } from './ui/rotas.js'

montarCabecalho(document.querySelector('#cabecalho'))
montarHoje(document.querySelector('#pagina-hoje'))
montarCalendario(document.querySelector('#pagina-calendario'))
iniciarRotas()
