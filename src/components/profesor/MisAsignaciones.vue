<template>
  <div class="page-container">

    <!-- Header -->
    <div class="page-header">
      <div>
        <h1>Mis Materias Asignadas</h1>
      </div>
      <div class="periodo-selector">
        <label>Periodo</label>
        <select v-model="periodoFiltro" class="select-periodo">
          <option value="">Todos los periodos</option>
          <option v-for="periodo in periodos" :key="periodo" :value="periodo">{{ periodo }}</option>
        </select>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-container">
      <div class="stat-card">
        <div class="stat-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ asignacionesFiltradas.length }}</div>
          <div class="stat-label">Materias Asignadas</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ totalPlaneaciones }}</div>
          <div class="stat-label">Planeaciones</div>
        </div>
      </div>
      <div class="stat-card success">
        <div class="stat-icon-wrap success">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ planeacionesAprobadas }}</div>
          <div class="stat-label">Aprobadas</div>
        </div>
      </div>
      <div class="stat-card warning">
        <div class="stat-icon-wrap warning">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-number">{{ planeacionesPendientes }}</div>
          <div class="stat-label">Pendientes</div>
        </div>
      </div>
    </div>

    <!-- Grid asignaciones -->
    <div class="asignaciones-grid">
      <div v-for="asignacion in asignacionesFiltradas" :key="asignacion.id" class="asignacion-card">

        <div class="card-top">
          <div class="card-title-group">
            <h3>{{ asignacion.materia_nombre }}</h3>
            <p class="materia-clave">{{ asignacion.materia_clave }}</p>
          </div>
          <span :class="['badge-estado', getEstadoClass(asignacion)]">{{ getEstadoTexto(asignacion) }}</span>
        </div>

        <div class="card-meta">
          <div class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            </svg>
            {{ asignacion.carrera_nombre }}
          </div>
          <div class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {{ asignacion.periodo_escolar }}
          </div>
          <div class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            Grupo {{ asignacion.grupo }}
          </div>
        </div>

        <!-- Planeación info -->
        <div v-if="asignacion.planeacion" class="planeacion-info">
          <div class="planeacion-info-header">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Planeación Académica</span>
            <span :class="['badge-planeacion', asignacion.planeacion.estado.toLowerCase()]">
              {{ getNombreEstadoPlaneacion(asignacion.planeacion.estado) }}
            </span>
          </div>
          <div class="planeacion-detalles">
            <p v-if="asignacion.planeacion.fecha_envio">
              <strong>Enviada:</strong> {{ formatearFecha(asignacion.planeacion.fecha_envio) }}
            </p>
            <p v-if="asignacion.planeacion.fecha_aprobacion">
              <strong>Aprobada:</strong> {{ formatearFecha(asignacion.planeacion.fecha_aprobacion) }}
            </p>
            <p v-if="asignacion.planeacion.observaciones_jefe" class="observaciones-warn">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {{ asignacion.planeacion.observaciones_jefe }}
            </p>
          </div>
        </div>

        <!-- Acciones -->
        <div class="card-acciones">
          <button v-if="!asignacion.planeacion" @click="crearPlaneacion(asignacion)"
            class="btn-action btn-primary-action btn-full">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Crear Planeación
          </button>
          <template v-else>
            <button @click="verPlaneacion(asignacion.planeacion)" class="btn-action btn-ghost-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Ver Planeación
            </button>
            <button v-if="asignacion.planeacion.estado === 'BORRADOR' || asignacion.planeacion.estado === 'RECHAZADA'"
              @click="editarPlaneacion(asignacion)" class="btn-action btn-ghost-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar
            </button>
            <button v-if="asignacion.planeacion.estado === 'APROBADA'" @click="verAvances(asignacion.planeacion)"
              class="btn-action btn-success-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Ver Avances
            </button>
          </template>
        </div>

      </div>
    </div>

    <!-- Empty states -->
    <div v-if="asignacionesActivas.length === 0 && !cargando" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <h3>No tienes materias activas asignadas</h3>
    </div>

    <div v-if="asignacionesFiltradas.length === 0 && asignacionesActivas.length > 0" class="empty-state">
      <div class="empty-icon">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
      <h3>No hay materias en este periodo</h3>
      <p>Selecciona otro periodo para ver tus asignaciones</p>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading-state">
      <div class="spinner-ring"></div>
      <p>Cargando tus asignaciones...</p>
    </div>

    <!-- Modal Ver Planeación -->
    <div v-if="mostrarModalDetalle && planeacionSeleccionada" class="modal-overlay"
      @click.self="mostrarModalDetalle = false">
      <div class="modal-custom">

        <div class="modal-header">
          <div class="modal-title-group">
            <h2>{{ planeacionSeleccionada.materia_nombre }}</h2>
            <span :class="['badge-planeacion', planeacionSeleccionada.estado.toLowerCase()]">
              {{ getNombreEstadoPlaneacion(planeacionSeleccionada.estado) }}
            </span>
          </div>
          <button @click="mostrarModalDetalle = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">

          <div class="modal-chips">
            <span class="mchip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {{ planeacionSeleccionada.periodo_escolar }}
            </span>
            <span class="mchip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              Grupo {{ planeacionSeleccionada.grupo }}
            </span>
            <span class="mchip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              {{ planeacionSeleccionada.horas_totales }} hrs totales
            </span>
          </div>

          <div class="msection" v-if="planeacionSeleccionada.observaciones_jefe">
            <div class="msection-label">Observaciones de jefatura · Realiza los cambios en Mis Planeaciones y Avances</div>
            <div class="obs-box">{{ planeacionSeleccionada.observaciones_jefe }}</div>
          </div>

          <div class="msection">
            <div class="msection-label">Objetivo general</div>
            <div class="msection-box texto-largo">{{ planeacionSeleccionada.objetivo_general || 'No especificado' }}</div>
          </div>

          <div class="msection"
            v-if="planeacionSeleccionada.contenidos && planeacionSeleccionada.contenidos.length > 0">
            <div class="msection-label">Contenidos por unidad</div>
            <div v-for="(contenido, index) in planeacionSeleccionada.contenidos" :key="index" class="unidad-row">
              <div class="unidad-badge">U{{ contenido.unidad }}</div>
              <div class="unidad-body">
                <span class="unidad-tema">{{ contenido.tema }}</span>
                <span v-if="contenido.periodo" class="unidad-meta">{{ contenido.periodo }}</span>
              </div>
              <div class="unidad-horas">{{ contenido.horas_planeadas }}<span>hrs</span></div>
            </div>
          </div>

          <div class="msection" v-if="planeacionSeleccionada.criterios_evaluacion">
            <div class="msection-label">Criterios de evaluación</div>
            <div v-for="(criterios, parcial) in planeacionSeleccionada.criterios_evaluacion" :key="parcial"
              class="criterios-bloque">
              <div class="parcial-tag">{{ getNombreParcial(parcial) }}</div>
              <div v-for="(criterio, i) in criterios" :key="i" class="criterio-row">
                <div class="criterio-left">
                  <span class="criterio-tipo">{{ criterio.tipo }}</span>
                  <span class="criterio-desc">{{ criterio.descripcion }}</span>
                </div>
                <div class="criterio-pct">{{ criterio.porcentaje }}%</div>
              </div>
            </div>
          </div>

          <div class="msection"
            v-if="planeacionSeleccionada.bibliografia_basica && planeacionSeleccionada.bibliografia_basica.filter(b => b).length > 0">
            <div class="msection-label">Bibliografía básica</div>
            <div v-for="(bib, i) in planeacionSeleccionada.bibliografia_basica.filter(b => b)" :key="i" class="bib-row">
              <span class="bib-num">{{ i + 1 }}</span>
              <span>{{ bib }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'MisAsignaciones',
  data() {
    return {
      asignaciones: [],
      planeaciones: [],
      avances: [],
      periodoFiltro: '',
      cargando: false,
      mostrarModalDetalle: false,
      planeacionSeleccionada: null
    }
  },
  computed: {
    asignacionesActivas() { return this.asignaciones.filter(a => a.activa === true) },
    asignacionesFiltradas() {
      let filtradas = this.asignacionesActivas
      if (this.periodoFiltro) filtradas = filtradas.filter(a => a.periodo_escolar === this.periodoFiltro)
      return filtradas
    },
    periodos() { return [...new Set(this.asignacionesActivas.map(a => a.periodo_escolar))].sort().reverse() },
    totalPlaneaciones() { return this.asignacionesActivas.filter(a => a.planeacion).length },
    planeacionesAprobadas() { return this.asignacionesActivas.filter(a => a.planeacion && a.planeacion.estado === 'APROBADA').length },
    planeacionesPendientes() { return this.asignacionesActivas.filter(a => a.planeacion && a.planeacion.estado === 'ENVIADA').length }
  },
  async mounted() {
    await this.cargarDatos()
  },
  methods: {
    normalizarLista(data) {
      return Array.isArray(data) ? data : data?.results || []
    },
    registroPerteneceAUsuario(registro, usuario) {
      if (!registro || !usuario) return false

      const userId = usuario.id != null ? String(usuario.id) : ''
      const userEmail = String(usuario.correo_institucional || usuario.email || '').trim().toLowerCase()
      const userNames = [
        usuario.nombre_completo,
        usuario.correo_institucional
      ].filter(Boolean).map(valor => String(valor).trim().toLowerCase())

      const idsRegistro = [
        registro.profesor,
        registro.profesor_id,
        registro.usuario,
        registro.usuario_id,
        registro.user,
        registro.user_id
      ].filter(valor => valor != null).map(valor => String(valor))

      const emailsRegistro = [
        registro.profesor_correo,
        registro.profesor_email,
        registro.profesor_correo_institucional,
        registro.correo_institucional,
        registro.email,
        registro.usuario_correo
      ].filter(Boolean).map(valor => String(valor).trim().toLowerCase())

      const nombresRegistro = [
        registro.profesor_nombre,
        registro.nombre_completo,
        registro.correo_institucional,
        registro.usuario_nombre
      ].filter(Boolean).map(valor => String(valor).trim().toLowerCase())

      return (userId && idsRegistro.includes(userId))
        || (userEmail && emailsRegistro.includes(userEmail))
        || userNames.some(nombre => nombresRegistro.includes(nombre))
    },
    filtrarAsignacionesPropias(asignaciones, usuario) {
      const camposPropietario = asignaciones.some(asignacion =>
        asignacion?.profesor != null
        || asignacion?.profesor_id != null
        || asignacion?.profesor_correo
        || asignacion?.profesor_email
        || asignacion?.profesor_correo_institucional
        || asignacion?.profesor_nombre
      )

      if (!camposPropietario) return asignaciones

      return asignaciones.filter(asignacion => this.registroPerteneceAUsuario(asignacion, usuario))
    },
    async cargarDatos() {
      this.cargando = true
      try {
        const usuarioActual = await api.getPerfil()
        const asignacionesResp = await api.getAsignaciones({ vista: 'profesor' })
        const asignaciones = this.normalizarLista(asignacionesResp)
        this.asignaciones = this.filtrarAsignacionesPropias(asignaciones, usuarioActual)

        const planeacionesResp = await api.getPlaneaciones({ vista: 'profesor' })
        const planeaciones = this.normalizarLista(planeacionesResp)
        this.avances = await api.getAvances({ vista: 'profesor' })

        const asignacionesIds = new Set(this.asignaciones.map(asignacion => asignacion.id))
        this.asignaciones.forEach(asignacion => {
          if (!asignacionesIds.has(asignacion.id)) return
          const planeacion = planeaciones.find(p => p.asignacion === asignacion.id)
          if (planeacion) asignacion.planeacion = planeacion
        })
      } catch (error) {
        console.error('Error cargando datos:', error)
        if (error?.message !== 'Unauthorized') {
          alert('Error al cargar tus asignaciones')
        }
      } finally {
        this.cargando = false
      }
    },
    getEstadoClass(asignacion) {
      if (!asignacion.planeacion) return 'sin-planeacion'
      const estado = asignacion.planeacion.estado
      if (estado === 'APROBADA') return 'aprobada'
      if (estado === 'ENVIADA') return 'enviada'
      if (estado === 'CON_OBSERVACIONES') return 'con-observaciones'
      return 'borrador'
    },
    getEstadoTexto(asignacion) {
      if (!asignacion.planeacion) return 'Sin Planeación'
      const nombres = { 'BORRADOR': 'Borrador', 'ENVIADA': 'En Revisión', 'APROBADA': 'Aprobada', 'CON_OBSERVACIONES': 'Con Observaciones' }
      return nombres[asignacion.planeacion.estado] || asignacion.planeacion.estado
    },
    getNombreEstadoPlaneacion(estado) {
      const nombres = { 'BORRADOR': 'Borrador', 'ENVIADA': 'En Revisión', 'ENVIADO': 'En Revisión', 'APROBADA': 'Aprobada', 'APROBADO': 'Aprobado', 'CON_OBSERVACIONES': 'Con Observaciones' }
      return nombres[estado] || estado
    },
    getNombreParcial(parcial) {
      const nombres = { 'parcial1': 'Parcial 1', 'parcial2': 'Parcial 2', 'parcial3': 'Parcial 3', 'ordinario': 'Ordinario' }
      return nombres[parcial] || parcial
    },
    getNombreAvance(numero) {
      const nombres = { 1: 'Parcial 1', 2: 'Parcial 2', 3: 'Parcial 3', 4: 'Ordinario' }
      return nombres[numero] || `Avance ${numero}`
    },
    tieneAvance(planeacionId, numero) { return this.avances.some(a => a.planeacion === planeacionId && a.numero_avance === numero) },
    getEstadoAvance(planeacionId, numero) { const avance = this.avances.find(a => a.planeacion === planeacionId && a.numero_avance === numero); return avance ? avance.estado : '' },
    crearPlaneacion(asignacion) { this.$router.push(`/crear-planeacion/${asignacion.id}`) },
    editarPlaneacion(asignacion) { this.$router.push(`/crear-planeacion/${asignacion.id}`) },
    verPlaneacion(planeacion) { this.planeacionSeleccionada = planeacion; this.mostrarModalDetalle = true },
    crearAvance(planeacionId, numero) { this.$router.push(`/crear-avance/${planeacionId}?numero=${numero}`) },
    verAvances(planeacion) { this.$router.push('/mis-planeaciones') },
    formatearFecha(fecha) {
      if (!fecha) return 'No disponible'
      return new Date(fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.page-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ─── Header ─── */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.periodo-selector {
  display: flex;
  align-items: center;
  gap: 8px;
}

.periodo-selector label {
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
}

.select-periodo {
  padding: 8px 12px;
  border: 1.5px solid #dedad4;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  background: #f7f6f3;
  color: #1a1a1a;
  cursor: pointer;
  outline: none;
}

.select-periodo:focus {
  border-color: #1c2333;
}

/* ─── Stats ─── */
.stats-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f7f6f3;
  border-radius: 12px;
  padding: 18px;
  display: flex;
  align-items: center;
  gap: 14px;
  border: 1px solid #dedad4;
  transition: transform 0.15s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon-wrap {
  width: 40px;
  height: 40px;
  background: #eeece8;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1c2333;
  border: 1px solid #dedad4;
  flex-shrink: 0;
}

.stat-icon-wrap.success {
  background: #f0fdf4;
  color: #16a34a;
  border-color: #bbf7d0;
}

.stat-icon-wrap.warning {
  background: #fef9ee;
  color: #d97706;
  border-color: #fbd5a5;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1;
  letter-spacing: -0.5px;
}

.stat-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 2px;
}

/* ─── Grid ─── */
.asignaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

.asignacion-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid #dedad4;
  transition: transform 0.15s, box-shadow 0.15s;
}

.asignacion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #dedad4;
  gap: 12px;
}

.card-title-group h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 3px;
}

