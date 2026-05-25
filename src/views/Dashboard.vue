<template>
  <div class="dashboard-content">

    <!-- Bienvenida -->
    <div class="welcome-section">
      <div class="welcome-text">
        <p class="greeting">Bienvenido de nuevo</p>
        <h1>{{ user?.nombre_completo || user?.correo_institucional || 'Usuario' }}</h1>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats-grid">

      <template v-if="user?.rol === 'VICERRECTORIA'">
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total_usuarios || 0 }}</div>
            <div class="stat-label">Usuarios</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total_carreras || 0 }}</div>
            <div class="stat-label">Carreras</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total_materias || 0 }}</div>
            <div class="stat-label">Materias</div>
          </div>
        </div>
      </template>

      <template v-else-if="user?.rol === 'JEFATURA_CARRERA'">
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.total_profesores || 0 }}</div>
            <div class="stat-label">Profesores</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.planeaciones_pendientes || 0 }}</div>
            <div class="stat-label">Planeaciones Pendientes</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.avances_pendientes || 0 }}</div>
            <div class="stat-label">Avances Pendientes</div>
          </div>
        </div>
      </template>

      <template v-else-if="user?.rol === 'PROFESOR'">
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.mis_materias || 0 }}</div>
            <div class="stat-label">Mis Materias</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.planeaciones_creadas || 0 }}</div>
            <div class="stat-label">Planeaciones</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap success">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div class="stat-info">
            <div class="stat-number">{{ stats.planeaciones_aprobadas || 0 }}</div>
            <div class="stat-label">Aprobadas</div>
          </div>
        </div>
      </template>

    </div>

    <!-- Fila inferior -->
    <div class="bottom-row">

      <!-- Acciones rápidas -->
      <div class="section-card actions-section">
        <div class="section-header">
          <h2>Acciones Rápidas</h2>
        </div>
        <div class="actions-grid">

          <template v-if="user?.rol === 'VICERRECTORIA'">
            <button @click="$router.push('/usuarios')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Gestionar Usuarios</span>
                <span class="action-sub">Administra cuentas y roles</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button @click="$router.push('/carreras')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                  <path d="M6 12v5c3 3 9 3 12 0v-5" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Gestionar Carreras</span>
                <span class="action-sub">Configura programas académicos</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </template>

          <template v-else-if="user?.rol === 'JEFATURA_CARRERA'">
            <button @click="$router.push('/profesores')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Mis Profesores</span>
                <span class="action-sub">Consulta tu planta docente</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button @click="$router.push('/revision-planeaciones')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Revisar Planeaciones</span>
                <span class="action-sub">Aprueba o rechaza planeaciones</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button @click="$router.push('/revision-avances')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Revisar Avances</span>
                <span class="action-sub">Seguimiento de avances docentes</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </template>

          <template v-else-if="user?.rol === 'PROFESOR'">
            <button @click="$router.push('/mis-asignaciones')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Mis Materias</span>
                <span class="action-sub">Revisa tus asignaciones activas</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
            <button @click="$router.push('/mis-planeaciones')" class="action-btn">
              <div class="action-icon-wrap">
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </div>
              <div class="action-details">
                <span class="action-title">Mis Planeaciones</span>
                <span class="action-sub">Crea y gestiona tus planeaciones</span>
              </div>
              <svg class="action-arrow" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </template>

        </div>
      </div>



    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Dashboard',
  data() {
    return {
      user: null,
      stats: {},
      isActive: true
    }
  },
  mounted() { this.cargarDatos() },
  beforeUnmount() {
    this.isActive = false
  },
  methods: {
    async cargarDatos() {
      try {
        this.user = await api.getPerfil()
        if (!this.isActive || !this.user) return
        await this.cargarEstadisticas()
      } catch (error) {
        if (error?.message !== 'Unauthorized') {
          console.error('Error cargando datos:', error)
        }
        this.user = null
        this.stats = {}
      }
    },
    async cargarEstadisticas() {
      try {
        if (!this.isActive || !this.user?.rol) {
          this.stats = {}
          return
        }

        if (this.user.rol === 'VICERRECTORIA') {

          const usuariosResp = await api.getUsuarios()
          const carrerasResp = await api.getCarreras()
          const materiasResp = await api.getMaterias()

          const usuarios = Array.isArray(usuariosResp)
            ? usuariosResp
            : usuariosResp?.results || []

          const carreras = Array.isArray(carrerasResp)
            ? carrerasResp
            : carrerasResp?.results || []

          const materias = Array.isArray(materiasResp)
            ? materiasResp
            : materiasResp?.results || []

          this.stats = {
            total_usuarios: usuarios.length,
            total_carreras: carreras.length,
            total_materias: materias.length
          }

        } else if (this.user.rol === 'JEFATURA_CARRERA') {
          const profesores = await api.getProfesores()
          const planeacionesResp = await api.getPlaneaciones()
          const avancesResp = await api.getAvances()
          const planeaciones = Array.isArray(planeacionesResp) ? planeacionesResp : planeacionesResp?.results || []
          const avances = Array.isArray(avancesResp) ? avancesResp : avancesResp?.results || []
          const profesoresArray = Array.isArray(profesores) ? profesores : profesores?.results || []
          this.stats = {
            total_profesores: profesoresArray.length,
            planeaciones_pendientes: planeaciones.filter(p => p.estado === 'ENVIADA').length,
            avances_pendientes: avances.filter(a => a.estado === 'ENVIADO').length
          }
        } else if (this.user.rol === 'PROFESOR') {
          const asignacionesResp = await api.getAsignaciones()
          const planeacionesResp = await api.getPlaneaciones()
          const asignaciones = Array.isArray(asignacionesResp) ? asignacionesResp : asignacionesResp?.results || []
          const planeaciones = Array.isArray(planeacionesResp) ? planeacionesResp : planeacionesResp?.results || []
          this.stats = {
            mis_materias: asignaciones.filter(a => a.activa).length,
            planeaciones_creadas: planeaciones.length,
            planeaciones_aprobadas: planeaciones.filter(p => p.estado === 'APROBADA').length
          }
        }
      } catch (error) { console.error('Error cargando estadísticas:', error) }
    },
    getRolNombre(rol) {
      const roles = { 'VICERRECTORIA': 'Vicerrectoría Academica', 'JEFATURA_CARRERA': 'Jefatura de Carrera', 'PROFESOR': 'Profesor/Profesora' }
      return roles[rol] || rol
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.dashboard-content {
  width: 100%;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ─── Bienvenida ─── */
.welcome-section {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 28px;
  flex-wrap: wrap;
  gap: 14px;
}

.greeting {
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  margin-bottom: 5px;
}

.welcome-text h1 {
  font-size: clamp(22px, 2.8vw, 32px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  line-height: 1.1;
}

.role-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #1c2333;
  color: white;
  padding: 7px 16px;
  border-radius: 50px;
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
}

.role-dot {
  width: 7px;
  height: 7px;
  background: #4ade80;
  border-radius: 50%;
  box-shadow: 0 0 6px #4ade80;
}

/* ─── Stats ─── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 22px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  border: 1px solid #dedad4;
  transition: transform 0.18s, box-shadow 0.18s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.stat-icon-wrap {
  width: 44px;
  height: 44px;
  background: #eeece8;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1c2333;
  flex-shrink: 0;
  border: 1px solid #dedad4;
}

.stat-icon-wrap.warning {
  background: #fef9ee;
  color: #d97706;
  border-color: #fbd5a5;
}

.stat-icon-wrap.success {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.stat-number {
  font-size: 34px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  letter-spacing: -1px;
}

.stat-label {
  font-size: 13px;
  color: #9ca3af;
  margin-top: 3px;
}

/* ─── Bottom row ─── */
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 16px;
  align-items: start;
}

.section-card,
.periodo-section {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 24px;
  border: 1px solid #dedad4;
}

.section-header {
  margin-bottom: 18px;
}

.section-header h2 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.2px;
}

/* ─── Acciones ─── */
.actions-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: #eeece8;
  border: 1px solid #dedad4;
  border-radius: 12px;
  cursor: pointer;
  transition: border-color 0.12s, background 0.12s, box-shadow 0.12s;
  text-align: left;
  width: 100%;
}

