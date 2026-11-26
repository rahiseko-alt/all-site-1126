import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import App from './App.vue'
import IndexPage from './pages/index.vue'
import ErrorPage from './pages/error.vue'
import { scrambleTextDirective } from './directives/scrambleText'
import './assets/main.css'

gsap.registerPlugin(ScrollTrigger)

const lenis = new Lenis({ duration: 1 })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add(time => {
  lenis.raf(time * 1000)
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: IndexPage },
    { path: '/:pathMatch(.*)*', component: ErrorPage }
  ]
})

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.provide('smoothscroll', lenis)
app.directive('scramble-text', scrambleTextDirective)
app.mount('#__nuxt')
