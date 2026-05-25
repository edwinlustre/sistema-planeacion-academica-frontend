<template>
  <div class="page-container">

    <div class="page-header">
      <div>
        <h1>Mis Planeaciones y Avances</h1>
      </div>
    </div>

    <!-- Materias sin planeación -->
    <div v-if="asignacionesSinPlaneacion.length > 0" class="sin-planeacion-section">
      <div class="alert-header">
        <div class="alert-icon-wrap">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div>
          <h2>Materias sin Planeación Académica</h2>
          <p>Las siguientes materias necesitan que crees su planeación</p>
        </div>
      </div>
      <div class="sin-planeacion-grid">
        <div v-for="asignacion in asignacionesSinPlaneacion" :key="'sin-' + asignacion.id" class="sin-planeacion-card">
          <div class="sp-header">
            <h3>{{ asignacion.materia_nombre }}</h3>
            <span class="badge-alert">Pendiente</span>
          </div>
          <div class="sp-info">
            <p><strong>Clave:</strong> {{ asignacion.materia_clave }}</p>
            <p><strong>Carrera:</strong> {{ asignacion.carrera_nombre }}</p>
            <p><strong>Periodo:</strong> {{ asignacion.periodo_escolar }} &nbsp;·&nbsp; Grupo {{ asignacion.grupo }}</p>
          </div>
          <button @click="crearPlaneacionNueva(asignacion)" class="btn-crear-planeacion">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Crear Planeación Académica
          </button>
        </div>
      </div>
    </div>

    <!-- Lista de planeaciones -->
    <div class="planeaciones-lista">
      <template v-for="planeacion in planeaciones" :key="planeacion.id">
        <div v-if="planeacion" class="planeacion-card">

          <div class="pc-header">
            <div>
              <h3>{{ planeacion.materia_nombre }}</h3>
              <div class="pc-meta">
                <span>{{ planeacion.periodo_escolar }}</span>
                <span class="meta-sep">·</span>
                <span>Grupo {{ planeacion.grupo }}</span>
                <span class="meta-sep">·</span>
                <span>Enviada: {{ formatearFecha(planeacion.fecha_envio) }}</span>
              </div>
            </div>
            <span :class="['badge-estado', getEstadoClass(planeacion.estado)]">
              Planeación {{ getEstadoNombre(planeacion.estado) }}
            </span>
          </div>

          <!-- Avances -->
          <div class="avances-section">
            <h4>Avances Programáticos</h4>
            <div v-if="esJefeProfesor" class="alerta-jefe-profesor">
              <div class="alerta-icon-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                </svg>
              </div>
              <div>
                <strong>Revisión por Vicerrectoría</strong>
                <p>Como Jefe de Carrera, tus avances serán revisados por Vicerrectoría Académica.</p>
              </div>
            </div>

            <div class="avances-grid">
              <div v-for="n in 4" :key="n" class="avance-mini">

                <template v-if="getAvance(planeacion.id, n)">
                  <div class="avance-completado">
                    <span class="avance-nombre">{{ getAvanceNombre(n) }}</span>
                    <span :class="['estado-mini', getEstadoClass(getAvance(planeacion.id, n).estado)]">
                      {{ getEstadoNombre(getAvance(planeacion.id, n).estado) }}
                    </span>
                    <div class="avance-botones">
                      <button v-if="['ENVIADO', 'APROBADO', 'APROBADA'].includes(getAvance(planeacion.id, n)?.estado)"
                        @click="verAvance(getAvance(planeacion.id, n))" class="btn-mini btn-ver">
                        Ver
                      </button>
                      <button v-if="n === 4 && getAvance(planeacion.id, n).estado === 'APROBADO'"
                        @click="descargarPDFAvance(getAvance(planeacion.id, n))" class="btn-mini btn-pdf">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        PDF
                      </button>
                      <button
                        v-if="getAvance(planeacion.id, n).estado !== 'ENVIADO' && getAvance(planeacion.id, n).estado !== 'APROBADO'"
                        @click="editarAvance(getAvance(planeacion.id, n))" class="btn-mini btn-editar">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Editar
                      </button>
                    </div>
                  </div>
                </template>

                <template v-else>
                  <div class="avance-pendiente">
                    <span class="avance-nombre">{{ getAvanceNombre(n) }}</span>
                    <button @click="crearAvance(planeacion.id, n)" class="btn-mini btn-crear"
                      :disabled="!puedeCrearAvance(planeacion, n)">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Crear
                    </button>
                  </div>
                </template>

              </div>
            </div>
          </div>

          <!-- Acciones de planeación -->
          <div class="card-acciones">
            <button v-if="planeacion.estado === 'ENVIADA'" @click="verDetalle(planeacion)"
              class="btn-action btn-ghost-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Revisar planeación
            </button>
            <button v-if="planeacion.estado === 'BORRADOR' || planeacion.estado === 'CON_OBSERVACIONES'"
              @click="editarPlaneacion(planeacion)" class="btn-action btn-primary-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Editar Planeación Académica
            </button>
            <button v-if="planeacion.estado === 'APROBADA'" @click="generarPDFPlaneacion(planeacion)"
              class="btn-action btn-ghost-action">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              Generar PDF Planeación
            </button>
          </div>

        </div>
      </template>
    </div>

    <!-- Empty state -->
    <div v-if="planeaciones.length === 0" class="empty-state">
      <div class="empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <h3>No tienes planeaciones registradas</h3>
      <button @click="$router.push('/mis-asignaciones')" class="btn-action btn-primary-action">
        Ver mis materias
      </button>
    </div>

    <!-- Modal Detalle -->
    <div v-if="mostrarModal && planeacionSeleccionada" class="modal-overlay" @click.self="mostrarModal = false">
      <div class="modal-custom modal-xl">

        <div class="modal-header">
          <div class="modal-title-group">
            <h2>{{ planeacionSeleccionada.materia_nombre }}</h2>
            <div class="modal-subtitle">
              <span :class="['badge-estado', getEstadoClass(planeacionSeleccionada.estado)]">
                Planeación {{ getEstadoNombre(planeacionSeleccionada.estado) }}
              </span>
            </div>
          </div>
          <button @click="mostrarModal = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div class="modal-body">

          <div class="modal-chips">
            <span class="mchip">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              {{ planeacionSeleccionada.profesor_nombre }}
            </span>
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
              {{ planeacionSeleccionada.horas_totales }} hrs
            </span>
          </div>

          <div class="msection">
            <div class="msection-label">Objetivo general</div>
            <div class="msection-box texto-largo">{{ planeacionSeleccionada.objetivo_general || 'No especificado' }}</div>
          </div>

          <div class="msection" v-if="planeacionSeleccionada.contenidos && planeacionSeleccionada.contenidos.length">
            <div class="msection-label">Contenidos por unidad</div>
            <div v-for="(contenido, index) in planeacionSeleccionada.contenidos" :key="index" class="unidad-row">
              <div class="unidad-badge">U{{ contenido.unidad }}</div>
              <div class="unidad-body">
                <span class="unidad-tema">{{ contenido.tema }}</span>
              </div>
              <div class="unidad-horas">{{ contenido.horas_planeadas }}<span>hrs</span></div>
            </div>
          </div>

          <div class="msection" v-if="planeacionSeleccionada.criterios_evaluacion">
            <div class="msection-label">Criterios de evaluación</div>
            <div v-for="(criterios, parcial) in planeacionSeleccionada.criterios_evaluacion" :key="parcial"
              class="criterios-bloque">
              <div class="parcial-tag">{{ parcial.replace('parcial', 'Parcial ').replace('ordinario', 'Ordinario') }}</div>
              <table class="criterios-table">
                <thead>
                  <tr>
                    <th>Instrumento</th>
                    <th>Tipo</th>
                    <th>Descripción</th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(criterio, i) in criterios" :key="i">
                    <td>{{ criterio.instrumento }}</td>
                    <td><span class="tipo-chip">{{ criterio.tipo }}</span></td>
                    <td>{{ criterio.descripcion }}</td>
                    <td class="pct">{{ criterio.porcentaje }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="msection"
            v-if="planeacionSeleccionada.bibliografia_basica && planeacionSeleccionada.bibliografia_basica.length">
            <div class="msection-label">Bibliografía básica</div>
            <template v-if="Array.isArray(planeacionSeleccionada.bibliografia_basica)">
              <div v-for="(bib, i) in planeacionSeleccionada.bibliografia_basica.filter(b => b)" :key="i" class="bib-row">
                <span class="bib-num">{{ i + 1 }}</span><span>{{ bib }}</span>
              </div>
            </template>
            <div v-else class="msection-box texto-largo">{{ planeacionSeleccionada.bibliografia_basica }}</div>
          </div>

          <div class="msection" v-if="planeacionSeleccionada.bibliografia_complementaria">
            <div class="msection-label">Bibliografía complementaria</div>
            <template v-if="Array.isArray(planeacionSeleccionada.bibliografia_complementaria)">
              <div v-for="(bib, i) in planeacionSeleccionada.bibliografia_complementaria.filter(b => b)" :key="i" class="bib-row">
                <span class="bib-num">{{ i + 1 }}</span><span>{{ bib }}</span>
              </div>
            </template>
            <div v-else class="msection-box texto-largo">{{ planeacionSeleccionada.bibliografia_complementaria }}</div>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'MisPlaneaciones',
  data() {
    return {
      planeaciones: [],
      avances: [],
      asignaciones: [],
      mostrarModal: false,
      planeacionSeleccionada: null,
      generandoPDFPlaneacion: null
    }
  },

  mounted() {
    this.cargarDatos()
  },

  computed: {
    asignacionesSinPlaneacion() {
      if (!this.asignaciones || this.asignaciones.length === 0) return []
      return this.asignaciones.filter(asignacion => !this.planeaciones.some(p => p.asignacion === asignacion.id))
    },
    esJefeProfesor() {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) return false
        const user = JSON.parse(userData)
        return user?.rol === 'JEFATURA_CARRERA'
      } catch (e) {
        return false
      }
    }
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
      try {
        const usuarioActual = await api.getPerfil()
        try {
          const asignacionesResp = await api.getAsignaciones({ vista: 'profesor' })
          const asignaciones = this.normalizarLista(asignacionesResp).filter(a => a && a.activa)
          this.asignaciones = this.filtrarAsignacionesPropias(asignaciones, usuarioActual)
        } catch (error) { this.asignaciones = [] }

        const asignacionesIds = new Set(this.asignaciones.map(asignacion => asignacion.id))
        const planeacionesResp = await api.getPlaneaciones({ vista: 'profesor' })
        const planeaciones = this.normalizarLista(planeacionesResp).filter(planeacion => planeacion && asignacionesIds.has(planeacion.asignacion))
        this.planeaciones = planeaciones

        const planeacionesIds = new Set(this.planeaciones.map(planeacion => planeacion.id))
        const avancesResp = await api.getAvances({ vista: 'profesor' })
        this.avances = this.normalizarLista(avancesResp).filter(avance => avance && planeacionesIds.has(avance.planeacion))
      } catch (error) {
        this.planeaciones = []
        this.avances = []
        this.asignaciones = []
      }
    },
    crearPlaneacionNueva(asignacion) { this.$router.push(`/crear-planeacion/${asignacion.id}`) },
    getAvance(planeacionId, numero) { return this.avances.find(a => a.planeacion === planeacionId && a.numero_avance === numero) },
    getAvanceNombre(n) { const nombres = { 1: 'P1', 2: 'P2', 3: 'P3', 4: 'Ordinario' }; return nombres[n] },
    crearAvance(planeacionId, numero) { this.$router.push({ path: `/crear-avance/${planeacionId}`, query: { numero } }) },
    editarAvance(avance) {
      if (avance.estado === 'APROBADA' || avance.estado === 'APROBADO') return
      this.$router.push({ path: `/crear-avance/${avance.planeacion}`, query: { avanceId: avance.id } })
    },
    verAvance(avance) { this.$router.push({ path: `/crear-avance/${avance.planeacion}`, query: { avanceId: avance.id, modo: 'ver' } }) },
    puedeCrearAvance(planeacion, numero) {
      if (planeacion.estado !== 'APROBADA') return false
      if (numero === 1) return true
      const avanceAnterior = this.getAvance(planeacion.id, numero - 1)
      if (!avanceAnterior) return false
      return ['ENVIADO', 'APROBADO', 'APROBADA'].includes(avanceAnterior.estado)
    },
    editarPlaneacion(planeacion) { this.$router.push({ path: `/crear-planeacion/${planeacion.asignacion}`, query: { planeacionId: planeacion.id } }) },
    verDetalle(planeacion) { this.planeacionSeleccionada = planeacion; this.mostrarModal = true },
    getEstadoNombre(estado) {
      const estados = { 'BORRADOR': 'Borrador', 'ENVIADA': 'En revisión', 'ENVIADO': 'En revisión', 'APROBADA': 'Aprobada', 'APROBADO': 'Aprobado', 'CON_OBSERVACIONES': 'Con observaciones' }
      return estados[estado] || estado
    },
    getEstadoClass(estado) {
      const classes = { 'BORRADOR': 'borrador', 'ENVIADA': 'enviado', 'ENVIADO': 'enviado', 'APROBADA': 'aprobado', 'APROBADO': 'aprobado', 'CON_OBSERVACIONES': 'observaciones' }
      return classes[estado] || 'borrador'
    },
    formatearFecha(fecha) { if (!fecha) return 'No enviada'; return new Date(fecha).toLocaleDateString('es-MX') },
    mostrarMensaje(mensaje, tipo) { alert(mensaje) },
    async generarPDFPlaneacion(planeacion) {
      this.generandoPDFPlaneacion = planeacion.id
      try {
        const response = await api.generarPDFPlaneacion(planeacion.id)
        this.mostrarMensaje('PDF de planeación generado correctamente', 'success')
        await this.descargarPDFPlaneacion(planeacion)
        await this.cargarDatos()
      } catch (error) {
        this.mostrarMensaje(error.response?.data?.error || 'Error al generar PDF', 'error')
      } finally { this.generandoPDFPlaneacion = null }
    },
    async descargarPDFPlaneacion(planeacion) {
      try {
        const response = await api.descargarPDFPlaneacion(planeacion.id)
        const blob = new Blob([response], { type: 'application/pdf' })
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `Planeacion_${planeacion.materia_nombre.replace(/\s+/g, '_')}_${planeacion.periodo_escolar}.pdf`
        document.body.appendChild(link); link.click(); document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } catch (error) {
        this.mostrarMensaje(error.response?.status === 404 ? 'No se ha generado PDF para esta planeación' : 'Error al descargar PDF', 'error')
      }
    },
    async descargarPDFAvance(avance) {
      const response = await api.descargarPDFAvance(avance.id)
      const blob = new Blob([response], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Avance_${avance.materia_nombre?.replace(/\s+/g, '_') || 'Avance'}_Ordinario.pdf`
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      this.mostrarMensaje('PDF descargado correctamente', 'success')
    }, catch(error) {
      console.error('Error descargando PDF:', error)
      if (error.response?.status === 404) {
        this.mostrarMensaje('Ha habido un error. No se ha generado PDF para este avance.', 'error')
      } else {
        this.mostrarMensaje('Error al descargar PDF', 'error')
      }
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

/* ─── Sin planeación ─── */
.sin-planeacion-section {
  background: #f7f6f3;
  border-radius: 14px;
  border: 1px solid #dedad4;
  margin-bottom: 24px;
  overflow: hidden;
}

.alert-header {
  background: #1c2333;
  padding: 18px 22px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.alert-icon-wrap {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.alert-header h2 {
  font-size: 15px;
  font-weight: 700;
  color: white;
  margin-bottom: 3px;
}

.alert-header p {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  margin: 0;
}

.sin-planeacion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 14px;
  padding: 18px;
}

.sin-planeacion-card {
  background: #eeece8;
  border: 1px solid #dedad4;
  border-radius: 12px;
  padding: 18px;
}

.sp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
  gap: 10px;
}

.sp-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.badge-alert {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
  padding: 3px 9px;
  border-radius: 50px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.sp-info p {
  font-size: 12.5px;
  color: #6b7280;
  margin: 4px 0;
}

.btn-crear-planeacion {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 14px;
  background: #1c2333;
  color: white;
  border: none;
  border-radius: 9px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}

.btn-crear-planeacion:hover {
  background: #263045;
}

/* ─── Planeaciones ─── */
.planeaciones-lista {
  display: grid;
  gap: 16px;
}

.planeacion-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid #dedad4;
}

.pc-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 14px;
}

.pc-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 5px;
}

.pc-meta {
  font-size: 12.5px;
  color: #9ca3af;
}

.meta-sep {
  margin: 0 5px;
}

/* ─── Badges estado ─── */
.badge-estado {
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
}

.badge-estado.borrador {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
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

.badge-estado.rechazado {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.badge-estado.observaciones {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

/* ─── Avances ─── */
.avances-section {
  margin: 16px 0;
}

.avances-section h4 {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
  margin-bottom: 12px;
}

/* Alerta jefe profesor — unificada al sistema crema */
.alerta-jefe-profesor {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #eeece8;
  border: 1px solid #dedad4;
  border-left: 3px solid #1c2333;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 14px;
}

.alerta-icon-wrap {
  width: 32px;
  height: 32px;
  background: #1c2333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.alerta-jefe-profesor strong {
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1a1a;
  display: block;
  margin-bottom: 3px;
}

.alerta-jefe-profesor p {
  font-size: 12.5px;
  color: #6b7280;
  margin: 0;
}

.avances-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.avance-mini {
  background: #eeece8;
  border-radius: 10px;
  padding: 12px;
  border: 1px solid #dedad4;
}

.avance-completado,
.avance-pendiente {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.avance-nombre {
  font-size: 12px;
  font-weight: 700;
  color: #374151;
}

.estado-mini {
  padding: 3px 8px;
  border-radius: 50px;
  font-size: 10.5px;
  font-weight: 600;
}

.estado-mini.borrador {
  background: #eff6ff;
  color: #1d4ed8;
}

.estado-mini.enviado {
  background: #fef9ee;
  color: #d97706;
}

.estado-mini.aprobado {
  background: #f0fdf4;
  color: #16a34a;
}

.estado-mini.rechazado {
  background: #fff8f0;
  color: #c2410c;
}

.avance-botones {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: center;
}

.btn-mini {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  transition: all 0.12s;
}

.btn-mini:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn-ver {
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
}

.btn-ver:hover:not(:disabled) {
  border-color: #1c2333;
  color: #1a1a1a;
}

.btn-pdf {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-pdf:hover:not(:disabled) {
  background: #dcfce7;
}

.btn-editar {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.btn-editar:hover:not(:disabled) {
  background: #dbeafe;
}

.btn-crear {
  background: #1c2333;
  color: white;
}

.btn-crear:hover:not(:disabled) {
  background: #263045;
}

/* ─── Card acciones ─── */
.card-acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #dedad4;
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

.btn-download-action {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
}

.btn-download-action:hover {
  background: #dbeafe;
}

/* ─── Empty ─── */
.empty-state {
  text-align: center;
  padding: 64px 20px;
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
  margin-bottom: 16px;
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
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.2);
}

.modal-xl {
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
  gap: 8px;
}

.modal-title-group h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.modal-subtitle {
  display: flex;
  gap: 8px;
  align-items: center;
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
  font-family: 'Plus Jakarta Sans', sans-serif;
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

.unidad-row:last-child { margin-bottom: 0; }

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
  margin-bottom: 14px;
}

.criterios-bloque:last-child { margin-bottom: 0; }

.parcial-tag {
  display: inline-block;
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
  font-size: 11.5px;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 5px;
  margin-bottom: 8px;
}

.criterios-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  border-radius: 8px;
  overflow: hidden;
}

.criterios-table th {
  background: #1c2333;
  color: white;
  padding: 9px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 12px;
}

.criterios-table td {
  padding: 9px 12px;
  border-bottom: 1px solid #f0ede8;
  color: #374151;
  vertical-align: middle;
}

.criterios-table tr:last-child td { border-bottom: none; }
.criterios-table tr:hover td { background: #faf9f7; }

.tipo-chip {
  background: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
  padding: 2px 8px;
  border-radius: 5px;
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}

.pct {
  font-weight: 800;
  color: #16a34a;
  text-align: center;
  font-size: 14px;
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

.bib-row:last-child { margin-bottom: 0; }

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

@media (max-width: 768px) {
  .avances-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .sin-planeacion-grid {
    grid-template-columns: 1fr;
  }
}
</style>
