<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Gestión de Carreras</h1>
      <button @click="mostrarModalNueva = true" class="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nueva Carrera
      </button>
    </div>

    <!-- Lista de carreras -->
    <div class="carreras-grid">
      <div v-for="carrera in carreras" :key="carrera.id" class="carrera-card">
        <div class="carrera-header">
          <div>
            <h3>{{ carrera.nombre }}</h3>
            <p class="clave">Clave: {{ carrera.clave }}</p>
          </div>
        </div>

        <div class="carrera-info">
          <p><strong>Jefe de Carrera:</strong> {{ carrera.jefe_carrera_nombre || 'Sin asignar' }}</p>
          <p><strong>Materias:</strong> {{ carrera.total_materias }}</p>
          <p><strong>Fecha de creación:</strong> {{ formatearFecha(carrera.fecha_creacion) }}</p>
        </div>

        <div class="carrera-acciones">
          <button @click="editarJefeCarrera(carrera)" class="btn-icon" title="Editar Jefe">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar Jefatura
          </button>
          <button @click="verMaterias(carrera)" class="btn-icon" title="Ver Materias">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            Materias ({{ carrera.total_materias }})
          </button>
          <button @click="confirmarEliminarPlan(carrera)" class="btn-icon btn-danger"
            title="Eliminar carrera y plan de estudios">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
            Eliminar
          </button>
        </div>
      </div>
    </div>

    <div v-if="carreras.length === 0" class="empty-state">
      <p>No hay carreras registradas</p>
      <button @click="mostrarModalNueva = true" class="btn-primary">
        Crear primera carrera
      </button>
    </div>

    <!-- Modal Nueva Carrera con CSV -->
    <div v-if="mostrarModalNueva" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-custom modal-large">
        <div class="modal-header">
          <h2>Nueva Carrera</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Paso 1: Datos básicos -->
          <div class="paso-section">
            <h3>
              <span class="paso-num">1</span>
              Información de la Carrera
            </h3>

            <div class="form-group">
              <label>Nombre de la Carrera *</label>
              <input v-model="carreraForm.nombre" type="text" required
                placeholder="Ej: Ingeniería en Sistemas Computacionales" list="carreras-existentes" />
              <datalist id="carreras-existentes">
                <option v-for="carrera in carreras" :key="carrera.id" :value="carrera.nombre" />
              </datalist>
              <small>Puedes seleccionar una carrera existente o escribir una nueva</small>
            </div>

            <div class="form-group">
              <label>Jefe de Carrera *</label>
              <select v-model="carreraForm.jefe_carrera" required>
                <option :value="null">Seleccionar jefe de carrera...</option>
                <option v-for="jefe in jefesCarrera" :key="jefe.id" :value="jefe.id">
                  {{ jefe.nombre_completo || jefe.correo_institucional }}
                </option>
              </select>
            </div>
          </div>

          <!-- Paso 2: Subir CSV -->
          <div class="paso-section">
            <h3>
              <span class="paso-num">2</span>
              Subir Plan de Estudios (CSV)
            </h3>

            <div class="info-box">
              <p><strong>Formato del archivo CSV:</strong></p>
              <p>El archivo debe contener las columnas: <code>Semestre, Nombre de la materia, Clave</code></p>
              <p><strong>Ejemplo:</strong></p>
              <pre>
                Semestre,Nombre de la materia,Clave
                1,Metodología,ISC1
                1,Administración,ISC2
                2,Programación I,ISC3
              </pre>
            </div>

            <div
              class="file-input-container"
              :class="{ 'drag-active': arrastrandoArchivo }"
              @dragenter.prevent="arrastrandoArchivo = true"
              @dragover.prevent="arrastrandoArchivo = true"
              @dragleave.prevent="arrastrandoArchivo = false"
              @drop.prevent="handleFileDrop"
            >
              <input type="file" ref="fileInput" @change="handleFileChange" accept=".csv" id="csv-file" required />
              <label for="csv-file" class="file-label">
                {{ archivoSeleccionado ? archivoSeleccionado.name : 'Haz clic o arrastra aquí tu archivo CSV' }}
              </label>
            </div>

            <button @click="previewMalla" class="btn-secondary" :disabled="!archivoSeleccionado || cargando">
              Vista Previa
            </button>
          </div>

          <!-- Preview de la malla -->
          <div v-if="previewData" class="paso-section">
            <h3>Vista Previa del Plan de Estudios</h3>

            <div class="preview-stats">
              <span>Total de materias: <strong>{{ previewData.total }}</strong></span>
              <span>Semestres: <strong>{{ Object.keys(previewData.por_semestre || {}).length }}</strong></span>
            </div>

            <div class="semestres-container">
              <div v-for="semestre in semestresordenados" :key="semestre" class="semestre-card">
                <h4>Semestre {{ semestre }}</h4>
                <div class="materias-count">
                  {{ previewData.por_semestre[semestre].length }} materia(s)
                </div>
                <ul class="materias-list">
                  <li v-for="(materia, index) in previewData.por_semestre[semestre]" :key="index">
                    <span class="materia-clave">{{ materia.clave }}</span>
                    <span class="materia-nombre">{{ materia.nombre }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div class="confirmacion-box">
              <p><strong>Confirmación:</strong></p>
              <p>Se creará la carrera "<strong>{{ carreraForm.nombre }}</strong>" con <strong>{{ previewData.total
                  }}</strong> materias.</p>
              <p>El jefe de carrera será: <strong>{{ getNombreJefe(carreraForm.jefe_carrera) }}</strong></p>
            </div>
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="cerrarModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="button" @click="guardarCarreraConMalla" class="btn-primary"
              :disabled="guardando || !previewData || !carreraForm.jefe_carrera">
              {{ guardando ? 'Guardando...' : 'Confirmar y Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Editar Jefatura de Carrera -->
    <div v-if="mostrarModalEditarJefe" class="modal-overlay" @click.self="mostrarModalEditarJefe = false">
      <div class="modal-custom">
        <div class="modal-header">
          <h2>Editar Jefatura de Carrera</h2>
          <button @click="mostrarModalEditarJefe = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarJefeCarrera" class="modal-body">
          <p><strong>Carrera:</strong> {{ carreraSeleccionada?.nombre }}</p>
          <p><strong>Jefe actual:</strong> {{ carreraSeleccionada?.jefe_carrera_nombre || 'Sin asignar' }}</p>

          <div class="form-group">
            <label>Nueva Jefatura de Carrera *</label>
            <select v-model="nuevoJefe" required>
              <option :value="null">Sin asignar</option>
              <option v-for="jefe in jefesCarrera" :key="jefe.id" :value="jefe.id">
                {{ jefe.nombre_completo || jefe.correo_institucional }}
              </option>
            </select>
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="mostrarModalEditarJefe = false" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ver Materias -->
    <div v-if="mostrarModalMaterias" class="modal-overlay" @click.self="mostrarModalMaterias = false">
      <div class="modal-custom modal-large">
        <div class="modal-header">
          <h2>Plan de Estudios - {{ carreraSeleccionada?.nombre }}</h2>
          <button @click="mostrarModalMaterias = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div v-if="materiasCarrera.length === 0" class="empty-state">
            <p>No hay materias registradas para esta carrera</p>
          </div>

          <div v-else class="semestres-container">
            <div v-for="semestre in semestresConMaterias" :key="semestre" class="semestre-card">
              <h4>Semestre {{ semestre }}</h4>
              <div class="materias-count">
                {{ materiasPorSemestre[semestre].length }} materia(s)
              </div>
              <ul class="materias-list">
                <li v-for="materia in materiasPorSemestre[semestre]" :key="materia.id">
                  <span class="materia-clave">{{ materia.clave }}</span>
                  <span class="materia-nombre">{{ materia.nombre }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Confirmar Eliminación -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click.self="mostrarModalEliminar = false">
      <div class="modal-custom">
        <div class="modal-header">
          <h2>Eliminar Carrera</h2>
          <button @click="mostrarModalEliminar = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="warning-box">
            <p><strong>¡ADVERTENCIA!</strong></p>
            <p>Estás a punto de eliminar la carrera y su plan de estudios:</p>
            <p class="carrera-nombre">{{ carreraSeleccionada?.nombre }}</p>
            <p>Se eliminará la carrera y <strong>{{ carreraSeleccionada?.total_materias }}</strong> materias asociadas.</p>
            <p class="danger-text">Esta acción NO se puede deshacer.</p>
          </div>

          <div class="form-group">
            <label>Para confirmar, escribe el nombre de la carrera:</label>
            <input v-model="confirmacionNombre" type="text" placeholder="Escribe el nombre exacto de la carrera" />
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="mostrarModalEliminar = false" class="btn-secondary">
              Cancelar
            </button>
            <button type="button" @click="eliminarPlanEstudios" class="btn-danger"
              :disabled="guardando || confirmacionNombre !== carreraSeleccionada?.nombre">
              {{ guardando ? 'Eliminando...' : 'Eliminar Carrera' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'GestionCarreras',
  data() {
    return {
      carreras: [],
      jefesCarrera: [],
      materiasCarrera: [],

      mostrarModalNueva: false,
      mostrarModalEditarJefe: false,
      mostrarModalMaterias: false,
      mostrarModalEliminar: false,

      carreraForm: {
        nombre: '',
        jefe_carrera: null
      },
      carreraSeleccionada: null,
      nuevoJefe: null,
      archivoSeleccionado: null,
      arrastrandoArchivo: false,
      previewData: null,
      confirmacionNombre: '',

      mensaje: '',
      mensajeTipo: '',
      guardando: false,
      cargando: false
    }
  },
  computed: {
    materiasPorSemestre() {
      const agrupadas = {}
      this.materiasCarrera.forEach(materia => {
        if (!agrupadas[materia.semestre]) {
          agrupadas[materia.semestre] = []
        }
        agrupadas[materia.semestre].push(materia)
      })
      return agrupadas
    },
    semestresConMaterias() {
      return Object.keys(this.materiasPorSemestre).sort((a, b) => parseInt(a) - parseInt(b))
    },
    semestresordenados() {
      if (!this.previewData || !this.previewData.por_semestre) return []
      return Object.keys(this.previewData.por_semestre).sort((a, b) => parseInt(a) - parseInt(b))
    }
  },
  mounted() {
    this.cargarDatos()
  },
  methods: {
    async cargarDatos() {
      try {
        const carrerasResp = await api.getCarreras()
        this.carreras = Array.isArray(carrerasResp)
          ? carrerasResp
          : carrerasResp.results || []

        const jefesResp = await api.getJefesCarrera()
        this.jefesCarrera = Array.isArray(jefesResp)
          ? jefesResp
          : jefesResp.results || []

      } catch (error) {
        console.error('Error cargando datos:', error)
        this.mostrarMensaje('Error al cargar datos', 'error')
      }
    },

    seleccionarArchivo(archivo) {
      if (!archivo) return

      const esCsv = archivo.name.toLowerCase().endsWith('.csv') || archivo.type === 'text/csv'
      if (!esCsv) {
        this.mostrarMensaje('Por favor selecciona un archivo CSV', 'error')
        return
      }

      this.archivoSeleccionado = archivo
      this.previewData = null
      this.mensaje = ''
    },

    handleFileChange(event) {
      this.seleccionarArchivo(event.target.files[0])
    },

    handleFileDrop(event) {
      this.arrastrandoArchivo = false
      this.seleccionarArchivo(event.dataTransfer.files[0])
    },

    async previewMalla() {
      if (!this.archivoSeleccionado) {
        this.mostrarMensaje('Por favor selecciona un archivo CSV', 'error')
        return
      }

      if (!this.carreraForm.nombre.trim()) {
        this.mostrarMensaje('Por favor ingresa el nombre de la carrera', 'error')
        return
      }

      this.cargando = true
      this.mensaje = ''

      try {
        // Leer y parsear el CSV localmente para preview
        const text = await this.archivoSeleccionado.text()
        const lines = text.split('\n').filter(line => line.trim())

        // Quitar encabezado CSV
        lines.shift()

        const materias = []
        const materiasPorSemestre = {}

        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue

          const parts = line.split(',').map(p => p.trim())

          if (parts.length < 3) {
            this.mostrarMensaje(`Error en línea ${i + 1}: Formato incorrecto. Debe ser: Semestre,Nombre,Clave`, 'error')
            this.cargando = false
            return
          }

          const semestre = parseInt(parts[0])
          const nombre = parts[1]
          const clave = parts[2]

          if (isNaN(semestre) || semestre < 1 || semestre > 12) {
            this.mostrarMensaje(`Error en línea ${i + 1}: Semestre inválido (debe ser 1-12)`, 'error')
            this.cargando = false
            return
          }

          if (!nombre || !clave) {
            this.mostrarMensaje(`Error en línea ${i + 1}: Nombre o clave vacíos`, 'error')
            this.cargando = false
            return
          }

          const materia = { semestre, nombre, clave }
          materias.push(materia)

          if (!materiasPorSemestre[semestre]) {
            materiasPorSemestre[semestre] = []
          }
          materiasPorSemestre[semestre].push(materia)
        }

        if (materias.length === 0) {
          this.mostrarMensaje('El archivo CSV está vacío', 'error')
          this.cargando = false
          return
        }

        this.previewData = {
          materias,
          por_semestre: materiasPorSemestre,
          total: materias.length
        }

        this.mostrarMensaje(`Vista previa cargada: ${materias.length} materias`, 'success')

      } catch (error) {
        console.error('Error en preview:', error)
        this.mostrarMensaje('Error al procesar archivo: ' + error.message, 'error')
      } finally {
        this.cargando = false
      }
    },

    async guardarCarreraConMalla() {
      if (!this.carreraForm.nombre || !this.carreraForm.jefe_carrera || !this.previewData) {
        this.mostrarMensaje('Por favor completa todos los campos y carga el archivo', 'error')
        return
      }

      this.guardando = true
      this.mensaje = ''
      let carreraId = null
      let carreraCreada = false

      try {
        // Buscar si la carrera ya existe
        const carreraExistente = this.carreras.find(
          c => c.nombre.toLowerCase() === this.carreraForm.nombre.toLowerCase()
        )

        let clave

        if (carreraExistente) {
          // Usar carrera existente
          carreraId = carreraExistente.id
          clave = carreraExistente.clave

          // Actualizar jefe de carrera si es diferente
          if (carreraExistente.jefe_carrera !== this.carreraForm.jefe_carrera) {
            await api.updateCarrera(carreraId, {
              jefe_carrera: this.carreraForm.jefe_carrera
            })
          }
        } else {
          // Crear nueva carrera
          // Generar clave automática a partir del nombre
          clave = this.generarClave(this.carreraForm.nombre)

          const nuevaCarrera = await api.createCarrera({
            nombre: this.carreraForm.nombre,
            clave: clave,
            jefe_carrera: this.carreraForm.jefe_carrera,
            activa: true
          })

          carreraId = nuevaCarrera.id
          carreraCreada = true
        }

        // Subir malla curricular
        const response = await api.subirMalla(carreraId, this.archivoSeleccionado, false)

        this.mostrarMensaje(
          `✅ Carrera "${this.carreraForm.nombre}" guardada con ${response.total || this.previewData.total} materias`,
          'success'
        )

        await this.cargarDatos()

        setTimeout(() => {
          this.cerrarModal()
        }, 2000)

      } catch (error) {
        console.error('Error guardando carrera:', error)
        if (carreraCreada && carreraId) {
          try {
            await api.deleteCarrera(carreraId)
          } catch (rollbackError) {
            console.error('Error eliminando carrera creada tras fallo de carga:', rollbackError)
          }
        }
        this.mostrarMensaje(error?.message || error?.error || 'Error al guardar carrera', 'error')
      } finally {
        this.guardando = false
      }
    },

    generarClave(nombre) {
      // Generar clave de 3-5 letras a partir del nombre
      const palabras = nombre.split(' ').filter(p => p.length > 2)
      let clave = ''

      if (palabras.length >= 2) {
        // Tomar iniciales de las primeras palabras
        clave = palabras.slice(0, 3).map(p => p[0]).join('').toUpperCase()
      } else {
        // Tomar las primeras 3-4 letras
        clave = nombre.substring(0, 4).replace(/\s/g, '').toUpperCase()
      }

      return clave
    },

    editarJefeCarrera(carrera) {
      this.carreraSeleccionada = carrera
      this.nuevoJefe = carrera.jefe_carrera
      this.mensaje = ''
      this.mostrarModalEditarJefe = true
    },

    async guardarJefeCarrera() {
      this.guardando = true
      this.mensaje = ''

      try {
        await api.updateCarrera(this.carreraSeleccionada.id, {
          jefe_carrera: this.nuevoJefe
        })

        this.mostrarMensaje('Jefe de carrera actualizado correctamente', 'success')
        await this.cargarDatos()

        setTimeout(() => {
          this.mostrarModalEditarJefe = false
        }, 1500)

      } catch (error) {
        console.error('Error actualizando jefe:', error)
        this.mostrarMensaje('Error al actualizar jefe de carrera', 'error')
      } finally {
        this.guardando = false
      }
    },

    async verMaterias(carrera) {
      this.carreraSeleccionada = carrera
      this.materiasCarrera = []
      this.mostrarModalMaterias = true

      try {
        const resp = await api.getMaterias(carrera.id)

        this.materiasCarrera = Array.isArray(resp)
          ? resp
          : resp.results || []

      } catch (error) {
        console.error('Error cargando materias:', error)
        this.materiasCarrera = []
      }
    },

    confirmarEliminarPlan(carrera) {
      this.carreraSeleccionada = carrera
      this.confirmacionNombre = ''
      this.mensaje = ''
      this.mostrarModalEliminar = true
    },

    async eliminarPlanEstudios() {
      if (this.confirmacionNombre !== this.carreraSeleccionada.nombre) {
        this.mostrarMensaje('El nombre no coincide', 'error')
        return
      }

      this.guardando = true
      this.mensaje = ''

      try {
        const totalMaterias = this.carreraSeleccionada.total_materias || 0
        await api.deleteCarrera(this.carreraSeleccionada.id)

        this.mostrarMensaje(
          `Carrera eliminada correctamente. Se removieron ${totalMaterias} materias asociadas.`,
          'success'
        )

        await this.cargarDatos()

        setTimeout(() => {
          this.mostrarModalEliminar = false
        }, 2000)

      } catch (error) {
        console.error('Error eliminando plan:', error)
        this.mostrarMensaje(error?.message || 'Error al eliminar la carrera', 'error')
      } finally {
        this.guardando = false
      }
    },

    getNombreJefe(jefeId) {
      if (!jefeId) return 'Sin asignar'
      const jefe = this.jefesCarrera.find(j => j.id === jefeId)
      return jefe ? (jefe.nombre_completo || jefe.correo_institucional) : 'Sin asignar'
    },

    cerrarModal() {
      this.mostrarModalNueva = false
      this.carreraForm = { nombre: '', jefe_carrera: null }
      this.archivoSeleccionado = null
      this.arrastrandoArchivo = false
      this.previewData = null
      this.mensaje = ''
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = ''
      }
    },

    mostrarMensaje(texto, tipo) {
      this.mensaje = texto
      this.mensajeTipo = tipo

      if (tipo === 'success') {
        setTimeout(() => {
          this.mensaje = ''
        }, 3000)
      }
    },

    formatearFecha(fecha) {
      if (!fecha) return 'N/A'
      return new Date(fecha).toLocaleDateString('es-MX')
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

* {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ─── Layout ─── */
.page-container {
  width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.4px;
}

/* ─── Grid de carreras ─── */
.carreras-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 16px;
}

.carrera-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 22px;
  border: 1px solid #dedad4;
  transition: transform 0.18s, box-shadow 0.18s;
}

.carrera-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.carrera-header {
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e0d8;
}

.carrera-header h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.2px;
}

.clave {
  display: inline-block;
  font-size: 11.5px;
  font-weight: 600;
  color: #6b7280;
  background: #eeece8;
  padding: 2px 9px;
  border-radius: 50px;
  border: 1px solid #dedad4;
  margin: 0;
}

.carrera-info {
  margin-bottom: 16px;
}

.carrera-info p {
  margin: 7px 0;
  font-size: 13.5px;
  color: #6b7280;
}

.carrera-info p strong {
  color: #374151;
}

.carrera-acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ─── Empty state ─── */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: #f7f6f3;
  border-radius: 14px;
  border: 1px solid #dedad4;
  color: #9ca3af;
}

.empty-state p {
  margin-bottom: 18px;
  font-size: 14px;
}

/* ─── Botones inline ─── */
.btn-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
  background: #eeece8;
  border: 1px solid #dedad4;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12.5px;
  font-family: inherit;
  font-weight: 500;
  color: #374151;
  white-space: nowrap;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.btn-icon:hover:not(:disabled) {
  background: #e2e0db;
  border-color: #c0bdb7;
  color: #1a1a1a;
}

.btn-icon:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-danger {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #9f1239;
}

.btn-danger:hover:not(:disabled) {
  background: #ffe4e6;
  border-color: #fca5a5;
}

/* ─── Modal ─── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
}

.modal-custom {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
}

.modal-large {
  max-width: 1000px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #dedad4;
  background: #f7f6f3;
  border-radius: 16px 16px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.modal-header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.3px;
}

.btn-cerrar {
  background: #eeece8;
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
  padding: 24px;
}

.modal-body>p {
  margin: 8px 0;
  font-size: 13.5px;
  color: #374151;
}

/* ─── Pasos ─── */
.paso-section {
  background: #f7f6f3;
  border: 1px solid #dedad4;
  padding: 18px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.paso-section h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.1px;
}

.paso-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  background: #1c2333;
  color: white;
  border-radius: 50%;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}

/* ─── Form ─── */
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  background: white;
  color: #1a1a1a;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1c2333;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #9ca3af;
}

/* ─── Info box ─── */
.info-box {
  background: #eeece8;
  border-left: 3px solid #1c2333;
  padding: 14px 16px;
  border-radius: 10px;
  margin-bottom: 18px;
  border: 1px solid #dedad4;
  border-left: 3px solid #1c2333;
}

.info-box p {
  margin: 5px 0;
  font-size: 13px;
  color: #374151;
}

.info-box code {
  background: white;
  padding: 1px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: #b91c1c;
  font-size: 12px;
}

.info-box pre {
  background: white;
  padding: 10px 12px;
  border-radius: 8px;
  margin: 8px 0 0;
  font-size: 12px;
  overflow-x: auto;
  border: 1px solid #dbeafe;
}

/* ─── File input ─── */
.file-input-container {
  margin-bottom: 16px;
}

.file-input-container input[type="file"] {
  display: none;
}

.file-label {
  display: block;
  padding: 16px;
  background: #f7f6f3;
  border: 2px dashed #dedad4;
  border-radius: 10px;
  text-align: center;
  cursor: pointer;
  font-size: 13.5px;
  color: #6b7280;
  transition: border-color 0.15s, background 0.15s;
}

.file-label:hover {
  border-color: #1c2333;
  background: #eeece8;
  color: #1a1a1a;
}

.file-input-container.drag-active .file-label {
  border-color: #1c2333;
  background: #eeece8;
  color: #1a1a1a;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

/* ─── Preview stats ─── */
.preview-stats {
  display: flex;
  gap: 24px;
  padding: 13px 16px;
  background: #f0fdf4;
  border-radius: 10px;
  margin-bottom: 18px;
  border: 1px solid #bbf7d0;
  flex-wrap: wrap;
}

.preview-stats span {
  color: #166534;
  font-size: 13.5px;
  font-weight: 500;
}

/* ─── Semestres ─── */
.semestres-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 12px;
  max-height: 380px;
  overflow-y: auto;
}

.semestre-card {
  background: #f7f6f3;
  padding: 14px;
  border-radius: 10px;
  border-left: 3px solid #1c2333;
  border: 1px solid #dedad4;
  border-left: 3px solid #1c2333;
}

.semestre-card h4 {
  margin: 0 0 8px 0;
  font-size: 13.5px;
  font-weight: 700;
  color: #1a1a1a;
}

.materias-count {
  font-size: 11.5px;
  color: #9ca3af;
  margin-bottom: 10px;
  font-weight: 500;
}

.materias-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.materias-list li {
  padding: 7px 10px;
  margin-bottom: 5px;
  background: white;
  border-radius: 7px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13px;
  border: 1px solid #eeece8;
}

.materia-clave {
  background: #1c2333;
  color: white;
  padding: 2px 8px;
  border-radius: 5px;
  font-weight: 600;
  font-size: 11px;
  min-width: 48px;
  text-align: center;
}

.materia-nombre {
  flex: 1;
  color: #374151;
}

/* ─── Confirmación y warning ─── */
.confirmacion-box {
  background: #fef9ee;
  border-left: 3px solid #f59e0b;
  padding: 14px 16px;
  border-radius: 10px;
  margin-top: 18px;
}

.confirmacion-box p {
  margin: 4px 0;
  color: #92400e;
  font-size: 13.5px;
}

.warning-box {
  background: #fef9ee;
  border-left: 3px solid #f59e0b;
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 18px;
}

.warning-box p {
  margin: 6px 0;
  color: #92400e;
  font-size: 13.5px;
}

.carrera-nombre {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  text-align: center;
  padding: 10px;
  background: white;
  border-radius: 8px;
  border: 1px solid #dedad4;
  margin: 12px 0;
}

.danger-text {
  color: #9f1239 !important;
  font-weight: 700;
  text-align: center;
  font-size: 14px;
}

/* ─── Mensaje ─── */
.mensaje {
  padding: 11px 14px;
  border-radius: 10px;
  margin: 12px 0;
  font-size: 13.5px;
  font-weight: 500;
}

.mensaje.success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.mensaje.error {
  background: #fff1f2;
  color: #9f1239;
  border: 1px solid #fecdd3;
}

/* ─── Modal footer ─── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid #dedad4;
}

/* ─── Botones principales ─── */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13.5px;
  font-weight: 600;
  font-family: inherit;
  transition: all 0.15s;
}

.btn-primary {
  background: #1c2333;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #263045;
  box-shadow: 0 4px 14px rgba(28, 35, 51, 0.22);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
}

.btn-secondary:hover:not(:disabled) {
  background: #e2e0db;
}
</style>
