<template>
  <div class="page-container">

    <div class="page-header">
      <h1>Revisión de Avances Programáticos</h1>
    </div>

    <div class="filtros">
      <select v-model="filtroEstado" class="select-filtro">
        <option value="">Todos los estados</option>
        <option value="ENVIADO">Pendientes</option>
        <option value="APROBADO">Aprobados</option>
        <option value="CON_OBSERVACIONES">Con observaciones</option>
      </select>
      <select v-model="filtroAvance" class="select-filtro">
        <option value="">Todos los avances</option>
        <option value="1">Parcial 1</option>
        <option value="2">Parcial 2</option>
        <option value="3">Parcial 3</option>
        <option value="4">Ordinario</option>
      </select>
      <input v-model="busqueda" type="text" placeholder="Buscar por profesor o materia..." class="input-busqueda" />
    </div>

    <div class="avances-grid">
      <div v-for="avance in avancesFiltrados" :key="avance.id" class="avance-card">

        <div class="card-header">
          <div>
            <h3>{{ avance.materia_nombre }}</h3>
            <span class="avance-numero">{{ avance.numero_avance_display }}</span>
          </div>
          <div class="badges-container">
            <span :class="['badge-estado', getEstadoClass(avance.estado)]">
              {{ getEstadoNombre(avance.estado) }}
            </span>
            <span v-if="avance.es_jefe_profesor" class="badge-jefe">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              </svg>
              Jefe-Profesor
            </span>
            <span v-if="avance.solo_conocimiento" class="badge-conocimiento">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Para conocimiento
            </span>
          </div>
        </div>

        <div class="card-info">
          <p><strong>Profesor:</strong> {{ avance.profesor_nombre }}</p>
          <p><strong>Enviado:</strong> {{ formatearFecha(avance.fecha_envio) }}</p>
          <div v-if="avance.es_jefe_profesor" class="revisor-chip">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span><strong>Revisor:</strong> Vicerrectoría Académica</span>
          </div>
        </div>

        <div class="card-acciones">
          <button @click="verDetalle(avance)" class="btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            Ver Detalle
          </button>

          <button v-if="avance.numero_avance === 4 && avance.estado === 'APROBADO'" @click="descargarPDFAvance(avance)"
            class="btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar PDF
          </button>

          <template v-if="avance.estado === 'ENVIADO'">
            <template v-if="puedeRevisar(avance)">
              <button @click="aprobar(avance)" class="btn-success">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Aprobar
              </button>
              <button @click="rechazar(avance)" class="btn-warning">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
                Agregar Observaciones
              </button>
            </template>
            <div v-else class="mensaje-revisor">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <small>{{ mensajeRevisor(avance) }}</small>
            </div>
          </template>
        </div>

      </div>
    </div>

    <div v-if="avancesFiltrados.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <h3>No hay avances para revisar</h3>
      <p>Intenta cambiar los filtros de búsqueda</p>
    </div>

    <!-- Modal Detalle -->
    <div v-if="mostrarModal && avanceSeleccionado" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-custom modal-large">

        <div class="modal-header">
          <div class="modal-title-group">
            <h2>Detalle del Avance — {{ getAvanceNombre(avanceSeleccionado.numero_avance) }}</h2>
            <span :class="['badge-estado', getEstadoClass(avanceSeleccionado.estado)]">
              {{ getEstadoNombre(avanceSeleccionado.estado) }}
            </span>
          </div>
          <button @click="mostrarModal = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">

          <div class="msection">
            <div class="msection-label">Información General</div>
            <div class="info-rows">
              <div class="info-row"><span class="info-key">Profesor</span><span class="info-val">{{
                avanceSeleccionado.profesor_nombre }}</span></div>
              <div class="info-row"><span class="info-key">Materia</span><span class="info-val">{{
                avanceSeleccionado.materia_nombre }}</span></div>
              <div class="info-row"><span class="info-key">Estado</span><span class="info-val">{{
                getEstadoNombre(avanceSeleccionado.estado) }}</span></div>
              <div class="info-row"><span class="info-key">Fecha de envío</span><span class="info-val">{{
                formatearFecha(avanceSeleccionado.fecha_envio) }}</span></div>
            </div>
          </div>

          <div class="msection">
            <div class="msection-label">Avance por Unidades</div>

            <div class="leyenda-cobertura">
              <span class="leyenda-item">
                <span class="leyenda-dot leyenda-cubierto"></span> Tema cubierto
              </span>
              <span class="leyenda-item">
                <span class="leyenda-dot leyenda-no-cubierto"></span> Tema no cubierto
              </span>
            </div>

            <div
              v-for="(unidad, index) in avanceSeleccionado.avance_unidades || []"
              :key="index"
              class="unidad-bloque"
              :class="{ 'unidad-bloque-cubierta': unidad.cubierto }"
            >
              <div class="unidad-bloque-header">
                <div class="unidad-bloque-left">
                  <span class="unidad-badge">U{{ unidad.unidad }}</span>
                  <span class="unidad-titulo">{{ unidad.titulo_principal || unidad.tema }}</span>
                </div>
                <span :class="unidad.cubierto ? 'chip-cubierto' : 'chip-no-cubierto'">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline v-if="unidad.cubierto" points="20 6 9 17 4 12"/>
                    <circle v-else cx="12" cy="12" r="9"/>
                  </svg>
                  {{ unidad.cubierto ? 'Cubierto' : 'No cubierto' }}
                </span>
              </div>

              <div v-if="(unidad.subtemas_seguimiento || []).length" class="subtemas-lista">
                <div
                  v-for="(st, sIdx) in unidad.subtemas_seguimiento"
                  :key="sIdx"
                  class="subtema-fila"
                  :class="{ 'subtema-visto': st.visto }"
                >
                  <span class="subtema-icono">
                    <svg v-if="st.visto" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="9"/>
                    </svg>
                  </span>
                  <span class="subtema-texto">{{ st.texto }}</span>
                </div>
              </div>

              <div class="unidad-stats">
                <span>Planeadas: <strong>{{ unidad.horas_planeadas }} hrs</strong></span>
                <span>Impartidas: <strong>{{ unidad.horas_impartidas }} hrs</strong></span>
                <span class="pct-chip">{{ unidad.porcentaje_avance || 0 }}%</span>
              </div>

              <p v-if="unidad.observaciones" class="unidad-obs">
                <strong>Observaciones:</strong> {{ unidad.observaciones }}
              </p>
            </div>
          </div>

          <div class="msection" v-if="(avanceSeleccionado.estrategias_didacticas || []).length">
            <div class="msection-label">Estrategias Didácticas Empleadas</div>
            <div class="tags-grid">
              <span class="tag" v-for="(e, i) in avanceSeleccionado.estrategias_didacticas" :key="i">{{ e }}</span>
            </div>
            <p v-if="avanceSeleccionado.otras_estrategias" class="extra-note"><strong>Otras:</strong> {{
              avanceSeleccionado.otras_estrategias }}</p>
          </div>

          <div class="msection" v-if="(avanceSeleccionado.material_empleado || []).length">
            <div class="msection-label">Material Empleado</div>
            <div class="tags-grid">
              <span class="tag" v-for="(m, i) in avanceSeleccionado.material_empleado" :key="i">{{ m }}</span>
            </div>
          </div>

          <div class="msection" v-if="(avanceSeleccionado.material_generado || []).length">
            <div class="msection-label">Material Generado por el Docente</div>
            <div class="tags-grid">
              <span class="tag" v-for="(m, i) in avanceSeleccionado.material_generado" :key="i">{{ m }}</span>
            </div>
            <p v-if="avanceSeleccionado.otros_materiales" class="extra-note"><strong>Otros:</strong> {{
              avanceSeleccionado.otros_materiales }}</p>
          </div>

          <div class="msection">
            <div class="msection-label">Incidencias y Ajustes Académicos</div>
            <div class="msection-box">{{ avanceSeleccionado.incidencias || 'Ninguna incidencia reportada.' }}</div>
          </div>

        </div>
      </div>
    </div>

    <!-- Modal Observaciones -->
    <div v-if="mostrarModalObservaciones" class="modal-overlay" @click.self="mostrarModalObservaciones = false">
      <div class="modal-custom">
        <div class="modal-header">
          <div class="modal-title-group">
            <h2>Agregar observaciones al Avance</h2>
          </div>
          <button @click="mostrarModalObservaciones = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <form @submit.prevent="confirmarAccion" class="modal-body">
          <div class="form-group">
            <label>Observaciones *</label>
            <textarea v-model="observaciones" rows="5" required
              placeholder="Describe las observaciones para el profesor..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" @click="mostrarModalObservaciones = false" class="btn-ghost">Cancelar</button>
            <button type="submit" class="btn-warning">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              Enviar Observaciones
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
  name: 'RevisionAvances',
  data() {
    return {
      avances: [],
      filtroEstado: 'ENVIADO',
      filtroAvance: '',
      busqueda: '',
      mostrarModal: false,
      mostrarModalObservaciones: false,
      avanceSeleccionado: null,
      observaciones: '',
      accionActual: '',
      generandoPDF: null,
      userRole: '',
    }
  },
  computed: {
    avancesFiltrados() {
      return this.avances.filter(a => {
        if (this.filtroEstado && a.estado !== this.filtroEstado) return false
        if (this.filtroAvance && a.numero_avance !== parseInt(this.filtroAvance)) return false
        if (this.busqueda) {
          const busquedaLower = this.busqueda.toLowerCase()
          const profesor = (a.profesor_nombre || '').toLowerCase()
          const materia = (a.materia_nombre || '').toLowerCase()
          if (!profesor.includes(busquedaLower) && !materia.includes(busquedaLower)) return false
        }
        return true
      })
    }
  },
  mounted() {
    const userData = localStorage.getItem('user')
    if (!userData) { this.$router.push('/login'); return }
    try {
      this.userRole = JSON.parse(userData).rol
      this.cargarAvances()
    } catch (error) {
      console.error('Error parsing user data:', error)
      this.$router.push('/login')
    }
  },
  methods: {
    mostrarMensaje(mensaje, tipo) { console.log(`[${tipo}] ${mensaje}`); alert(mensaje) },
    async cargarAvances() {
      try { this.avances = await api.getAvances() } catch (error) { console.error('Error:', error) }
    },
    puedeRevisar(avance) {
      return avance.puede_revisar === true
    },
    mensajeRevisor(avance) {
      if (avance.solo_conocimiento) return 'Este avance es solo para tu conocimiento. La jefatura responsable de la materia debe aprobarlo.'
      if (avance.es_jefe_profesor) return 'Este avance debe ser revisado por Vicerrectoría Académica'
      return 'Este avance está siendo revisado por otro usuario'
    },
    verDetalle(avance) { this.avanceSeleccionado = avance; this.mostrarModal = true },
    async aprobar(avance) {
      try { await api.aprobarAvance(avance.id, ''); alert('Avance aprobado'); await this.cargarAvances() }
      catch (error) { alert('Error al aprobar') }
    },
    rechazar(avance) {
      this.avanceSeleccionado = avance; this.accionActual = 'rechazar'
      this.observaciones = ''; this.mostrarModalObservaciones = true
    },
    async confirmarAccion() {
      try {
        if (this.accionActual === 'rechazar') {
          await api.rechazarAvance(this.avanceSeleccionado.id, this.observaciones)
          alert('Avance rechazado con observaciones')
        }
        await this.cargarAvances(); this.mostrarModalObservaciones = false
      } catch (error) { alert(error.message || 'Error al procesar') }
    },
    getAvanceNombre(numero) {
      const nombres = { 1: 'Parcial 1', 2: 'Parcial 2', 3: 'Parcial 3', 4: 'Ordinario' }
      return nombres[numero] || `Avance ${numero}`
    },
    getEstadoNombre(estado) {
      const estados = { 'BORRADOR': 'Borrador', 'ENVIADO': 'Pendiente', 'APROBADO': 'Aprobado', 'CON_OBSERVACIONES': 'Con observaciones' }
      return estados[estado] || estado
    },
    getEstadoClass(estado) { return estado.toLowerCase() },
    formatearFecha(fecha) { return fecha ? new Date(fecha).toLocaleDateString('es-MX') : 'N/A' },
    async generarPDF(avance) {
      if (avance.numero_avance !== 4) { this.mostrarMensaje('Solo se puede generar PDF del avance Ordinario', 'error'); return }
      this.generandoPDF = avance.id
      try {
        await api.generarPDFAvance(avance.id); avance.tiene_pdf = true
        await this.descargarPDF(avance); await this.cargarAvances()
      } catch (error) { this.mostrarMensaje(error.response?.data?.error || 'Error al generar PDF', 'error') }
      finally { this.generandoPDF = null }
    },
    async descargarPDF(avance) {
      try {
        const response = await api.descargarPDFAvance(avance.id)
        const blob = new Blob([response], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url; link.download = `Avance_${avance.materia_nombre.replace(/\s+/g, '_')}_Ordinario.pdf`
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        window.URL.revokeObjectURL(url); this.mostrarMensaje('PDF descargado correctamente', 'success')
      } catch (error) { this.mostrarMensaje('Error al descargar PDF', 'error') }
    },
    async descargarPDFAvance(avance) {
      try {
        const blob = await api.descargarPDFAvance(avance.id)
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url; link.download = `avance_${avance.id}.pdf`; link.click()
        window.URL.revokeObjectURL(url)
      } catch (error) { console.error(error); alert('No se pudo descargar el PDF') }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.page-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 24px;
  gap: 16px;
}

.page-header h1 {
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  margin: 0;
}

/* ─── Filtros ─── */
.filtros {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.select-filtro {
  padding: 9px 13px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  outline: none;
  background: #f7f6f3;
  color: #1a1a1a;
  min-width: 180px;
  cursor: pointer;
  transition: border-color 0.14s, box-shadow 0.14s;
}

.select-filtro:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.input-busqueda {
  flex: 1;
  min-width: 260px;
  padding: 9px 13px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  outline: none;
  background: #f7f6f3;
  color: #1a1a1a;
  transition: border-color 0.14s, box-shadow 0.14s;
}

.input-busqueda:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.input-busqueda::placeholder {
  color: #9ca3af;
}

/* ─── Grid ─── */
.avances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
}

/* ─── Card ─── */
.avance-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 20px;
  border: 1px solid #dedad4;
  transition: transform 0.15s, box-shadow 0.15s;
}

.avance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 14px;
  padding-bottom: 13px;
  border-bottom: 1px solid #dedad4;
  gap: 10px;
}

