<template>
  <div class="page-container">

    <div class="page-header">
      <h1>Revisión de Planeaciones Académicas</h1>
    </div>

    <div class="filtros">
      <select v-model="filtroEstado" class="select-filtro">
        <option value="">Todos los estados</option>
        <option value="ENVIADA">Pendientes de Revisión</option>
        <option value="APROBADA">Aprobadas</option>
        <option value="CON_OBSERVACIONES">Con observaciones</option>
      </select>
      <input v-model="busqueda" type="text" placeholder="Buscar por profesor o materia..." class="input-busqueda" />
    </div>

    <div class="planeaciones-grid">
      <div v-for="planeacion in planeacionesFiltradas" :key="planeacion.id" class="planeacion-card">

        <div class="card-header">
          <div>
            <h3>{{ planeacion.materia_nombre }}</h3>
            <span class="avance-numero">{{ planeacion.carrera_nombre }}</span>
          </div>
          <div class="badges-container">
            <span :class="['badge-estado', getEstadoClass(planeacion.estado)]">
              {{ getEstadoNombre(planeacion.estado) }}
            </span>
            <span v-if="planeacion.revisor_requerido === 'VICERRECTORIA'" class="badge-jefe">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              </svg>
              Jefe-Profesor
            </span>
          </div>
        </div>

        <div class="card-meta">
          <span class="meta-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            {{ planeacion.profesor_nombre }}
          </span>
          <span class="meta-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            {{ planeacion.periodo_escolar }}
          </span>
          <span class="meta-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
            Grupo {{ planeacion.grupo }}
          </span>
          <span class="meta-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
            {{ formatearFecha(planeacion.fecha_envio) }}
          </span>
        </div>

        <div v-if="planeacion.revisor_requerido === 'VICERRECTORIA'" class="revisor-chip">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span><strong>Revisor:</strong> Vicerrectoría Académica</span>
        </div>

        <div v-if="planeacion.observaciones_jefe" class="card-observaciones">
          <span class="obs-label">Observaciones</span>
          <p>{{ planeacion.observaciones_jefe }}</p>
        </div>

        <div class="card-acciones">
          <button @click="verDetalle(planeacion)" class="btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
            Ver Detalle
          </button>

          <template v-if="planeacion.estado === 'ENVIADA'">
            <template v-if="puedeRevisar(planeacion)">
              <button @click="aprobar(planeacion)" class="btn-success">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Aprobar
              </button>
              <button @click="observacion(planeacion)" class="btn-warning">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                Observaciones
              </button>
            </template>
            <div v-else class="mensaje-bloqueo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <small>Este planeación debe ser revisada por Vicerrectoría Académica</small>
            </div>
          </template>

          <button v-if="planeacion.estado === 'APROBADA'" @click="generarPDFPlaneacion(planeacion)"
            class="btn-ghost" :disabled="generandoPDFPlaneacion === planeacion.id">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            {{ generandoPDFPlaneacion === planeacion.id ? 'Generando...' : 'Generar PDF' }}
          </button>

          <button v-if="planeacion.estado === 'APROBADA' && planeacion.tiene_pdf"
            @click="descargarPDFPlaneacion(planeacion)" class="btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Descargar PDF
          </button>
        </div>

      </div>
    </div>

    <div v-if="planeacionesFiltradas.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
        </svg>
      </div>
      <h3>No hay planeaciones para revisar</h3>
      <p>Intenta cambiar los filtros de búsqueda</p>
    </div>

    <!-- Modal Detalle Planeación -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-custom modal-large">

        <div class="modal-header">
          <div class="modal-title-group">
            <h2>{{ planeacionSeleccionada.materia_nombre }}</h2>
            <span :class="['badge-estado', getEstadoClass(planeacionSeleccionada.estado)]">
              {{ getEstadoNombre(planeacionSeleccionada.estado) }}
            </span>
          </div>
          <button @click="mostrarModal = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div v-if="planeacionSeleccionada" class="modal-body-scroll">

          <!-- Info cards -->
          <div class="info-strip">
            <div class="info-card">
              <div class="info-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">Profesor</span>
                <span class="info-card-value">{{ planeacionSeleccionada.profesor_nombre }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">Periodo</span>
                <span class="info-card-value">{{ planeacionSeleccionada.periodo_escolar }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">Grupo</span>
                <span class="info-card-value">{{ planeacionSeleccionada.grupo }}</span>
              </div>
            </div>
            <div class="info-card">
              <div class="info-card-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
              </div>
              <div class="info-card-content">
                <span class="info-card-label">Horas totales</span>
                <span class="info-card-value">{{ planeacionSeleccionada.horas_totales }} hrs</span>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div class="detalle-section obs-bg" v-if="planeacionSeleccionada.observaciones_jefe">
            <div class="section-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Observaciones de Jefatura de Carrera
            </div>
            <div class="obs-box">{{ planeacionSeleccionada.observaciones_jefe }}</div>
          </div>

          <!-- Objetivo -->
          <div class="detalle-section">
            <div class="section-title">Objetivo General</div>
            <p class="texto-largo">{{ planeacionSeleccionada.objetivo_general }}</p>
          </div>

          <!-- Contenidos -->
          <div class="detalle-section">
            <div class="section-title">Contenidos por Unidad</div>
            <div v-for="(contenido, index) in planeacionSeleccionada.contenidos" :key="index" class="unidad-card">
              <div class="unidad-header">
                <span class="unidad-badge">U{{ contenido.unidad }}</span>
                <h4>{{ obtenerPrimerLineaTema(contenido.tema) }}</h4>
              </div>
              <div class="tema-contenido">
                <pre class="tema-text">{{ contenido.tema }}</pre>
              </div>
              <div class="unidad-meta-row">
                <span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <strong>{{ contenido.horas_planeadas }} hrs</strong>
                </span>
                <span v-if="contenido.periodo">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ contenido.periodo }}
                </span>
              </div>
            </div>
          </div>

          <!-- Criterios -->
          <div class="detalle-section">
            <div class="section-title">Criterios de Evaluación</div>
            <div v-for="(criterios, parcial) in planeacionSeleccionada.criterios_evaluacion" :key="parcial" class="criterios-bloque">
              <div class="parcial-tag">{{ formatearNombreParcial(parcial) }}</div>
              <div class="criterios-grid">
                <div v-for="(criterio, i) in criterios" :key="i" class="criterio-card">
                  <div class="criterio-top">
                    <span class="criterio-tipo">{{ criterio.tipo }}</span>
                    <span class="criterio-pct">{{ criterio.porcentaje }}%</span>
                  </div>
                  <p class="criterio-desc">{{ criterio.descripcion }}</p>
                  <p class="criterio-instrumento">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    {{ criterio.instrumento }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Bibliografía básica -->
          <div class="detalle-section"
            v-if="planeacionSeleccionada.bibliografia_basica && getBibliografiaArray(planeacionSeleccionada.bibliografia_basica).length > 0">
            <div class="section-title">Bibliografía Básica</div>
            <div v-for="(ref, index) in getBibliografiaArray(planeacionSeleccionada.bibliografia_basica)" :key="index" class="bib-row">
              <span class="bib-num">{{ index + 1 }}</span>
              <span class="bib-text">{{ ref }}</span>
            </div>
          </div>

          <!-- Bibliografía complementaria -->
          <div class="detalle-section"
            v-if="planeacionSeleccionada.bibliografia_complementaria && getBibliografiaArray(planeacionSeleccionada.bibliografia_complementaria).length > 0">
            <div class="section-title">Bibliografía Complementaria</div>
            <div v-for="(ref, index) in getBibliografiaArray(planeacionSeleccionada.bibliografia_complementaria)" :key="index" class="bib-row">
              <span class="bib-num">{{ index + 1 }}</span>
              <span class="bib-text">{{ ref }}</span>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="modal-footer-actions">
          <div v-if="!puedeRevisar(planeacionSeleccionada) && planeacionSeleccionada.estado === 'ENVIADA'" class="mensaje-aviso">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ planeacionSeleccionada.revisor_requerido === 'VICERRECTORIA'
              ? 'Solo Vicerrectoría Académica puede aprobar o agregar observaciones.'
              : 'No tienes permiso para revisar esta planeación.' }}
          </div>
          <template v-if="puedeRevisar(planeacionSeleccionada)">
            <button v-if="planeacionSeleccionada.estado === 'ENVIADA'"
              @click="observacion(planeacionSeleccionada)" class="btn-warning">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Agregar Observaciones
            </button>
            <button v-if="planeacionSeleccionada.estado === 'ENVIADA'"
              @click="aprobar(planeacionSeleccionada)" class="btn-success">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Aprobar Planeación
            </button>
          </template>
        </div>

      </div>
    </div>

    <!-- Modal Observaciones -->
    <div v-if="mostrarModalObservaciones" class="modal-overlay" @click.self="mostrarModalObservaciones = false">
      <div class="modal-custom">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>Observaciones a la Planeación</h2>
          </div>
          <button @click="mostrarModalObservaciones = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="confirmarAccion" class="modal-body">
          <div class="form-group">
            <label>Observaciones *</label>
            <textarea v-model="observaciones" rows="5" required placeholder="Escribe las observaciones para la planeación..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="mostrarModalObservaciones = false" class="btn-ghost">Cancelar</button>
            <button type="submit" class="btn-warning" :disabled="guardando">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              {{ guardando ? 'Procesando...' : 'Enviar Observaciones' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'RevisionPlaneaciones',
  data() {
    return {
      planeaciones: [],
      filtroEstado: 'ENVIADA',
      busqueda: '',
      mostrarModal: false,
      mostrarModalObservaciones: false,
      planeacionSeleccionada: null,
      observaciones: '',
      generandoPDFPlaneacion: null,
      guardando: false,
      userRole: '',
    }
  },
  computed: {
    planeacionesFiltradas() {
      return this.planeaciones.filter(p => {
        if (this.filtroEstado && p.estado !== this.filtroEstado) return false
        if (this.busqueda) {
          const busq = this.busqueda.toLowerCase()
          return p.profesor_nombre.toLowerCase().includes(busq) ||
            p.materia_nombre.toLowerCase().includes(busq)
        }
        return true
      })
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (!userData) { this.$router.push('/login'); return }
    try {
      const user = JSON.parse(userData)
      this.userRole = user?.rol
      this.cargarPlaneaciones()
    } catch (error) {
      console.error('Error parsing user data:', error)
      this.$router.push('/login')
    }
  },
  methods: {
    async cargarPlaneaciones() {
      try {
        const resp = await api.getPlaneaciones()
        this.planeaciones = Array.isArray(resp) ? resp : resp.results || []
      } catch (error) { console.error('Error:', error) }
    },
    
    verDetalle(planeacion) { this.planeacionSeleccionada = planeacion; this.mostrarModal = true },
    async aprobar(planeacion) {
      this.planeacionSeleccionada = planeacion; this.observaciones = ''
      if (!window.confirm('¿Deseas aprobar esta planeación?')) return
      this.guardando = true
      try {
        await api.aprobarPlaneacion(this.planeacionSeleccionada.id, '')
        alert('Planeación aprobada correctamente')
        await this.cargarPlaneaciones()
        this.mostrarModal = false; this.mostrarModalObservaciones = false
      } catch (error) { alert(error.message || 'Error al procesar la acción') }
      finally { this.guardando = false }
    },
    puedeRevisar(planeacion) {
      return planeacion.puede_revisar === true
    },
    observacion(planeacion) {
      this.planeacionSeleccionada = planeacion; this.observaciones = ''
      this.mostrarModal = false; this.mostrarModalObservaciones = true
    },
    async confirmarAccion() {
      this.guardando = true
      try {
        await api.rechazarPlaneacion(this.planeacionSeleccionada.id, this.observaciones)
        alert('Observaciones enviadas correctamente')
        await this.cargarPlaneaciones(); this.mostrarModalObservaciones = false
      } catch (error) { alert(error.message || 'Error al procesar la acción') }
      finally { this.guardando = false }
    },
    getEstadoNombre(estado) {
      const estados = { 'ENVIADA': 'Pendiente', 'APROBADA': 'Aprobada', 'CON_OBSERVACIONES': 'Con observaciones' }
      return estados[estado] || estado
    },
    getEstadoClass(estado) { return estado.toLowerCase() },
    formatearFecha(fecha) { return fecha ? new Date(fecha).toLocaleDateString('es-MX') : 'N/A' },
    mostrarMensaje(mensaje, tipo) { alert(mensaje) },
    obtenerPrimerLineaTema(tema) {
      if (!tema) return ''
      const primeraLinea = tema.split('\n')[0]
      return primeraLinea.length > 50 ? primeraLinea.substring(0, 50) + '...' : primeraLinea
    },
    getBibliografiaArray(bibliografia) {
      if (!bibliografia) return []
      if (Array.isArray(bibliografia)) return bibliografia.filter(ref => ref && ref.trim() !== '')
      if (typeof bibliografia === 'string') {
        try {
          const parsed = JSON.parse(bibliografia)
          if (Array.isArray(parsed)) return parsed.filter(ref => ref && ref.trim() !== '')
        } catch (e) {
          return bibliografia.split('\n').map(ref => ref.trim()).filter(ref => ref !== '')
        }
      }
      return []
    },
    formatearNombreParcial(parcial) {
      const nombres = { 'parcial1': 'Parcial 1', 'parcial2': 'Parcial 2', 'parcial3': 'Parcial 3', 'ordinario': 'Ordinario' }
      return nombres[parcial] || parcial
    },
    async generarPDFPlaneacion(planeacion) {
      this.generandoPDFPlaneacion = planeacion.id
      try {
        await api.generarPDFPlaneacion(planeacion.id)
        planeacion.tiene_pdf = true
        await this.descargarPDFPlaneacion(planeacion); await this.cargarPlaneaciones()
      } catch (error) { this.mostrarMensaje(error.response?.data?.error || 'Error al generar PDF', 'error') }
      finally { this.generandoPDFPlaneacion = null }
    },
    async descargarPDFPlaneacion(planeacion) {
      try {
        const response = await api.descargarPDFPlaneacion(planeacion.id)
        const blob = new Blob([response], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Planeacion_${planeacion.materia_nombre.replace(/\s+/g, '_')}_${planeacion.periodo_escolar.replace(/\s+/g, '_')}.pdf`
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        window.URL.revokeObjectURL(url); this.mostrarMensaje('PDF descargado correctamente', 'success')
      } catch (error) { this.mostrarMensaje('Error al descargar PDF', 'error') }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.page-container { font-family: 'Plus Jakarta Sans', sans-serif; }

.page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.page-header h1 { font-size: clamp(20px, 2.5vw, 28px); font-weight: 700; color: #1a1a1a; letter-spacing: -0.5px; margin: 0; }

/* Filtros */
.filtros { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }

.select-filtro {
  padding: 9px 13px; border: 1.5px solid #dedad4; border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; outline: none;
  background: #f7f6f3; color: #1a1a1a; min-width: 200px; cursor: pointer;
  transition: border-color 0.14s, box-shadow 0.14s;
}
.select-filtro:focus { border-color: #1c2333; background: white; box-shadow: 0 0 0 3px rgba(28,35,51,0.07); }

.input-busqueda {
  flex: 1; min-width: 260px; padding: 9px 13px; border: 1.5px solid #dedad4; border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; outline: none;
  background: #f7f6f3; color: #1a1a1a; transition: border-color 0.14s, box-shadow 0.14s;
}
.input-busqueda:focus { border-color: #1c2333; background: white; box-shadow: 0 0 0 3px rgba(28,35,51,0.07); }
.input-busqueda::placeholder { color: #9ca3af; }

/* Grid */
.planeaciones-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px; }

/* Card */
.planeacion-card {
  background: #f7f6f3; border: 1px solid #dedad4; border-radius: 14px; padding: 20px;
  transition: box-shadow 0.15s, transform 0.15s;
}
.planeacion-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.07); transform: translateY(-2px); }

.card-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 14px; padding-bottom: 14px; border-bottom: 1px solid #dedad4; gap: 12px;
}
.card-header h3 { margin: 0; font-size: 15px; font-weight: 700; color: #1a1a1a; flex: 1; }

/* Badges */
.badge-estado { padding: 4px 11px; border-radius: 50px; font-size: 11.5px; font-weight: 700; white-space: nowrap; flex-shrink: 0; }
.badge-estado.enviada         { background: #fef9ee; color: #d97706; border: 1px solid #fbd5a5; }
.badge-estado.aprobada        { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.badge-estado.con_observaciones { background: #fff8f0; color: #c2410c; border: 1px solid #fed7aa; }

.avance-numero {
  font-size: 12px; font-weight: 600; color: #6b7280;
  background: #eeece8; padding: 2px 9px; border-radius: 50px;
  display: inline-block; border: 1px solid #dedad4;
}

.badges-container {
  display: flex; flex-direction: column; gap: 6px;
  align-items: flex-end; flex-shrink: 0;
}

.badge-jefe {
  display: inline-flex; align-items: center; gap: 5px;
  background: #eeece8; color: #374151; border: 1px solid #dedad4;
  padding: 3px 9px; border-radius: 50px; font-size: 11px; font-weight: 600;
}

.revisor-chip {
  display: flex; align-items: center; gap: 6px;
  margin-top: 8px; padding: 7px 11px;
  background: #eeece8; border: 1px solid #dedad4;
  border-left: 3px solid #1c2333; border-radius: 8px;
  font-size: 13px; color: #374151;
}

/* Meta chips con SVG */
.card-meta { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 14px; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 5px;
  background: #eeece8; border: 1px solid #dedad4; border-radius: 50px;
  padding: 4px 10px; font-size: 12px; color: #374151; font-weight: 500;
}

/* Observaciones en card */
.card-observaciones {
  background: #fef9ee; border: 1px solid #fbd5a5; border-left: 3px solid #f59e0b;
  border-radius: 8px; padding: 10px 13px; margin-bottom: 14px;
}
.obs-label { font-size: 11px; font-weight: 700; color: #d97706; text-transform: uppercase; letter-spacing: 0.4px; display: block; margin-bottom: 4px; }
.card-observaciones p { margin: 0; font-size: 12.5px; color: #92400e; line-height: 1.5; }

/* Acciones */
.card-acciones { display: flex; gap: 8px; flex-wrap: wrap; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px;
  background: #eeece8; color: #374151; border: 1px solid #dedad4; border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.btn-ghost:hover:not(:disabled) { border-color: #1c2333; color: #1a1a1a; }
.btn-ghost:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-success {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px;
  background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.btn-success:hover { background: #dcfce7; }

.btn-warning {
  display: inline-flex; align-items: center; gap: 6px; padding: 7px 13px;
  background: #fef9ee; color: #d97706; border: 1px solid #fbd5a5; border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.12s; white-space: nowrap;
}
.btn-warning:hover:not(:disabled) { background: #fef3c7; }
.btn-warning:disabled { opacity: 0.5; cursor: not-allowed; }

.mensaje-bloqueo {
  display: flex; align-items: center; gap: 6px; padding: 7px 11px;
  background: #fef9ee; border: 1px solid #fbd5a5; border-left: 3px solid #f59e0b;
  border-radius: 8px; font-size: 12.5px; color: #92400e;
}

/* Empty state */
.empty-state { text-align: center; padding: 72px 20px; background: #f7f6f3; border-radius: 14px; border: 1px solid #dedad4; }
.empty-icon { width: 68px; height: 68px; background: #eeece8; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 18px; color: #9ca3af; border: 1px solid #dedad4; }
.empty-state h3 { font-size: 17px; font-weight: 600; color: #374151; margin: 0 0 6px; }
.empty-state p  { font-size: 14px; color: #9ca3af; margin: 0; }

/* Modal overlay */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.45); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }

.modal-custom { background: white; border-radius: 18px; width: 90%; max-width: 600px; max-height: 90vh; overflow-y: auto; box-shadow: 0 30px 70px rgba(0,0,0,0.2); }
.modal-large { max-width: 920px; }

/* Modal header — fondo blanco, no oscuro */
.modal-header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 22px 26px 18px; border-bottom: 1px solid #f0ede8;
  position: sticky; top: 0; background: white; z-index: 10; border-radius: 18px 18px 0 0;
}

.modal-title-group { display: flex; flex-direction: column; gap: 8px; }
.modal-title-group h2 { margin: 0; font-size: 18px; font-weight: 700; color: #1a1a1a; letter-spacing: -0.3px; }

.btn-cerrar {
  background: #f0ede8; border: none; border-radius: 8px; width: 30px; height: 30px;
  cursor: pointer; color: #6b7280; display: flex; align-items: center; justify-content: center;
  transition: all 0.12s; flex-shrink: 0;
}
.btn-cerrar:hover { background: #dedad4; color: #1a1a1a; }

/* Modal body scroll */
.modal-body-scroll { max-height: calc(90vh - 210px); overflow-y: auto; }

/* Info strip */
.info-strip {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 10px; padding: 20px 24px; background: #f7f6f3; border-bottom: 1px solid #e5e0d8;
}

.info-card { display: flex; align-items: center; gap: 11px; background: white; padding: 13px; border-radius: 10px; border: 1px solid #dedad4; }
.info-card-icon { width: 34px; height: 34px; background: #eeece8; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #374151; border: 1px solid #dedad4; flex-shrink: 0; }
.info-card-content { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.info-card-label { font-size: 10.5px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
.info-card-value { font-size: 13.5px; color: #1a1a1a; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

/* Secciones del modal */
.detalle-section { padding: 20px 24px; border-bottom: 1px solid #f0ede8; }
.detalle-section:last-child { border-bottom: none; }

.obs-bg { background: #fef9ee; }
.obs-bg .obs-box { background: white; border: 1px solid #fbd5a5; border-radius: 10px; padding: 12px 14px; font-size: 13.5px; color: #92400e; line-height: 1.6; margin-top: 10px; }

.section-title {
  display: flex; align-items: center; gap: 7px;
  font-size: 11.5px; font-weight: 700; color: #9ca3af;
  text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;
}

.texto-largo { font-size: 13.5px; line-height: 1.7; color: #374151; margin: 0; background: #f7f6f3; padding: 13px 15px; border-radius: 10px; border: 1px solid #e5e0d8; white-space: pre-line; }

/* Unidades */
.unidad-card { background: #f7f6f3; border: 1px solid #dedad4; border-radius: 10px; padding: 14px; margin-bottom: 9px; }
.unidad-card:last-child { margin-bottom: 0; }

.unidad-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; padding-bottom: 8px; border-bottom: 1px solid #dedad4; }
.unidad-badge { background: #1c2333; color: white; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 5px; flex-shrink: 0; }
.unidad-header h4 { margin: 0; font-size: 14px; color: #1a1a1a; font-weight: 600; flex: 1; }

.tema-contenido { background: white; padding: 10px 12px; border-radius: 8px; margin-bottom: 9px; border: 1px solid #e5e0d8; }
.tema-text { font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13px; line-height: 1.6; color: #374151; white-space: pre-wrap; word-wrap: break-word; margin: 0; }

.unidad-meta-row { display: flex; gap: 18px; flex-wrap: wrap; font-size: 12.5px; color: #6b7280; }
.unidad-meta-row span { display: inline-flex; align-items: center; gap: 5px; }

/* Criterios */
.criterios-bloque { margin-bottom: 16px; }
.criterios-bloque:last-child { margin-bottom: 0; }
.parcial-tag { display: inline-block; background: #eeece8; color: #374151; border: 1px solid #dedad4; font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 5px; margin-bottom: 9px; }
.criterios-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 10px; }
.criterio-card { background: white; border: 1px solid #dedad4; border-radius: 10px; padding: 13px; }
.criterio-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 7px; }
.criterio-tipo { font-size: 13px; font-weight: 700; color: #1a1a1a; }
.criterio-pct { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; padding: 2px 9px; border-radius: 6px; font-size: 13px; font-weight: 700; }
.criterio-desc { font-size: 13px; color: #374151; margin: 5px 0; line-height: 1.5; }
.criterio-instrumento { display: inline-flex; align-items: center; gap: 5px; margin: 0; font-size: 12px; color: #9ca3af; }

/* Bibliografía */
.bib-row { display: flex; align-items: flex-start; gap: 10px; padding: 9px 12px; background: #f7f6f3; border: 1px solid #dedad4; border-left: 3px solid #1c2333; border-radius: 8px; margin-bottom: 7px; transition: all 0.12s; }
.bib-row:last-child { margin-bottom: 0; }
.bib-row:hover { background: white; }
.bib-num { font-weight: 700; color: #1c2333; font-size: 13px; flex-shrink: 0; }
.bib-text { font-size: 13.5px; color: #374151; line-height: 1.6; flex: 1; }

/* Footer acciones */
.modal-footer-actions {
  padding: 16px 24px; background: #f7f6f3; border-top: 1px solid #dedad4;
  display: flex; justify-content: flex-end; align-items: center;
  border-radius: 0 0 18px 18px; flex-wrap: wrap; gap: 10px;
}

.mensaje-aviso {
  display: flex; align-items: center; gap: 7px; padding: 9px 12px;
  background: #eeece8; border: 1px solid #dedad4; border-left: 3px solid #1c2333;
  border-radius: 8px; font-size: 13px; color: #374151;
}

/* Modal body (observaciones) */
.modal-body { padding: 24px; }
.form-group { margin-bottom: 18px; }
.form-group label { display: block; margin-bottom: 7px; font-size: 13px; font-weight: 600; color: #374151; }
.form-group textarea {
  width: 100%; padding: 10px 12px; border: 1.5px solid #dedad4; border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif; font-size: 13.5px; resize: vertical;
  outline: none; background: #f7f6f3; color: #1a1a1a; transition: border-color 0.14s; box-sizing: border-box;
}
.form-group textarea:focus { border-color: #1c2333; background: white; box-shadow: 0 0 0 3px rgba(28,35,51,0.07); }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; padding-top: 18px; border-top: 1px solid #f0ede8; }

@media (max-width: 768px) {
  .planeaciones-grid { grid-template-columns: 1fr; }
  .info-strip { grid-template-columns: 1fr 1fr; }
  .criterios-grid { grid-template-columns: 1fr; }
  .modal-footer-actions { flex-direction: column; }
  .modal-footer-actions button { width: 100%; }
}
</style>