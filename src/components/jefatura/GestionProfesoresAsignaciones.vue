<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Gestión de Profesores y Asignaciones</h1>
      <button @click="abrirModalNueva" class="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nueva Asignación
      </button>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button @click="tabActivo = 'asignaciones'" :class="['tab', { active: tabActivo === 'asignaciones' }]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        Asignaciones de Materias
      </button>
      <button @click="tabActivo = 'profesores'" :class="['tab', { active: tabActivo === 'profesores' }]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
        Profesores
      </button>
    </div>

    <!-- Vista Asignaciones -->
    <div v-if="tabActivo === 'asignaciones'" class="tab-content">

      <div class="controles">
        <div class="search-wrap">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            class="search-icon">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input v-model="filtroTexto" type="text" placeholder="Buscar asignación por materia, profesor o carrera..."
            class="search-control" />
        </div>
        <select v-model="filtroPeriodo" class="select-filtro">
          <option value="">Todos los periodos</option>
          <option v-for="periodo in periodos" :key="periodo" :value="periodo">{{ periodo }}</option>
        </select>
        <select v-model="filtroEstado" class="select-filtro">
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      <!-- Agrupado por periodo y semestre -->
      <div v-for="periodo in periodosOrdenados" :key="periodo" class="periodo-group">

        <div class="periodo-header">
          <div class="periodo-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h2>{{ periodo }}</h2>
          </div>
          <span class="count-badge-header">{{ contarAsignacionesPorPeriodo(periodo) }} asignación(es)</span>
        </div>

        <div v-for="(asignaciones, semestre) in asignacionesAgrupadas[periodo]" :key="semestre" class="semestre-group">

          <div class="semestre-header">
            <h3>{{ obtenerNombreSemestre(semestre) }}</h3>
            <span class="semestre-count">{{ asignaciones.length }} materia(s)</span>
          </div>

          <div class="asignaciones-grid">
            <div v-for="asignacion in asignaciones" :key="asignacion.id" class="asignacion-card">

              <div class="asignacion-header">
                <div>
                  <h4>{{ asignacion.materia_nombre }}</h4>
                  <span class="clave-badge">{{ asignacion.materia_clave }}</span>
                </div>
                <span :class="['badge-estado', asignacion.activa ? 'activo' : 'inactivo']">
                  {{ asignacion.activa ? 'Activa' : 'Inactiva' }}
                </span>
              </div>

              <div class="asignacion-info">
                <p><strong>Profesor:</strong> {{ asignacion.profesor_nombre }}</p>
                <p><strong>Carrera:</strong> {{ asignacion.carrera_nombre }}</p>
                <p><strong>Grupo:</strong> {{ asignacion.grupo }}</p>
              </div>

              <div class="asignacion-status">
                <span v-if="asignacion.tiene_planeacion" class="status-badge success">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Con planeación
                </span>
                <span v-else class="status-badge warning">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path
                      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Sin planeación
                </span>
              </div>

              <div class="asignacion-acciones">
                <button @click="editarAsignacion(asignacion)" class="btn-accion btn-editar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Editar
                </button>
                <button @click="toggleEstado(asignacion)"
                  :class="['btn-accion', asignacion.activa ? 'btn-toggle-off' : 'btn-toggle-on']"
                  :title="asignacion.activa ? 'Desactivar' : 'Activar'">
                  <svg v-if="asignacion.activa" width="12" height="12" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2">
                    <rect x="6" y="4" width="4" height="16" />
                    <rect x="14" y="4" width="4" height="16" />
                  </svg>
                  <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    stroke-width="2">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  {{ asignacion.activa ? 'Desactivar' : 'Activar' }}
                </button>
                <button @click="eliminarAsignacion(asignacion)" class="btn-accion btn-eliminar">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                  Eliminar
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-if="periodosOrdenados.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>
        <h3>No hay asignaciones registradas</h3>
        <p>Crea la primera asignación para comenzar</p>
        <button @click="abrirModalNueva" class="btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nueva Asignación
        </button>
      </div>
    </div>

    <!-- Vista Profesores -->
    <div v-if="tabActivo === 'profesores'" class="tab-content">
      <div class="tabla-container">
        <table class="tabla">
          <thead>
            <tr>
              <th>Profesor</th>
              <th>Email</th>
              <th>Materias Asignadas</th>
              <th>Activas</th>
              <th>Inactivas</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="profesor in profesores" :key="profesor.id">
              <td><strong>{{ profesor.nombre_completo || profesor.correo_institucional }}</strong></td>
              <td>{{ profesor.correo_institucional || profesor.email || '-' }}</td>
              <td>{{ contarAsignaciones(profesor.id) }}</td>
              <td><span class="count-badge activo">{{ contarAsignacionesActivas(profesor.id) }}</span></td>
              <td><span class="count-badge inactivo">{{ contarAsignacionesInactivas(profesor.id) }}</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal Nueva/Editar Asignación -->
    <div v-if="mostrarModalAsignacion" class="modal-overlay" @click.self="cerrarModal">
      <div class="custom-modal modal-large">

        <div class="modal-header">
          <div class="modal-title-group">
            <h2>{{ asignacionForm.id ? 'Editar' : 'Nueva' }} Asignación</h2>
          </div>
          <button @click="cerrarModal" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarAsignacion" class="modal-body">

          <!-- Profesor combobox -->
          <div class="form-group">
            <label>Profesor *</label>
            <div class="combobox" :class="{ open: dropdownAbierto === 'profesor' }">
              <div class="combobox-input-wrap" @click="abrirDropdown('profesor')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="combobox-icon-svg">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input ref="inputProfesor" v-model="buscarProfesor" type="text" class="combobox-input"
                  :placeholder="profesorSeleccionadoLabel || 'Buscar profesor por nombre o email...'"
                  :class="{ 'has-value': asignacionForm.profesor }" @input="dropdownAbierto = 'profesor'"
                  @keydown.escape="cerrarDropdown" @keydown.tab="cerrarDropdown" autocomplete="off" />
                <button v-if="asignacionForm.profesor" type="button" class="combobox-clear"
                  @click.stop="limpiarProfesor">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ul v-if="dropdownAbierto === 'profesor'" class="combobox-list">
                <li v-if="profesoresFiltrados.length === 0" class="combobox-empty">Sin resultados</li>
                <li v-for="prof in profesoresFiltrados" :key="prof.id" class="combobox-item"
                  :class="{ selected: asignacionForm.profesor === prof.id }"
                  @mousedown.prevent="seleccionarProfesor(prof)">
                  <span class="combobox-item-main">{{ prof.nombre_completo || prof.correo_institucional }}</span>
                  <span class="combobox-item-sub">{{ prof.correo_institucional || prof.email }}</span>
                </li>
              </ul>
            </div>
            <input type="hidden" :value="asignacionForm.profesor" required />
          </div>

          <!-- Carrera combobox -->
          <div class="form-group">
            <label>Carrera *</label>
            <div class="combobox" :class="{ open: dropdownAbierto === 'carrera' }">
              <div class="combobox-input-wrap" @click="abrirDropdown('carrera')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="combobox-icon-svg">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input ref="inputCarrera" v-model="buscarCarrera" type="text" class="combobox-input"
                  :placeholder="carreraSeleccionadaLabel || 'Buscar carrera...'"
                  :class="{ 'has-value': carreraSeleccionada }" @input="dropdownAbierto = 'carrera'"
                  @keydown.escape="cerrarDropdown" @keydown.tab="cerrarDropdown" autocomplete="off" />
                <button v-if="carreraSeleccionada" type="button" class="combobox-clear" @click.stop="limpiarCarrera">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ul v-if="dropdownAbierto === 'carrera'" class="combobox-list">
                <li v-if="carrerasFiltradas.length === 0" class="combobox-empty">Sin resultados</li>
                <li v-for="carrera in carrerasFiltradas" :key="carrera.id" class="combobox-item"
                  :class="{ selected: carreraSeleccionada === carrera.id }"
                  @mousedown.prevent="seleccionarCarrera(carrera)">
                  <span class="combobox-item-main">{{ carrera.nombre }}</span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Materia combobox -->
          <div class="form-group">
            <label>Materia *</label>
            <div class="combobox" :class="{ open: dropdownAbierto === 'materia', disabled: !materias.length }">
              <div class="combobox-input-wrap" @click="materias.length && abrirDropdown('materia')">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  class="combobox-icon-svg">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input ref="inputMateria" v-model="buscarMateria" type="text" class="combobox-input"
                  :placeholder="materiaSeleccionadaLabel || (carreraSeleccionada ? 'Buscar materia por nombre o clave...' : 'Primero selecciona una carrera')"
                  :class="{ 'has-value': asignacionForm.materia }" :disabled="!materias.length"
                  @input="dropdownAbierto = 'materia'" @keydown.escape="cerrarDropdown" @keydown.tab="cerrarDropdown"
                  autocomplete="off" />
                <button v-if="asignacionForm.materia" type="button" class="combobox-clear" @click.stop="limpiarMateria">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <ul v-if="dropdownAbierto === 'materia'" class="combobox-list">
                <li v-if="materiasFiltradas.length === 0" class="combobox-empty">Sin resultados</li>
                <li v-for="materia in materiasFiltradas" :key="materia.id" class="combobox-item"
                  :class="{ selected: asignacionForm.materia === materia.id }"
                  @mousedown.prevent="seleccionarMateria(materia)">
                  <span class="combobox-item-main">{{ materia.nombre }}</span>
                  <span class="combobox-item-sub">{{ materia.clave }} · Sem. {{ materia.semestre }}</span>
                </li>
              </ul>
            </div>
            <small v-if="!materias.length && carreraSeleccionada" class="helper-text warning">
              No hay materias para esta carrera
            </small>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Periodo Escolar *</label>
              <input v-model="asignacionForm.periodo_escolar" type="text" required placeholder="Ej: 2026-A, 2027-B" />
              <small class="helper-text">Formato: AAAA-A o AAAA-B</small>
            </div>
            <div class="form-group">
              <label>Grupo *</label>
              <input v-model="asignacionForm.grupo" type="text" required placeholder="Ej: 101, 301, A, B" />
            </div>
          </div>

          <div class="form-group">
            <label>Estado de la asignación</label>
            <div class="estado-selector">
              <label class="radio-option">
                <input type="radio" v-model="asignacionForm.activa" :value="true" />
                <span class="radio-label">
                  <span class="radio-badge activo">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      stroke-width="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Activa
                  </span>
                  <small>La materia está vigente para este periodo/grupo</small>
                </span>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="asignacionForm.activa" :value="false" />
                <span class="radio-label">
                  <span class="radio-badge inactivo">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="6" y="4" width="4" height="16" />
                      <rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Inactiva
                  </span>
                  <small>La materia no se imparte en este periodo/grupo</small>
                </span>
              </label>
            </div>
            <small class="info-text">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Las asignaciones inactivas se mantienen en el sistema pero no aparecen en las vistas del profesor
            </small>
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">{{ mensaje }}</div>

          <div class="modal-footer">
            <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              {{ guardando ? 'Guardando...' : (asignacionForm.id ? 'Actualizar' : 'Crear') }}
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
  name: 'GestionProfesoresAsignaciones',
  data() {
    return {
      tabActivo: 'asignaciones',
      profesores: [],
      asignaciones: [],
      carreras: [],
      materias: [],
      filtroTexto: '',
      filtroPeriodo: '',
      filtroEstado: '',
      carreraSeleccionada: '',
      buscarProfesor: '',
      buscarCarrera: '',
      buscarMateria: '',
      dropdownAbierto: null,
      mostrarModalAsignacion: false,
      asignacionForm: this.getEmptyForm(),
      mensaje: '',
      mensajeTipo: '',
      guardando: false
    }
  },
  computed: {
    profesorSeleccionadoLabel() {
      if (!this.asignacionForm.profesor) return ''
      const prof = this.profesores.find(p => p.id === this.asignacionForm.profesor)
      return prof ? (prof.nombre_completo || prof.correo_institucional) : ''
    },
    carreraSeleccionadaLabel() {
      if (!this.carreraSeleccionada) return ''
      const carrera = this.carreras.find(c => c.id === this.carreraSeleccionada)
      return carrera ? carrera.nombre : ''
    },
    materiaSeleccionadaLabel() {
      if (!this.asignacionForm.materia) return ''
      const materia = this.materias.find(m => m.id === this.asignacionForm.materia)
      return materia ? `${materia.clave} - ${materia.nombre}` : ''
    },
    profesoresFiltrados() {
      if (!this.buscarProfesor) return this.profesores
      const busqueda = this.buscarProfesor.toLowerCase()
      return this.profesores.filter(prof => {
        const nombre = (prof.nombre_completo || prof.correo_institucional || '').toLowerCase()
        const email = (prof.email || prof.correo_institucional || '').toLowerCase()
        return nombre.includes(busqueda) || email.includes(busqueda)
      })
    },
    carrerasFiltradas() {
      if (!this.buscarCarrera) return this.carreras
      const busqueda = this.buscarCarrera.toLowerCase()
      return this.carreras.filter(carrera => carrera.nombre.toLowerCase().includes(busqueda))
    },
    materiasFiltradas() {
      if (!this.buscarMateria) return this.materias
      const busqueda = this.buscarMateria.toLowerCase()
      return this.materias.filter(materia => {
        const nombre = materia.nombre.toLowerCase()
        const clave = materia.clave.toLowerCase()
        return nombre.includes(busqueda) || clave.includes(busqueda)
      })
    },
    asignacionesFiltradas() {
      return this.asignaciones.filter(asig => {
        if (this.filtroTexto) {
          const busqueda = this.filtroTexto.toLowerCase()
          const materia = (asig.materia_nombre || '').toLowerCase()
          const profesor = (asig.profesor_nombre || '').toLowerCase()
          const carrera = (asig.carrera_nombre || '').toLowerCase()
          const clave = (asig.materia_clave || '').toLowerCase()
          if (!materia.includes(busqueda) && !profesor.includes(busqueda) &&
            !carrera.includes(busqueda) && !clave.includes(busqueda)) return false
        }
        if (this.filtroPeriodo && asig.periodo_escolar !== this.filtroPeriodo) return false
        if (this.filtroEstado !== '') {
          const estadoBoolean = this.filtroEstado === 'true'
          if (asig.activa !== estadoBoolean) return false
        }
        return true
      })
    },
    asignacionesAgrupadas() {
      const grupos = {}
      this.asignacionesFiltradas.forEach(asignacion => {
        const periodo = asignacion.periodo_escolar || 'Sin período'
        const semestre = asignacion.materia_semestre || 0
        if (!grupos[periodo]) grupos[periodo] = {}
        if (!grupos[periodo][semestre]) grupos[periodo][semestre] = []
        grupos[periodo][semestre].push(asignacion)
      })
      Object.keys(grupos).forEach(periodo => {
        const semestresOrdenados = {}
        Object.keys(grupos[periodo]).sort((a, b) => parseInt(a) - parseInt(b))
          .forEach(semestre => { semestresOrdenados[semestre] = grupos[periodo][semestre] })
        grupos[periodo] = semestresOrdenados
      })
      return grupos
    },
    periodosOrdenados() { return Object.keys(this.asignacionesAgrupadas).sort().reverse() },
    periodos() { return [...new Set(this.asignaciones.map(a => a.periodo_escolar))].sort().reverse() }
  },
  mounted() { this.cargarDatos() },
  methods: {
    async cargarDatos() {
      try {
        const userData = localStorage.getItem('user')
        if (!userData) { this.$router.push('/login'); return }
        const currentUser = JSON.parse(userData)
        const profesoresResp = await api.getProfesores()
        const allProfesores = Array.isArray(profesoresResp) ? profesoresResp : profesoresResp.results || []
        this.profesores = allProfesores.filter(p => p.rol === 'PROFESOR')
        const asignacionesResp = await api.getAsignaciones()
        this.asignaciones = Array.isArray(asignacionesResp) ? asignacionesResp : asignacionesResp.results || []
        const carrerasResp = await api.getCarreras()
        const todasLasCarreras = Array.isArray(carrerasResp) ? carrerasResp : carrerasResp.results || []
        if (currentUser.rol === 'JEFATURA_CARRERA') {
          this.carreras = todasLasCarreras.filter(c => c.jefe_carrera === currentUser.id)
          if (this.carreras.length === 1) { this.carreraSeleccionada = this.carreras[0].id; this.cargarMaterias() }
        } else { this.carreras = todasLasCarreras }
      } catch (error) { console.error('Error cargando datos:', error) }
    },
    async cargarAsignaciones() {
      try { const asignaciones = await api.getAsignaciones(); this.asignaciones = asignaciones }
      catch (error) { console.error('Error:', error) }
    },
    async cargarMaterias() {
      if (!this.carreraSeleccionada) { this.materias = []; return }
      try {
        const materiasResp = await api.getMaterias(this.carreraSeleccionada)
        this.materias = Array.isArray(materiasResp) ? materiasResp : materiasResp.results || []
        this.buscarMateria = ''
      } catch (error) { console.error('Error cargando materias:', error); this.materias = [] }
    },
    abrirModalNueva() {
      this.buscarProfesor = ''; this.buscarCarrera = ''; this.buscarMateria = ''
      this.dropdownAbierto = null; this.mostrarModalAsignacion = true
      this.asignacionForm = this.getEmptyForm(); this.carreraSeleccionada = ''; this.materias = []; this.mensaje = ''
    },
    editarAsignacion(asignacion) {
      this.buscarProfesor = ''; this.buscarCarrera = ''; this.buscarMateria = ''; this.dropdownAbierto = null
      this.asignacionForm = { id: asignacion.id, profesor: asignacion.profesor, materia: asignacion.materia, periodo_escolar: asignacion.periodo_escolar, grupo: asignacion.grupo, activa: asignacion.activa }
      this.carreraSeleccionada = asignacion.carrera_id; this.cargarMaterias(); this.mostrarModalAsignacion = true; this.mensaje = ''
    },
    async guardarAsignacion() {
      this.guardando = true; this.mensaje = ''
      try {
        if (this.asignacionForm.id) { await api.updateAsignacion(this.asignacionForm.id, this.asignacionForm); this.mensaje = 'Asignación actualizada correctamente' }
        else { await api.createAsignacion(this.asignacionForm); this.mensaje = 'Asignación creada correctamente' }
        this.mensajeTipo = 'success'; await this.cargarDatos()
        setTimeout(() => { this.cerrarModal() }, 1500)
      } catch (error) { console.error('Error guardando asignación:', error); this.mensaje = error.response?.data?.error || 'Error al guardar la asignación'; this.mensajeTipo = 'error' }
      finally { this.guardando = false }
    },
    async toggleEstado(asignacion) {
      try {
        const nuevoEstado = !asignacion.activa; await api.updateAsignacion(asignacion.id, { activa: nuevoEstado }); asignacion.activa = nuevoEstado
        this.mostrarMensaje(`Asignación ${nuevoEstado ? 'activada' : 'desactivada'} correctamente`, 'success')
      } catch (error) { console.error('Error cambiando estado:', error); this.mostrarError('Error al cambiar estado de la asignación') }
    },
    async eliminarAsignacion(asignacion) {
      if (!confirm(`¿Eliminar la asignación de ${asignacion.materia_nombre}?`)) return
      try { await api.deleteAsignacion(asignacion.id); await this.cargarDatos(); this.mostrarMensaje('Asignación eliminada correctamente', 'success') }
      catch (error) { console.error('Error eliminando asignación:', error); this.mostrarError('Error al eliminar la asignación') }
    },
    abrirDropdown(campo) {
      this.dropdownAbierto = campo
      this.$nextTick(() => {
        const ref = { profesor: 'inputProfesor', carrera: 'inputCarrera', materia: 'inputMateria' }[campo]
        if (this.$refs[ref]) this.$refs[ref].focus()
      })
    },
    cerrarDropdown() { this.dropdownAbierto = null; this.buscarProfesor = ''; this.buscarCarrera = ''; this.buscarMateria = '' },
    seleccionarProfesor(prof) { this.asignacionForm.profesor = prof.id; this.buscarProfesor = ''; this.dropdownAbierto = null },
    limpiarProfesor() { this.asignacionForm.profesor = ''; this.buscarProfesor = '' },
    seleccionarCarrera(carrera) { this.carreraSeleccionada = carrera.id; this.buscarCarrera = ''; this.dropdownAbierto = null; this.asignacionForm.materia = ''; this.buscarMateria = ''; this.cargarMaterias() },
    limpiarCarrera() { this.carreraSeleccionada = ''; this.buscarCarrera = ''; this.materias = []; this.asignacionForm.materia = '' },
    seleccionarMateria(materia) { this.asignacionForm.materia = materia.id; this.buscarMateria = ''; this.dropdownAbierto = null },
    limpiarMateria() { this.asignacionForm.materia = ''; this.buscarMateria = '' },
    cerrarModal() {
      this.buscarProfesor = ''; this.buscarCarrera = ''; this.buscarMateria = ''; this.dropdownAbierto = null
      this.mostrarModalAsignacion = false; this.mensaje = ''; this.asignacionForm = this.getEmptyForm(); this.carreraSeleccionada = ''; this.materias = []
    },
    getEmptyForm() { return { id: null, profesor: '', materia: '', periodo_escolar: '', grupo: '', activa: true } },
    obtenerNombreSemestre(semestre) {
      const sem = parseInt(semestre)
      if (sem === 0 || isNaN(sem)) return 'Sin semestre'
      const nombres = { 1: '1er Semestre', 2: '2do Semestre', 3: '3er Semestre', 4: '4to Semestre', 5: '5to Semestre', 6: '6to Semestre', 7: '7mo Semestre', 8: '8vo Semestre', 9: '9no Semestre', 10: '10mo Semestre' }
      return nombres[sem] || `Semestre ${sem}`
    },
    contarAsignacionesPorPeriodo(periodo) {
      let total = 0; const semestresPeriodo = this.asignacionesAgrupadas[periodo]
      Object.values(semestresPeriodo).forEach(asignaciones => { total += asignaciones.length }); return total
    },
    contarAsignaciones(profesorId) { return this.asignaciones.filter(a => a.profesor === profesorId).length },
    contarAsignacionesActivas(profesorId) { return this.asignaciones.filter(a => a.profesor === profesorId && a.activa).length },
    contarAsignacionesInactivas(profesorId) { return this.asignaciones.filter(a => a.profesor === profesorId && !a.activa).length },
    mostrarMensaje(texto, tipo) { console.log(`[${tipo}] ${texto}`) },
    mostrarError(texto) { this.mostrarMensaje(texto, 'error') }
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
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-header h1 {
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
  margin: 0;
}

/* ─── Tabs ─── */
.tabs {
  display: flex;
  gap: 6px;
  background: #f7f6f3;
  border: 1px solid #dedad4;
  border-radius: 12px;
  padding: 6px;
  margin-bottom: 24px;
}

.tab {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 11px 20px;
  background: none;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.15s;
}

.tab:hover {
  color: #1a1a1a;
  background: #eeece8;
}

.tab.active {
  background: #1c2333;
  color: white;
}

/* ─── Controles ─── */
.controles {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}

.search-wrap {
  flex: 1;
  min-width: 280px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 13px;
  color: #9ca3af;
  pointer-events: none;
}

.search-control {
  width: 100%;
  padding: 9px 13px 9px 38px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  background: #f7f6f3;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.14s, box-shadow 0.14s;
}

.search-control:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.search-control::placeholder {
  color: #9ca3af;
}

.select-filtro {
  padding: 9px 13px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  background: #f7f6f3;
  color: #1a1a1a;
  cursor: pointer;
  outline: none;
  transition: border-color 0.14s, box-shadow 0.14s;
  min-width: 160px;
}

.select-filtro:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

/* ─── Periodo group ─── */
.periodo-group {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 22px;
  margin-bottom: 20px;
  border: 1px solid #dedad4;
}

.periodo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #dedad4;
  flex-wrap: wrap;
  gap: 10px;
}