.card-header h3 {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 5px;
}

.avance-numero {
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  background: #eeece8;
  padding: 2px 9px;
  border-radius: 50px;
  display: inline-block;
  border: 1px solid #dedad4;
}

/* Badges */
.badges-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
  flex-shrink: 0;
}

.badge-estado {
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.badge-estado.enviado {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

.badge-estado.aprobado {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-estado.con_observaciones,
.badge-estado.rechazado {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

/* Badge jefe — sin gradiente */
.badge-jefe {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
  padding: 3px 9px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
}

/* Badge para conocimiento */
.badge-conocimiento {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 3px 9px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
}

/* Card info */
.card-info p {
  margin: 6px 0;
  font-size: 13.5px;
  color: #6b7280;
}

.card-info p strong {
  color: #374151;
}

/* Revisor chip — crema, sin azul */
.revisor-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 7px 11px;
  background: #eeece8;
  border: 1px solid #dedad4;
  border-left: 3px solid #1c2333;
  border-radius: 8px;
  font-size: 13px;
  color: #374151;
}

/* Acciones */
.card-acciones {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}

.btn-ghost:hover {
  border-color: #1c2333;
  color: #1a1a1a;
}

.btn-success {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}

.btn-success:hover {
  background: #dcfce7;
}

/* Observaciones en amarillo cálido, no rojo */
.btn-warning {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 13px;
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
  white-space: nowrap;
}

.btn-warning:hover {
  background: #fef3c7;
}

/* Mensaje revisor */
.mensaje-revisor {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  background: #fef9ee;
  border: 1px solid #fbd5a5;
  border-left: 3px solid #f59e0b;
  border-radius: 8px;
  font-size: 12.5px;
  color: #92400e;
}

/* Empty */
.empty-state {
  text-align: center;
  padding: 72px 20px;
  background: #f7f6f3;
  border-radius: 14px;
  border: 1px solid #dedad4;
}

.empty-icon {
  width: 68px;
  height: 68px;
  background: #eeece8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 18px;
  color: #9ca3af;
  border: 1px solid #dedad4;
}

.empty-state h3 {
  font-size: 16px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 6px;
}

.empty-state p {
  font-size: 13.5px;
  color: #9ca3af;
  margin: 0;
}

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-custom {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.2);
}

.modal-large {
  max-width: 900px;
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
  margin: 0;
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

/* Secciones del modal */
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
  padding: 13px 15px;
  font-size: 13.5px;
  color: #374151;
  line-height: 1.7;
}

/* Info rows */
.info-rows {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.info-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  font-size: 13.5px;
}

.info-key {
  font-weight: 600;
  color: #374151;
  min-width: 110px;
  flex-shrink: 0;
}

.info-val {
  color: #6b7280;
}

/* Leyenda cobertura */
.leyenda-cobertura {
  display: flex;
  gap: 18px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.leyenda-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #6b7280;
}

.leyenda-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.leyenda-cubierto { background: #16a34a; }
.leyenda-no-cubierto { background: #dedad4; border: 1px solid #c0bdb7; }

/* Bloque unidad */
.unidad-bloque {
  border: 1px solid #dedad4;
  border-radius: 12px;
  margin-bottom: 10px;
  overflow: hidden;
  background: #faf9f7;
}

.unidad-bloque:last-child { margin-bottom: 0; }

.unidad-bloque-cubierta {
  border-color: #bbf7d0;
  background: #f8fffe;
}

.unidad-bloque-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 11px 14px;
  gap: 10px;
  border-bottom: 1px solid #eeece8;
  background: #f7f6f3;
}

.unidad-bloque-cubierta .unidad-bloque-header {
  background: #f0fdf4;
  border-bottom-color: #d1fae5;
}

.unidad-bloque-left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.unidad-badge {
  background: #1c2333;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 5px;
  flex-shrink: 0;
}

.unidad-titulo {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-cubierto {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 50px;
  flex-shrink: 0;
}

.chip-no-cubierto {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #eeece8;
  color: #6b7280;
  border: 1px solid #dedad4;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 9px;
  border-radius: 50px;
  flex-shrink: 0;
}

/* Subtemas */
.subtemas-lista {
  padding: 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  border-bottom: 1px solid #eeece8;
}

.subtema-fila {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 12.5px;
  color: #9ca3af;
  padding: 2px 0;
}

.subtema-visto {
  color: #1a1a1a;
}

.subtema-icono {
  flex-shrink: 0;
  margin-top: 1px;
  color: #9ca3af;
}

.subtema-visto .subtema-icono {
  color: #16a34a;
}

.subtema-texto {
  line-height: 1.5;
}

/* Stats horas */
.unidad-stats {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 12.5px;
  color: #6b7280;
  align-items: center;
  padding: 10px 14px;
}

.pct-chip {
  background: #1c2333;
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 5px;
}

.unidad-obs {
  margin: 0;
  padding: 0 14px 12px;
  font-size: 12.5px;
  color: #6b7280;
}

/* Tags */
.tags-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.tag {
  background: #eeece8;
  border: 1px solid #dedad4;
  border-radius: 50px;
  padding: 4px 12px;
  font-size: 12.5px;
  color: #374151;
  font-weight: 500;
}

.extra-note {
  font-size: 13px;
  color: #374151;
  margin: 4px 0 0;
}

/* Form */
.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  resize: vertical;
  outline: none;
  background: #f7f6f3;
  color: #1a1a1a;
  transition: border-color 0.14s;
  box-sizing: border-box;
}

.form-group textarea:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid #f0ede8;
}

@media (max-width: 768px) {
  .filtros {
    flex-direction: column;
  }

  .select-filtro,
  .input-busqueda {
    width: 100%;
    min-width: unset;
  }

  .avances-grid {
    grid-template-columns: 1fr;
  }
}
</style>