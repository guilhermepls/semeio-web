import './styles/tokens.css'
import './styles/base.css'
import './styles/dia.css'
import './styles/habitos.css'
import { montarDia } from './ui/dia.js'
import { montarHabitos } from './ui/habitos.js'

const app = document.querySelector('#app')
montarDia(app)
montarHabitos(app)
