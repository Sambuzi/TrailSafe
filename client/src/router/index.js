import { createRouter, createWebHistory } from 'vue-router'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import MainLayout from '../layouts/MainLayout.vue'

import Home from '../pages/Home.vue'
import Map from '../pages/Map.vue'

import AIExplore from '../pages/AIExplore.vue'
import TrailDetail from '../pages/TrailDetail.vue'
import Report from '../pages/Report.vue'
import Admin from '../pages/Admin.vue'
import AdminReports from '../pages/AdminReports.vue'
import AdminProfile from '../pages/AdminProfile.vue'
import Profile from '../pages/Profile.vue'
import Settings from '../pages/Settings.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  
  { path: '/register', component: Register },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'home', component: Home },
      { path: 'profile', component: Profile },
      { path: 'settings', component: Settings },
      { path: 'map', component: Map},
      { path: 'explore', component: AIExplore },
      { path: 'trail/:id', component: TrailDetail, props: true },
      { path: 'report', component: Report },
      { path: 'admin', component: Admin },
      { path: 'admin/reports', component: AdminReports },
      { path: 'admin/profile', component: AdminProfile }
    ]
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
