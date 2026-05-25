<template>

  <template v-if="isAuthenticated">

    <nav class="navbar">
      <div class="navbar-left">
        <div class="brand">
            <div>
              <img src="/escudonu.png" alt="NovaUniversitas" style="width: 27px; height: 38px;">
            </div>
          <span class="brand-name">NovaUniversitas</span>
          <span class="brand-pipe">|</span>
          <span class="brand-sub">Sistema de Planeación Académica</span>
        </div>
      </div>

      <div class="navbar-right">
        <div class="user-chip clickable" @click="$router.push('/perfil')" title="Ir a mi perfil">
          <div class="user-chip-avatar">
            {{ (user.nombre_completo || user.correo_institucional || '?')[0].toUpperCase() }}
          </div>

          <div class="user-chip-text">
            <span class="user-chip-name">
              {{ user.nombre_completo || user.correo_institucional }}
            </span>

            <span class="user-chip-role">
              {{ getRolNombre(user.rol) }}
            </span>
          </div>
        </div>
        <button @click="handleLogout" class="nav-btn nav-btn-exit" title="Cerrar Sesión">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Salir</span>
        </button>
      </div>
    </nav>

    <div class="app-container">

      <aside :class="['sidebar', { collapsed: sidebarCollapsed }]">
        <div class="sidebar-inner">

          <div class="sidebar-toggle-row">
            <button @click="toggleSidebar" class="sidebar-toggle" :title="sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="toggle-chevron">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
          </div>

          <div class="sidebar-section">
            <span class="sidebar-label">Principal</span>
            <ul class="menu">
              <li>
                <router-link to="/dashboard" class="menu-item" title="Inicio">
                  <span class="menu-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </span>
                  <span>Inicio</span>
                </router-link>
              </li>
            </ul>
          </div>

          <template v-if="user.rol === 'VICERRECTORIA'">
            <div class="sidebar-section">
              <span class="sidebar-label">Administración</span>
              <ul class="menu">
                <li>
                  <router-link to="/usuarios" class="menu-item" title="Gestión de Usuarios">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </span>
                    <span>Gestión de Usuarios</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/carreras" class="menu-item" title="Gestión de Carreras">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </span>
                    <span>Gestión de Carreras</span>
                  </router-link>
                </li>
                <router-link to="/configuracion-periodos" class="menu-item" title="Configuración de Periodos">
                  <span class="menu-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="12" y1="6" x2="12" y2="12" />
                      <line x1="12" y1="12" x2="16.5" y2="14.5" />
                    </svg>
                  </span>
                  <span>Configuración de Periodos</span>

                </router-link>
              </ul>
            </div>
          </template>

          <template v-if="user.rol === 'JEFATURA_CARRERA'">
            <div class="sidebar-section">
              <span class="sidebar-label">Académico</span>
              <ul class="menu">
                <li>
                  <router-link to="/asignaciones" class="menu-item" title="Gestión de Profesores y Asignaciones">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                      </svg>
                    </span>
                    <span>Gestión de Profesores y Asignaciones</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </template>

          <template v-if="['VICERRECTORIA', 'JEFATURA_CARRERA'].includes(user.rol)">
            <div class="sidebar-section">
              <span class="sidebar-label">Revisión</span>
              <ul class="menu">
                <li>
                  <router-link to="/revision-planeaciones" class="menu-item" title="Planeaciones Académicas">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </span>
                    <span>Planeaciones Académicas</span>
                    <span
                      v-if="user.rol === 'VICERRECTORIA' && pendientes.planeaciones > 0"
                      class="menu-badge"
                      title="Planeaciones pendientes de aprobación"
                    >{{ pendientes.planeaciones }}</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/revision-avances" class="menu-item" title="Avances Programáticos">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                    </span>
                    <span>Avances Programáticos</span>
                    <span
                      v-if="user.rol === 'VICERRECTORIA' && pendientes.avances > 0"
                      class="menu-badge"
                      title="Avances pendientes de aprobación"
                    >{{ pendientes.avances }}</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </template>

          <template v-if="user.rol === 'PROFESOR'">
            <div class="sidebar-section">
              <span class="sidebar-label">Mi Actividad</span>
              <ul class="menu">
                <li>
                  <router-link to="/mis-asignaciones" class="menu-item" title="Mis Materias Asignadas">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                      </svg>
                    </span>
                    <span>Mis Materias Asignadas</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/mis-planeaciones" class="menu-item" title="Mis Planeaciones y Avances">
                    <span class="menu-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </span>
                    <span>Mis Planeaciones y Avances</span>
                  </router-link>
                </li>
              </ul>
            </div>
          </template>

        </div>
      </aside>

      <main class="main-content">
        <router-view />
      </main>
    </div>
  </template>

  <template v-else>
    <router-view />
  </template>