.materia-clave {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
}

/* ─── Badges ─── */
.badge-estado {
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-estado.sin-planeacion {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

.badge-estado.borrador {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.badge-estado.enviada {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

.badge-estado.aprobada {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-estado.con-observaciones {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.badge-planeacion {
  padding: 3px 9px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
}

.badge-planeacion.borrador {
  background: #eff6ff;
  color: #1d4ed8;
}

.badge-planeacion.enviada,
.badge-planeacion.enviado {
  background: #fef9ee;
  color: #d97706;
}

.badge-planeacion.aprobada,
.badge-planeacion.aprobado {
  background: #f0fdf4;
  color: #16a34a;
}

.badge-planeacion.con-observaciones {
  background: #fff8f0;
  color: #c2410c;
}

/* ─── Meta ─── */
.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12.5px;
  color: #6b7280;
}

/* ─── Planeación info ─── */
.planeacion-info {
  background: #eeece8;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 16px;
  border: 1px solid #dedad4;
}

.planeacion-info-header {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 10px;
}

.planeacion-detalles p {
  font-size: 12.5px;
  color: #6b7280;
  margin: 4px 0;
}

.observaciones-warn {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  background: #fef9ee;
  border: 1px solid #fbd5a5;
  color: #92400e;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 12px;
  margin-top: 8px;
}

/* ─── Acciones ─── */
.card-acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.btn-action {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
}

.btn-primary-action {
  background: #1c2333;
  color: white;
}

.btn-primary-action:hover {
  background: #263045;
}

.btn-ghost-action {
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
}

.btn-ghost-action:hover {
  border-color: #1c2333;
  color: #1a1a1a;
}

.btn-success-action {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-success-action:hover {
  background: #dcfce7;
}

.btn-full {
  width: 100%;
  justify-content: center;
}

/* ─── Empty & Loading ─── */
.empty-state {
  text-align: center;
  padding: 72px 20px;
  background: #f7f6f3;
  border-radius: 14px;
  border: 1px solid #dedad4;
}

.empty-icon {
  width: 72px;
  height: 72px;
  background: #eeece8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: #9ca3af;
  border: 1px solid #dedad4;
}

.empty-state h3 {
  font-size: 17px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
}

.empty-state p {
  font-size: 14px;
  color: #9ca3af;
}

.loading-state {
  text-align: center;
  padding: 60px 20px;
}

.spinner-ring {
  width: 40px;
  height: 40px;
  border: 3px solid #dedad4;
  border-top-color: #1c2333;
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  font-size: 14px;
  color: #9ca3af;
}

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  backdrop-filter: blur(3px);
}

.modal-custom {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 22px 24px 18px;
  border-bottom: 1px solid #f0ede8;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 18px 18px 0 0;
}

.modal-title-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.modal-title-group h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.btn-cerrar {
  background: #f0ede8;
  border: none;
  border-radius: 8px;
  width: 30px;
  height: 30px;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.12s;
  flex-shrink: 0;
}

.btn-cerrar:hover {
  background: #dedad4;
  color: #1a1a1a;
}

.modal-body {
  padding: 20px 24px 28px;
}

.modal-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.mchip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f7f6f3;
  border: 1px solid #dedad4;
  border-radius: 50px;
  padding: 5px 13px;
  font-size: 12.5px;
  font-weight: 600;
  color: #374151;
}

.msection {
  margin-bottom: 22px;
}

.msection:last-child {
  margin-bottom: 0;
}

.msection-label {
  font-size: 11.5px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 10px;
}

.msection-box {
  background: #f7f6f3;
  border: 1px solid #e5e0d8;
  border-radius: 10px;
  padding: 14px 16px;
  font-size: 13.5px;
  color: #374151;
  line-height: 1.7;
}

.texto-largo {
  white-space: pre-line;
}

.unidad-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: #f7f6f3;
  border: 1px solid #dedad4;
  border-radius: 10px;
  margin-bottom: 7px;
}

.unidad-row:last-child {
  margin-bottom: 0;
}

.unidad-badge {
  background: #1c2333;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 5px;
  flex-shrink: 0;
}

.unidad-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.unidad-tema {
  font-size: 13.5px;
  font-weight: 600;
  color: #1a1a1a;
}

.unidad-meta {
  font-size: 11.5px;
  color: #9ca3af;
}

.unidad-horas {
  font-size: 15px;
  font-weight: 800;
  color: #1c2333;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.2;
}

.unidad-horas span {
  font-size: 10px;
  font-weight: 500;
  color: #9ca3af;
}

.criterios-bloque {
  margin-bottom: 12px;
}

.criterios-bloque:last-child {
  margin-bottom: 0;
}

.parcial-tag {
  display: inline-block;
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 5px;
  margin-bottom: 7px;
}

.criterio-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 9px 13px;
  background: #f7f6f3;
  border: 1px solid #dedad4;
  border-radius: 8px;
  margin-bottom: 5px;
}

.criterio-row:last-child {
  margin-bottom: 0;
}

.criterio-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.criterio-tipo {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.criterio-desc {
  font-size: 12px;
  color: #6b7280;
}

.criterio-pct {
  font-size: 17px;
  font-weight: 800;
  color: #16a34a;
  flex-shrink: 0;
}

.bib-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13.5px;
  color: #374151;
  line-height: 1.55;
  margin-bottom: 6px;
}

.bib-row:last-child {
  margin-bottom: 0;
}

.bib-num {
  background: #eeece8;
  color: #6b7280;
  font-size: 10.5px;
  font-weight: 700;
  min-width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.obs-box {
  background: #fef9ee;
  border: 1px solid #fbd5a5;
  border-left: 3px solid #f59e0b;
  padding: 13px 15px;
  border-radius: 10px;
  color: #92400e;
  font-size: 13.5px;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .asignaciones-grid {
    grid-template-columns: 1fr;
  }

  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .unidad-row {
    flex-wrap: wrap;
  }
}
</style>
