import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import Perfil from '../views/Perfil.vue'

// Vicerrectoría
import GestionUsuarios from '../components/vicerrectoria/GestionUsuarios.vue'
import GestionCarreras from '../components/vicerrectoria/GestionCarreras.vue'
import ConfiguracionPeriodos from '../components/vicerrectoria/ConfiguracionPeriodos.vue'

// Jefatura de Carrera
import GestionProfesoresAsignaciones from '../components/jefatura/GestionProfesoresAsignaciones.vue'
import RevisionPlaneaciones from '../components/jefatura/RevisionPlaneaciones.vue'
import RevisionAvances from '../components/jefatura/RevisionAvances.vue'

// Profesor
import MisAsignaciones from '../components/profesor/MisAsignaciones.vue'
import CrearPlaneacion from '../components/profesor/CrearPlaneacion.vue'
import CrearAvance from '../components/profesor/CrearAvance.vue'
import MisPlaneaciones from '../components/profesor/MisPlaneaciones.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { requiresGuest: true } },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/perfil', component: Perfil, meta: { requiresAuth: true } },

  // Vicerrectoría
  { path: '/usuarios', component: GestionUsuarios, meta: { requiresAuth: true, roles: ['VICERRECTORIA'] } },
  { path: '/carreras', component: GestionCarreras, meta: { requiresAuth: true, roles: ['VICERRECTORIA', 'JEFATURA_CARRERA'] } },
  { path: '/configuracion-periodos', component: ConfiguracionPeriodos, meta: { requiresAuth: true, roles: ['VICERRECTORIA'] } },

  // Jefatura de Carrera
  { path: '/asignaciones', component: GestionProfesoresAsignaciones, meta: { requiresAuth: true, roles: ['JEFATURA_CARRERA'] } },
  { path: '/revision-planeaciones', component: RevisionPlaneaciones, meta: { requiresAuth: true, roles: ['JEFATURA_CARRERA', 'VICERRECTORIA'] } },
  { path: '/revision-avances', component: RevisionAvances, meta: { requiresAuth: true, roles: ['JEFATURA_CARRERA', 'VICERRECTORIA'] } },

  // Profesor
  { path: '/mis-asignaciones', component: MisAsignaciones, meta: { requiresAuth: true, roles: ['PROFESOR'], allowJefaturaWithMaterias: true } },
  { path: '/crear-planeacion/:asignacionId', component: CrearPlaneacion, meta: { requiresAuth: true, roles: ['PROFESOR'], allowJefaturaWithMaterias: true } },
  { path: '/crear-avance/:planeacionId', component: CrearAvance, meta: { requiresAuth: true, roles: ['PROFESOR'], allowJefaturaWithMaterias: true } },
  { path: '/mis-planeaciones', component: MisPlaneaciones, meta: { requiresAuth: true, roles: ['PROFESOR'], allowJefaturaWithMaterias: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Guard de navegación
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const tokenTime = localStorage.getItem('token_time')

  const hasHybridProfesorAccess = !!(
    to.meta.allowJefaturaWithMaterias
    && user?.rol === 'JEFATURA_CARRERA'
    && user?.puede_ver_menu_profesor === true
  )

  // Expiración: 2 horas
  const MAX_TIME = 1000 * 60 * 60 * 2
  if (tokenTime && Date.now() - tokenTime > MAX_TIME) {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('token_time')
    return next('/login')
  }

  if (to.meta.requiresAuth && (!token || !user)) {
    next('/login')
  } else if (to.meta.requiresGuest && token) {
    next('/dashboard')
  } else if (to.meta.roles && (!user || (!to.meta.roles.includes(user.rol) && !hasHybridProfesorAccess))) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