</template>

<script>
import api from './services/api.js'

export default {
  name: 'App',
  data() {
    return {
      user: {},
      isAuthenticated: false,
      pendientes: { planeaciones: 0, avances: 0 },
      sidebarCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
    }
  },
  watch: {
    '$route'() {
      this.checkAuth()
      if (this.user?.rol === 'VICERRECTORIA') this.cargarPendientes()
    }
  },
  mounted() { this.checkAuth() },
  methods: {
    async checkAuth() {
      const token = localStorage.getItem('token')
      const publicRoutes = ['/login', '/']
      
      if (!token) {
        this.isAuthenticated = false
        if (!publicRoutes.includes(this.$route.path)) this.$router.push('/login')
        return
      }
      
      try {
        this.user = await api.getPerfil()
        localStorage.setItem('user', JSON.stringify({ ...this.user }))
        this.isAuthenticated = true
        if (this.user?.rol === 'VICERRECTORIA') this.cargarPendientes()
      } catch (error) {
        console.error('Error verificando autenticación:', error)
        this.isAuthenticated = false
        localStorage.removeItem('token')
        if (!publicRoutes.includes(this.$route.path)) this.$router.push('/login')
      }
    },

    async cargarPendientes() {
      try {
        const data = await api.getPendientesVicerrectoria()
        this.pendientes.planeaciones = data.planeaciones_pendientes
        this.pendientes.avances = data.avances_pendientes
      } catch {
        // silencioso — los badges simplemente no aparecen
      }
    },

    getRolNombre(rol) {
      const roles = { 
        'VICERRECTORIA': 'Vicerrectoría Académica', 
        'JEFATURA_CARRERA': 'Jefatura de Carrera', 
        'PROFESOR': 'Profesor/Profesora' 
      }
      return roles[rol] || rol
    },

    toggleSidebar() {
      this.sidebarCollapsed = !this.sidebarCollapsed
      localStorage.setItem('sidebar_collapsed', this.sidebarCollapsed)
    },

    async handleLogout() {
      try {
        if (localStorage.getItem('token')) {
          await api.logout()
        }
      } catch (e) {
        if (e?.message !== 'Unauthorized' && e?.message !== 'Failed to fetch') {
          console.error(e)
        }
      } finally {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('token_time')
        // Navigate first so the v-else <router-view> renders /login, not the
        // previous protected route (which would re-mount and fire API calls).
        await this.$router.push('/login')
        this.isAuthenticated = false
        this.user = null
      }
    }
    
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --bg: #eeece8;
  --surface: #f7f6f3;
  --sidebar-bg: #1c2333;
  --sidebar-hover: #263045;
  --sidebar-active: #2e3d5c;
  --sidebar-border: rgba(255, 255, 255, 0.07);
  --sidebar-text: rgba(255, 255, 255, 0.5);
  --sidebar-text-hover: rgba(255, 255, 255, 0.85);
  --sidebar-text-active: #ffffff;
  --sidebar-label: rgba(255, 255, 255, 0.25);
  --text: #1a1a1a;
  --text-muted: #6b7280;
  --border: #dedad4;
  --radius: 12px;
  --radius-sm: 8px;
}

body {
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
}

#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ─── TOPBAR ─── */
.navbar {
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding: 0 24px;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 32px;
  height: 32px;
  background: var(--sidebar-bg);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.brand-pipe {
  color: var(--border);
  font-weight: 300;
  font-size: 20px;
}

.brand-sub {
  font-size: 13px;
  color: var(--text-muted);
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 4px 13px 4px 4px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 50px;
}

.user-chip-avatar {
  width: 30px;
  height: 30px;
  background: var(--sidebar-bg);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.user-chip.clickable {
  cursor: pointer;
  transition: all 0.15s ease;
}

.user-chip.clickable:hover {
  background: rgba(0,0,0,0.05);
}

.user-chip-text {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.user-chip-name {
  font-weight: 600;
}

.user-chip-role {
  font-size: 12px;
  opacity: 0.75;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 36px;
  padding: 0 14px;
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 50px;
  color: var(--text-muted);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;
}

.nav-btn:hover {
  border-color: #c0bdb7;
  color: var(--text);
  background: var(--bg);
}

.nav-btn.nav-btn-exit:hover {
  border-color: #e8c9a0;
  color: #92400e;
  background: #fef9ee;
}

/* ─── LAYOUT ─── */
.app-container {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
}

/* ─── SIDEBAR ─── */
.sidebar {
  width: 248px;
  min-width: 248px;
  background: var(--sidebar-bg);
  position: sticky;
  top: 60px;
  height: calc(100vh - 60px);
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  transition: width 0.22s ease, min-width 0.22s ease;
}

/* ─── Sidebar colapsado ─── */
.sidebar.collapsed {
  width: 56px;
  min-width: 56px;
}

.sidebar.collapsed .sidebar-label {
  display: none;
}

.sidebar.collapsed .menu-item {
  justify-content: center;
  padding: 10px;
}

.sidebar.collapsed .menu-item span:not(.menu-icon) {
  display: none;
}

.sidebar.collapsed .menu-icon {
  opacity: 1;
  width: 20px;
  height: 20px;
}

/* ─── Botón toggle ─── */
.sidebar-toggle-row {
  display: flex;
  justify-content: flex-end;
  padding: 8px 10px 4px;
  flex-shrink: 0;
}

.sidebar.collapsed .sidebar-toggle-row {
  justify-content: center;
  padding: 8px 0 4px;
}

.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 7px;
  cursor: pointer;
  color: rgba(255,255,255,0.4);
  transition: background 0.12s, color 0.12s, border-color 0.12s;
  flex-shrink: 0;
}

.sidebar-toggle:hover {
  background: rgba(255,255,255,0.12);
  border-color: rgba(255,255,255,0.2);
  color: rgba(255,255,255,0.85);
}

.toggle-chevron {
  transition: transform 0.22s ease;
  flex-shrink: 0;
}

.sidebar.collapsed .toggle-chevron {
  transform: rotate(180deg);
}

.sidebar-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 14px 0;
}

.sidebar-section {
  padding: 10px 0 6px;
}

.sidebar-section+.sidebar-section {
  border-top: 1px solid var(--sidebar-border);
  margin-top: 4px;
  padding-top: 14px;
}

.sidebar-label {
  display: block;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--sidebar-label);
  padding: 0 14px 6px;
}

.menu {
  list-style: none;
  padding: 0 8px;
}

.menu li {
  margin-bottom: 1px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 10px;
  color: var(--sidebar-text);
  text-decoration: none;
  font-size: 13.5px;
  font-weight: 500;
  border-radius: var(--radius-sm);
  transition: background 0.12s, color 0.12s;
}

.menu-item:hover {
  background: var(--sidebar-hover);
  color: var(--sidebar-text-hover);
}

.menu-item.router-link-active {
  background: var(--sidebar-active);
  color: var(--sidebar-text-active);
  font-weight: 600;
}

.menu-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  opacity: 0.65;
}

