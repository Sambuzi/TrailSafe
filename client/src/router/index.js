import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Home from '../pages/Home.vue'
import Trails from '../pages/Trails.vue'
import TrailDetail from '../pages/TrailDetail.vue'
import Report from '../pages/Report.vue'
import Admin from '../pages/Admin.vue'
import Register from '../pages/Register.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/login', component: Login },
  { path: '/home', component: Home },
  { path: '/trails', component: Trails },
  { path: '/trail/:id', component: TrailDetail, props: true },
  { path: '/report', component: Report },
  { path: '/admin', component: Admin },
  { path: '/register', component: Register }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