.periodo-title {
  display: flex;
  align-items: center;
  gap: 9px;
  color: #374151;
}

.periodo-title h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  letter-spacing: -0.3px;
}

/* Badge del periodo — sin gradiente púrpura */
.count-badge-header {
  background: #1c2333;
  color: white;
  padding: 5px 14px;
  border-radius: 50px;
  font-size: 12.5px;
  font-weight: 600;
}

/* ─── Semestre group ─── */
.semestre-group {
  margin-bottom: 24px;
}

.semestre-group:last-child {
  margin-bottom: 0;
}

/* Header semestre — crema, sin azul */
.semestre-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  padding: 10px 16px;
  background: #eeece8;
  border-radius: 9px;
  border-left: 3px solid #1c2333;
}

.semestre-header h3 {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 700;
  margin: 0;
}

.semestre-count {
  background: white;
  color: #374151;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #dedad4;
}

/* ─── Asignaciones grid ─── */
.asignaciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 14px;
}

/* ─── Asignacion card ─── */
.asignacion-card {
  background: white;
  border-radius: 12px;
  padding: 18px;
  border: 1px solid #dedad4;
  transition: transform 0.15s, box-shadow 0.15s;
}

.asignacion-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
  border-color: #c8c4be;
}

.asignacion-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 13px;
  padding-bottom: 12px;
  border-bottom: 1px solid #dedad4;
  gap: 10px;
}