.action-btn:hover {
  border-color: #1c2333;
  background: #f7f6f3;
  box-shadow: 0 3px 12px rgba(28, 35, 51, 0.08);
}

.action-btn:hover .action-icon-wrap {
  background: #1c2333;
  color: white;
  border-color: #1c2333;
}

.action-icon-wrap {
  width: 38px;
  height: 38px;
  background: #f7f6f3;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1c2333;
  flex-shrink: 0;
  border: 1px solid #dedad4;
  transition: background 0.12s, color 0.12s, border-color 0.12s;
}

.action-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.action-title {
  font-size: 13.5px;
  font-weight: 600;
  color: #1a1a1a;
}

.action-sub {
  font-size: 12px;
  color: #9ca3af;
}

.action-arrow {
  color: #d1cdc7;
  flex-shrink: 0;
  transition: color 0.12s;
}

.action-btn:hover .action-arrow {
  color: #6b7280;
}

/* ─── Periodo ─── */
.periodo-card {
  background: #1c2333;
  border-radius: 12px;
  padding: 22px;
  color: white;
}

.periodo-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 14px;
}

.periodo-tag {
  font-size: 10.5px;
  font-weight: 600;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  background: rgba(74, 222, 128, 0.18);
  color: #4ade80;
  padding: 4px 10px;
  border-radius: 50px;
}

.periodo-nombre {
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.5px;
}

.periodo-divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.08);
  margin-bottom: 14px;
}

.periodo-fechas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 18px;
}

.fecha-item {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(255, 255, 255, 0.5);
}

.fecha-item svg {
  flex-shrink: 0;
}

.fecha-item div {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.fecha-label {
  font-size: 10px;
  letter-spacing: 0.4px;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.35);
}

.fecha-value {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.periodo-progress {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4ade80, #22c55e);
  border-radius: 4px;
}

.progress-label {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
}

/* ─── Responsive ─── */
@media (max-width: 900px) {
  .bottom-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .welcome-section {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
