import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import MainLayout from '../layouts/MainLayout.vue'

import Home from '../pages/Home.vue'
import Trails from '../pages/Trails.vue'
import TrailDetail from '../pages/TrailDetail.vue'
import Report from '../pages/Report.vue'
import Admin from '../pages/Admin.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'trails', component: Trails },
      { path: 'trail/:id', component: TrailDetail, props: true },
      { path: 'report', component: Report },
      { path: 'admin', component: Admin }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
