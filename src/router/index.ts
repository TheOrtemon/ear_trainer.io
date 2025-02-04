import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Home.vue'
import EarTrainer from '../components/EarTrainer.vue'
import MelodyTrainer from '../components/MelodyTrainer.vue'
import NotFound from '@/components/NotFound.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // { path: '/', name: 'home', component: Home },
    { path: '/', name: 'home', component: EarTrainer },
    // { path: '/chords', name: 'chords', component: EarTrainer },
    // { path: '/melody', name: 'melody', component: MelodyTrainer },
    // { path: '/404', name: 'NotFound', component: NotFound },
    // { path: '/:catchAll(.*)', name: 'NotFound', redirect: NotFound },
  ],
})

export default router