.menu-item:hover .menu-icon,
.menu-item.router-link-active .menu-icon {
  opacity: 1;
}

.menu-badge {
  margin-left: auto;
  background: #ef4444;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 3px 6px;
  border-radius: 999px;
  min-width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.sidebar-footer {
  margin-top: auto;
  padding: 14px 14px 6px;
  border-top: 1px solid var(--sidebar-border);
}

.period-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  color: var(--sidebar-label);
}

.period-badge strong {
  color: rgba(255, 255, 255, 0.4);
  font-weight: 600;
}

.sidebar::-webkit-scrollbar {
  width: 3px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
}

/* ─── MAIN ─── */
.main-content {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: var(--bg);
}

.main-content>* {
  width: 100%;
  max-width: none;
}

/* ─── RESPONSIVE ─── */
@media (max-width: 1024px) {

  .brand-sub,
  .brand-pipe {
    display: none;
  }

  .main-content {
    padding: 20px;
  }
}

@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
    height: 56px;
  }

  .user-chip-text {
    display: none;
  }

  .sidebar {
    position: fixed;
    left: -248px;
    top: 56px;
    height: calc(100vh - 56px);
    z-index: 99;
    transition: left 0.25s ease;
    box-shadow: 6px 0 24px rgba(0, 0, 0, 0.25);
    width: 248px !important;
    min-width: 248px !important;
  }

  .sidebar.open {
    left: 0;
  }

  .sidebar-toggle { display: none; }

  .main-content {
    padding: 16px;
  }

  .app-container {
    flex-direction: column;
  }
}
</style>
