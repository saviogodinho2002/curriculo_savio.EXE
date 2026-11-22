// Sem CSS global aqui: cada rota carrega o próprio (portfólio e jogo /matrix
// têm estilos globais diferentes e não podem vazar um no outro).
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(router)

app.mount('#app')