.asignacion-header h4 {
  margin: 0 0 6px;
  font-size: 14.5px;
  color: #1a1a1a;
  font-weight: 700;
}

/* Clave badge — crema, sin azul */
.clave-badge {
  display: inline-block;
  background: #eeece8;
  color: #374151;
  padding: 3px 9px;
  border-radius: 5px;
  font-size: 11.5px;
  font-weight: 700;
  font-family: monospace;
  border: 1px solid #dedad4;
}

/* Badges estado */
.badge-estado {
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 11.5px;
  font-weight: 600;
  flex-shrink: 0;
}

/* Verde y rojo → paleta del sistema */
.badge-estado.activo {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.badge-estado.inactivo {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

/* Info */
.asignacion-info {
  margin-bottom: 12px;
}

.asignacion-info p {
  margin: 6px 0;
  font-size: 13.5px;
  color: #6b7280;
}

.asignacion-info strong {
  color: #374151;
}

/* Status badge con planeación */
.asignacion-status {
  margin-bottom: 14px;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.success {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.status-badge.warning {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

/* ─── Botones de acción en cards ─── */
.asignacion-acciones {
  display: flex;
  gap: 7px;
  flex-wrap: wrap;
}

.btn-accion {
  flex: 1;
  min-width: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 7px 11px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12.5px;
  font-weight: 600;
  transition: all 0.12s;
  white-space: nowrap;
}

.btn-editar {
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
}

.btn-editar:hover {
  border-color: #1c2333;
  color: #1a1a1a;
}

.btn-toggle-off {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

.btn-toggle-off:hover {
  background: #fef3c7;
}

.btn-toggle-on {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.btn-toggle-on:hover {
  background: #dcfce7;
}

/* Eliminar: sin rojo bootstrap */
.btn-eliminar {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.btn-eliminar:hover {
  background: #fed7aa;
}

/* ─── Empty state ─── */
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
  font-size: 18px;
  font-weight: 600;
  color: #374151;
  margin: 0 0 8px;
}

.empty-state p {
  font-size: 14px;
  color: #9ca3af;
  margin: 0 0 22px;
}

/* ─── Tabla profesores ─── */
.tabla-container {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 0;
  border: 1px solid #dedad4;
  overflow: hidden;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Thead — #1c2333 en vez de gradiente púrpura */
.tabla thead {
  background: #1c2333;
}

.tabla th {
  padding: 13px 16px;
  text-align: left;
  font-size: 12.5px;
  font-weight: 700;
  color: white;
  white-space: nowrap;
  letter-spacing: 0.3px;
  text-transform: uppercase;
}

.tabla tbody tr {
  border-bottom: 1px solid #e5e0d8;
  transition: background 0.12s;
}

.tabla tbody tr:last-child {
  border-bottom: none;
}

.tabla tbody tr:hover {
  background: #eeece8;
}

.tabla td {
  padding: 13px 16px;
  font-size: 13.5px;
  color: #374151;
}

.tabla td strong {
  color: #1a1a1a;
  font-weight: 700;
}

/* Count badges en tabla */
.count-badge {
  display: inline-block;
  padding: 3px 11px;
  border-radius: 50px;
  font-size: 12.5px;
  font-weight: 700;
  min-width: 36px;
  text-align: center;
}

.count-badge.activo {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.count-badge.inactivo {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.custom-modal {
  background: white;
  border-radius: 18px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 30px 70px rgba(0, 0, 0, 0.2);
}

.modal-large {
  max-width: 680px;
}

/* Modal header — fondo blanco, sin gradiente gris */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px 26px 18px;
  border-bottom: 1px solid #f0ede8;
  position: sticky;
  top: 0;
  background: white;
  z-index: 10;
  border-radius: 18px 18px 0 0;
}

.modal-title-group h2 {
  margin: 0;
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
  padding: 24px 26px;
}

/* ─── Form ─── */
.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="number"],
.form-group input:not([type="radio"]):not([type="hidden"]) {
  width: 100%;
  padding: 10px 13px;
  border: 1.5px solid #dedad4;
  border-radius: 9px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  background: #f7f6f3;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.14s, box-shadow 0.14s;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

/* ─── Combobox ─── */
.combobox {
  position: relative;
}

.combobox.disabled {
  opacity: 0.55;
  pointer-events: none;
}

.combobox-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid #dedad4;
  border-radius: 9px;
  background: #f7f6f3;
  transition: border-color 0.14s, box-shadow 0.14s, background 0.14s;
  cursor: text;
}

.combobox-input-wrap:hover {
  border-color: #9ca3af;
}

.combobox.open .combobox-input-wrap {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

/* SVG icon en combobox */
.combobox-icon-svg {
  flex-shrink: 0;
  margin-left: 12px;
  color: #9ca3af;
  pointer-events: none;
}

.combobox-input {
  flex: 1;
  padding: 10px 10px 10px 8px;
  border: none;
  outline: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  color: #1a1a1a;
  background: transparent;
}

.combobox-input::placeholder {
  color: #9ca3af;
}

.combobox-input.has-value {
  font-weight: 600;
}

.combobox-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Clear button con SVG */
.combobox-clear {
  width: 24px;
  height: 24px;
  margin-right: 8px;
  border: none;
  background: #eeece8;
  border-radius: 50%;
  cursor: pointer;
  color: #6b7280;
  flex-shrink: 0;
  transition: all 0.15s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.combobox-clear:hover {
  background: #dedad4;
  color: #374151;
}

.combobox-list {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background: white;
  border: 1.5px solid #1c2333;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  max-height: 220px;
  overflow-y: auto;
  z-index: 200;
  list-style: none;
  margin: 0;
  padding: 5px;
}

.combobox-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 9px 11px;
  border-radius: 7px;
  cursor: pointer;
  transition: background 0.12s;
  gap: 10px;
}

.combobox-item:hover {
  background: #f7f6f3;
}

/* Selected: check en vez de ✓ Unicode */
.combobox-item.selected {
  background: #eeece8;
}

.combobox-item.selected::after {
  content: '';
  display: inline-block;
  width: 14px;
  height: 14px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%231c2333' stroke-width='3'%3E%3Cpolyline points='20 6 9 17 4 12'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-size: contain;
  flex-shrink: 0;
}

.combobox-item-main {
  font-size: 13.5px;
  color: #1a1a1a;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.combobox-item-sub {
  font-size: 12px;
  color: #9ca3af;
  white-space: nowrap;
  flex-shrink: 0;
}

.combobox-empty {
  padding: 10px 12px;
  font-size: 13px;
  color: #9ca3af;
  text-align: center;
  font-style: italic;
}

/* ─── Estado selector ─── */
.estado-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px;
  background: #f7f6f3;
  border-radius: 10px;
  border: 1.5px solid #dedad4;
}

.radio-option {
  display: flex;
  align-items: flex-start;
  gap: 11px;
  cursor: pointer;
  padding: 11px 13px;
  border-radius: 8px;
  border: 1.5px solid transparent;
  transition: all 0.14s;
  background: white;
}

.radio-option:hover {
  border-color: #dedad4;
}

.radio-option input[type="radio"] {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1c2333;
  flex-shrink: 0;
}

.radio-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
}

/* Radio badges con SVG */
.radio-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 12.5px;
  font-weight: 600;
  width: fit-content;
}

.radio-badge.activo {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.radio-badge.inactivo {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

.radio-label small {
  color: #9ca3af;
  font-size: 12px;
  line-height: 1.45;
}

/* Info text — crema, sin azul */
.info-text {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin-top: 10px;
  padding: 11px 13px;
  background: #eeece8;
  border-left: 3px solid #1c2333;
  border-radius: 8px;
  color: #374151;
  font-size: 12.5px;
  line-height: 1.5;
}

/* Helper text */
.helper-text {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #9ca3af;
}

.helper-text.warning {
  color: #d97706;
  font-weight: 600;
}

/* ─── Mensajes ─── */
.mensaje {
  padding: 11px 14px;
  border-radius: 9px;
  margin-bottom: 16px;
  font-size: 13.5px;
  font-weight: 500;
}

.mensaje.success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
  border-left: 3px solid #16a34a;
}

.mensaje.error {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
  border-left: 3px solid #f59e0b;
}

/* ─── Footer modal ─── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 20px;
  border-top: 1px solid #f0ede8;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 22px;
  background: #1c2333;
  color: white;
  border: none;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s, transform 0.1s, box-shadow 0.12s;
}

.btn-primary:hover:not(:disabled) {
  background: #263045;
  transform: translateY(-1px);
  box-shadow: 0 5px 16px rgba(28, 35, 51, 0.2);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 11px 22px;
  background: #eeece8;
  color: #374151;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.12s;
}

.btn-secondary:hover {
  border-color: #1c2333;
  color: #1a1a1a;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .controles {
    flex-direction: column;
  }

  .search-wrap,
  .select-filtro {
    width: 100%;
    min-width: unset;
  }

  .asignaciones-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .periodo-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .asignacion-acciones {
    flex-direction: column;
  }

  .btn-accion {
    width: 100%;
    min-width: unset;
  }

  .modal-large {
    max-width: 100%;
  }

  .modal-body {
    padding: 18px;
  }

  .tabs {
    flex-direction: column;
  }
}
</style>
