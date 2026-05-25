<template>
  <div class="page-container">
    <div class="page-header">
      <h1>{{ documento.id ? 'Editar' : 'Crear' }} Planeación Académica</h1>
      <button @click="$router.back()" class="btn-secondary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>
    </div>

    <div class="form-notice">
      <p><strong>Importante:</strong> Una vez aprobada la planeación, podrás crear los 4 Avances Programáticos</p>
    </div>

    <!-- Observaciones del jefe (si existen) -->
    <div v-if="documento.observaciones_jefe" class="form-section observaciones-section">
      <h2>Observaciones de jefatura de carrera</h2>
      <div class="observaciones-box">
        {{ documento.observaciones_jefe }}
      </div>
    </div>

    <form @submit.prevent="enviarDocumento" class="documento-form">

      <!-- 1. DATOS DE IDENTIFICACIÓN -->
      <div class="form-section">
        <h2>1. DATOS DE IDENTIFICACIÓN DE LA ASIGNATURA</h2>

        <div class="info-readonly">
          <div class="info-item">
            <label>Carrera:</label>
            <span>{{ asignacion?.carrera_nombre || 'Cargando...' }}</span>
          </div>
          <div class="info-item">
            <label>Clave de la asignatura:</label>
            <span>{{ asignacion?.materia_clave || 'Cargando...' }}</span>
          </div>
          <div class="info-item">
            <label>Asignatura:</label>
            <span>{{ asignacion?.materia_nombre || 'Cargando...' }}</span>
          </div>
          <div class="info-item">
            <label>Semestre:</label>
            <span>{{ asignacion?.semestre || 'N/A' }}</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Grupo *</label>
            <input v-model="documento.grupo" type="text" required placeholder="Ej: A, B, 101" />
          </div>

          <div class="form-group">
            <label>Profesor(a) *</label>
            <input type="text" required :value="usuarioActual?.nombre_completo || usuarioActual?.correo_institucional" readonly />
          </div>

          <div class="form-group">
            <label>Correo institucional *</label>
            <input type="email" required :value="usuarioActual?.correo_institucional" readonly />
          </div>
        </div>
      </div>

      <!-- 2. BLOQUE DE CONTROL INSTITUCIONAL -->
      <div class="form-section">
        <h2>2. BLOQUE DE CONTROL INSTITUCIONAL</h2>

        <div class="control-info">
          <p><strong>Periodo escolar:</strong> {{ asignacion?.periodo_escolar }}</p>
          <div class="form-group">
            <label><strong>Fecha de entrega:</strong></label>
            <input type="date" :value="documento.fecha_entrega" readonly />
            <small style="color: #666; margin-top: 5px;">Fecha asignada automáticamente por el sistema</small>
          </div>
          <p class="note">Este documento se entrega por cada asignatura asignada.</p>
        </div>
      </div>

      <!-- 3. REFERENCIA AL PROGRAMA DE ESTUDIOS -->
      <div class="form-section">
        <h2>3. REFERENCIA AL PROGRAMA DE ESTUDIOS</h2>

        <div class="form-group">
          <label>Objetivo general de la asignatura *</label>
          <textarea v-model="documento.objetivo_general" rows="4" required
            placeholder="Describe el objetivo general de la asignatura..."></textarea>
        </div>

        <div class="form-group">
          <label>Total de horas de la asignatura *</label>
          <input v-model.number="documento.horas_totales" type="number" required min="1" />
        </div>
      </div>

      <!-- 4. DISTRIBUCIÓN DE LA EVALUACIÓN -->
      <div class="form-section">
        <h2>4. DISTRIBUCIÓN DE LA EVALUACIÓN</h2>

        <h3>Marco Institucional</h3>

        <table class="table table-bordered table-striped">
          <thead class="table-light">
            <tr>
              <th style="width: 30%">Concepto</th>
              <th style="width: 70%">Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Puntualidad</strong></td>
              <td>Asistencia puntual a la sesión.</td>
            </tr>
            <tr>
              <td><strong>Derechos</strong></td>
              <td>Revisar artículos del 25 al 28 del Reglamento de Estudiantes de Licenciatura de la NovaUniversitas.</td>
            </tr>
            <tr>
              <td><strong>Obligaciones</strong></td>
              <td>Revisar artículo 29 del Reglamento de Estudiantes de Licenciatura de la NovaUniversitas.</td>
            </tr>
            <tr>
              <td><strong>Disciplina</strong></td>
              <td>Revisar artículos del 30 al 42 del Reglamento de Estudiantes de Licenciatura de la NovaUniversitas.</td>
            </tr>
            <tr>
              <td><strong>Redondeo de notas</strong></td>
              <td>Se califica considerando la primera posición decimal con redondeo. (Artículo 52 del Reglamento de
                Estudiantes de Licenciatura).</td>
            </tr>
            <tr>
              <td><strong>Ética escolar</strong></td>
              <td>
                En caso de comprobarse plagio, falsificación o copia de trabajo, examen o actividad en cuestión,
                el estudiante será sancionado con la cancelación de este. En caso de reiterar, será anulada la
                evaluación del periodo correspondiente y se enviará reporte al Departamento de Servicios Escolares.
              </td>
            </tr>
          </tbody>
        </table>

        <div class="evaluacion-global">
          <h3>Evaluación de la asignatura</h3>

          <table class="table table-bordered table-striped">
            <thead class="table-light">
              <tr>
                <th>Concepto</th>
                <th>Porcentaje</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Evaluaciones Parciales (3)</strong></td>
                <td>50%</td>
                <td><strong>
                    <p>1er parcial, {{ configuracionPeriodo?.parcial1_texto || 'cargando...' }}.</p>
                    <p>2do parcial, {{ configuracionPeriodo?.parcial2_texto || 'cargando...' }}.</p>
                    <p>3er parcial, {{ configuracionPeriodo?.parcial3_texto || 'cargando...' }}.</p>
                  </strong></td>
              </tr>
              <tr>
                <td><strong>Evaluación Ordinaria</strong></td>
                <td>50%</td>
                <td><strong>El periodo de evaluación ordinaria será {{ configuracionPeriodo?.ordinario_texto ||
                  'cargando...' }}</strong></td>
              </tr>
              <tr class="table-secondary">
                <td><strong>Total evaluación</strong></td>
                <td><strong>100%</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Criterios de evaluación por parcial -->
      <div class="evaluaciones-parciales">
        <h3>A. Evaluaciones Parciales</h3>
        <p class="instruccion">Para cada evaluación parcial, el docente deberá establecer los criterios de
          evaluación, su descripción y su ponderación, considerando que la suma de los
          porcentajes correspondientes al parcial deberá ser igual al 100%.
          Los criterios de evaluación serán determinados por el docente de acuerdo con la
          naturaleza y objetivos de la asignatura, pudiendo incluir, de manera enunciativa
          mas no limitativa, tareas, actividades en clase, participación, exposiciones,
          proyecto o proyecto integrador, avances de proyecto, trabajos de investigación,
          exámenes teóricos, exámenes prácticos u otros criterios debidamente
          especificados.</p>

        <!-- Parciales 1, 2, 3 -->
        <div v-for="n in 3" :key="n" class="parcial-section mb-4">
          <h4>Parcial {{ n }}</h4>

          <table class="table table-bordered table-striped">
            <thead class="table-dark">
              <tr>
                <th>Tipo de criterio</th>
                <th>Descripción breve</th>
                <th>Instrumento</th>
                <th style="width: 10%">%</th>
                <th style="width: 10%">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(criterio, index) in documento.criterios_evaluacion[`parcial${n}`]" :key="index">
                <td><input v-model="criterio.tipo" type="text" class="form-control" required /></td>
                <td><textarea v-model="criterio.descripcion" type="text" class="form-control" required /></td>
                <td><input v-model="criterio.instrumento" type="text" class="form-control" required /></td>
                <td>
                  <input v-model.number="criterio.porcentaje" type="number" min="0" max="100" class="form-control"
                    required @input="validarPorcentaje(criterio, `parcial${n}`)" />
                </td>
                <td>
                  <button type="button" class="btn btn-danger btn-sm" @click="eliminarCriterio(`parcial${n}`, index)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <button type="button" class="btn btn-primary btn-sm mb-2" @click="agregarCriterio(`parcial${n}`)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar Criterio
          </button>

          <div :class="['total-porcentaje', { 'error': calcularTotal(`parcial${n}`) !== 100 }]">
            Total del parcial: {{ calcularTotal(`parcial${n}`) }}%
            <span v-if="calcularTotal(`parcial${n}`) !== 100" class="text-danger">
              (Debe sumar 100%)
            </span>
          </div>
        </div>
      </div>

      <!-- Evaluación Ordinaria -->
      <div class="parcial-section mb-4">
        <h4>B. Evaluación Ordinaria</h4>
        <p class="instruccion">La evaluación ordinaria se realizará conforme al calendario escolar vigente.</p>

        <table class="table table-bordered table-striped">
          <thead class="table-dark">
            <tr>
              <th>Tipo de criterio</th>
              <th>Descripción breve</th>
              <th>Instrumento</th>
              <th style="width: 10%">%</th>
              <th style="width: 10%">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(criterio, index) in documento.criterios_evaluacion.ordinario" :key="index">
              <td><input v-model="criterio.tipo" type="text" class="form-control" required /></td>
              <td><textarea v-model="criterio.descripcion" type="text" class="form-control" required /></td>
              <td><input v-model="criterio.instrumento" type="text" class="form-control" required /></td>
              <td>
                <input v-model.number="criterio.porcentaje" type="number" min="0" max="100" class="form-control"
                  required @input="validarPorcentaje(criterio, 'ordinario')" />
              </td>
              <td>
                <button type="button" class="btn btn-danger btn-sm" @click="eliminarCriterio('ordinario', index)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <button type="button" class="btn btn-primary btn-sm mb-2" @click="agregarCriterio('ordinario')">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar Criterio
        </button>

        <div :class="['total-porcentaje', { 'error': calcularTotal('ordinario') !== 100 }]">
          Total evaluación ordinaria: {{ calcularTotal('ordinario') }}%
          <span v-if="calcularTotal('ordinario') !== 100" class="text-danger">
            (Debe sumar 100%)
          </span>
        </div>
      </div>

      <!-- 5A. PLANEACIÓN DE CONTENIDOS -->
      <div class="form-section">
        <h2>5A. PLANEACIÓN DE CONTENIDOS</h2>

        <p class="instruccion">Las horas planeadas se determinan con base en el Programa de Estudios.</p>

        <table class="table table-bordered table-striped">
          <thead class="table-dark">
            <tr>
              <th style="width: 5%">Unidad</th>
              <th style="width: 50%">Temas y Subtemas</th>
              <th style="width: 15%">Horas Planeadas</th>
              <th style="width: 20%">Periodo Planeado</th>
              <th style="width: 10%">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(contenido, index) in documento.contenidos" :key="index">
              <td>{{ index + 1 }}</td>
              <td>
                <textarea v-model="contenido.tema" class="form-control" rows="2" required></textarea>
              </td>
              <td>
                <input v-model.number="contenido.horas_planeadas" type="number" min="1" class="form-control" required />
              </td>
              <td>
                <input v-model="contenido.periodo" type="text" placeholder="Ej: Semanas 1-4" class="form-control" />
              </td>
              <td>
                <button type="button" class="btn btn-danger btn-sm" @click="eliminarContenido(index)">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6M14 11v6" />
                  </svg>
                </button>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <th colspan="2" class="text-end">Total de horas:</th>
              <th>{{ calcularTotalHoras() }} hrs</th>
              <th colspan="2"></th>
            </tr>
          </tfoot>
        </table>

        <button type="button" class="btn btn-primary" @click="agregarContenido">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Agregar Unidad
        </button>
      </div>

      <!-- 9. BIBLIOGRAFÍA -->
      <div class="form-section">
        <h2>9. BIBLIOGRAFÍA UTILIZADA EN EL PERIODO</h2>

        <!-- Bibliografía básica -->
        <div class="bibliografia-section">
          <h3>Bibliografía básica (formato APA):</h3>
          <table class="table table-bordered table-striped">
            <thead class="table-dark">
              <tr>
                <th style="width: 5%">Número</th>
                <th style="width: 85%">Referencia</th>
                <th style="width: 10%">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bib, index) in documento.bibliografia_basica" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input v-model="documento.bibliografia_basica[index]" type="text" class="form-control"
                    placeholder="Referencia en formato APA" />
                </td>
                <td>
                  <button type="button" class="btn btn-danger btn-sm" @click="eliminarBibliografia('basica', index)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="btn btn-primary btn-sm" @click="agregarBibliografia('basica')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar referencia
          </button>
        </div>

        <!-- Bibliografía complementaria -->
        <div class="bibliografia-section mt-4">
          <h3>Bibliografía de consulta / complementaria (formato APA):</h3>
          <table class="table table-bordered table-striped">
            <thead class="table-dark">
              <tr>
                <th style="width: 5%">Número</th>
                <th style="width: 85%">Referencia</th>
                <th style="width: 10%">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(bib, index) in documento.bibliografia_complementaria" :key="index">
                <td>{{ index + 1 }}</td>
                <td>
                  <input v-model="documento.bibliografia_complementaria[index]" type="text" class="form-control"
                    placeholder="Referencia en formato APA" />
                </td>
                <td>
                  <button type="button" class="btn btn-danger btn-sm"
                    @click="eliminarBibliografia('complementaria', index)">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <button type="button" class="btn btn-primary btn-sm" @click="agregarBibliografia('complementaria')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Agregar referencia
          </button>
        </div>

        <div class="checkbox-declaracion">
          <input type="checkbox" id="declaracion" v-model="documento.declara_apego" required />
          <label for="declaracion">
            El docente declara que la presente planeación se apega al programa de estudios vigente autorizado por la
            Universidad NovaUniversitas.
          </label>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="button" @click="guardarBorrador" class="btn-secondary" :disabled="guardando">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Guardar Borrador
        </button>
        <button type="submit" class="btn-primary" :disabled="guardando || !validarFormulario()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          {{ guardando ? 'Enviando...' : 'Enviar para Revisión' }}
        </button>
      </div>

      <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
        {{ mensaje }}
      </div>
    </form>
  </div>
</template>

<script>
import api from '../../services/api.js'

export default {
  name: 'CrearDocumentoAcademico',
  data() {
    return {
      asignacion: null,
      usuarioActual: null,
      configuracionPeriodo: null,
      tipoDocumento: 'planeacion',
      documento: this.getEmptyDocumento(),
      jefaturaCarrera: '',

      mensaje: '',
      mensajeTipo: '',
      guardando: false
    }
  },
  computed: {
    fechaMaxima() {
      return this.formatearFechaISO(new Date())
    },
    fechaMinima() {
      const hoy = new Date()
      hoy.setDate(hoy.getDate() - 7)
      return this.formatearFechaISO(hoy)
    }
  },
  async mounted() {
    const asignacionId = this.$route.params.asignacionId
    const planeacionId = this.$route.query.planeacionId

    if (asignacionId) {
      this.documento.asignacion = parseInt(asignacionId)
      this.documento.fecha_entrega = this.formatearFechaISO(new Date())
      await this.cargarDatos(asignacionId, planeacionId)
      await this.cargarConfiguracionPeriodo()
    }
  },
  methods: {
    calcularTotal(nombreCriterios) {
      return this.documento.criterios_evaluacion[nombreCriterios]
        .reduce((sum, c) => sum + (c.porcentaje || 0), 0)
    },

    validarPorcentaje(criterio, nombreCriterios) {
      const totalActual = this.calcularTotal(nombreCriterios)
      if (criterio.porcentaje > 100) criterio.porcentaje = 100
      if (criterio.porcentaje < 0) criterio.porcentaje = 0

      const totalSinCriterio = totalActual - criterio.porcentaje
      if (totalSinCriterio + criterio.porcentaje > 100) {
        criterio.porcentaje = Math.max(0, 100 - totalSinCriterio)
      }
    },

    agregarCriterio(nombreCriterios) {
      const totalActual = this.calcularTotal(nombreCriterios)
      const porcentajeInicial = totalActual >= 100 ? 0 : 0
      this.documento.criterios_evaluacion[nombreCriterios].push({
        tipo: '',
        descripcion: '',
        instrumento: '',
        porcentaje: porcentajeInicial
      })
    },

    eliminarCriterio(nombreCriterios, index) {
      this.documento.criterios_evaluacion[nombreCriterios].splice(index, 1)
    },
    formatearFechaISO(fecha) {
      const year = fecha.getFullYear()
      const month = String(fecha.getMonth() + 1).padStart(2, '0')
      const day = String(fecha.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    },

    async cargarDatos(asignacionId, planeacionId) {
      try {
        const response = await api.getAsignaciones()
        const asignaciones = Array.isArray(response) ? response : response.results || []
        this.asignacion = asignaciones.find(a => a.id === parseInt(asignacionId))

        this.usuarioActual = await api.getPerfil()

        if (this.asignacion?.materia) {
          try {
            const materia = await api.getMaterias(this.asignacion.materia)
            const carrera = await api.getCarreras(materia.carrera)
            this.jefaturaCarrera = carrera.jefe_carrera_nombre || 'No asignado'
          } catch (error) {
            this.jefaturaCarrera = 'No asignado'
          }
        }

        this.documento.grupo = this.asignacion?.grupo || ''

        if (planeacionId) {
          await this.cargarPlaneacionExistente(parseInt(planeacionId))
        } else {
          const planeacionesResp = await api.getPlaneaciones()
          const planeaciones = Array.isArray(planeacionesResp)
            ? planeacionesResp
            : planeacionesResp.results || []

          const planeacionExistente = planeaciones.find(
            p => p.asignacion === parseInt(asignacionId)
          )

          if (planeacionExistente) {
            await this.cargarPlaneacionExistente(planeacionExistente.id)
          }
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        this.mostrarMensaje('Error al cargar datos', 'error')
      }
    },

    async cargarPlaneacionExistente(planeacionId) {
      try {
        const planeacion = await api.getPlaneacion(planeacionId)

        this.documento.id = planeacion.id
        this.documento.asignacion = planeacion.asignacion
        this.documento.grupo = planeacion.grupo || this.documento.grupo
        this.documento.objetivo_general = planeacion.objetivo_general || ''
        this.documento.horas_totales = planeacion.horas_totales || 48
        this.documento.observaciones_jefe = planeacion.observaciones_jefe || ''

        if (planeacion.criterios_evaluacion &&
          typeof planeacion.criterios_evaluacion === 'object') {

          this.documento.criterios_evaluacion = {
            parcial1: this.cargarCriterios(planeacion.criterios_evaluacion.parcial1),
            parcial2: this.cargarCriterios(planeacion.criterios_evaluacion.parcial2),
            parcial3: this.cargarCriterios(planeacion.criterios_evaluacion.parcial3),
            ordinario: this.cargarCriterios(planeacion.criterios_evaluacion.ordinario)
          }
        }

        if (planeacion.contenidos && Array.isArray(planeacion.contenidos)) {
          this.documento.contenidos = planeacion.contenidos.length > 0
            ? planeacion.contenidos.map(c => ({
              unidad: c.unidad || 1,
              tema: c.tema || '',
              horas_planeadas: c.horas_planeadas || 0,
              periodo: c.periodo || ''
            }))
            : [{ unidad: 1, tema: '', horas_planeadas: 0, periodo: '' }]
        }

        if (planeacion.bibliografia_basica) {
          this.documento.bibliografia_basica = Array.isArray(planeacion.bibliografia_basica)
            ? planeacion.bibliografia_basica
            : [planeacion.bibliografia_basica]
        }

        if (planeacion.bibliografia_complementaria) {
          this.documento.bibliografia_complementaria = Array.isArray(planeacion.bibliografia_complementaria)
            ? planeacion.bibliografia_complementaria
            : [planeacion.bibliografia_complementaria]
        }

        this.documento.declara_apego = planeacion.declara_apego || false

      } catch (error) {
        console.error('Error cargando planeación existente:', error)
      }
    },

    cargarCriterios(criterios) {
      if (!criterios || !Array.isArray(criterios)) return [{ tipo: '', descripcion: '', instrumento: '', porcentaje: 0 }]
      return criterios.length > 0
        ? criterios.map(c => ({
          tipo: c.tipo || '',
          descripcion: c.descripcion || '',
          instrumento: c.instrumento || '',
          porcentaje: c.porcentaje || 0
        }))
        : [{ tipo: '', descripcion: '', instrumento: '', porcentaje: 0 }]
    },

    async cargarConfiguracionPeriodo() {
      try {
        this.configuracionPeriodo = await api.getConfiguracionPeriodoActivo()
      } catch (error) {
        console.error('Error cargando configuración de periodo:', error)
      }
    },

    getEmptyDocumento() {
      return {
        id: null,
        asignacion: null,
        grupo: '',
        objetivo_general: '',
        horas_totales: 48,
        fecha_entrega: '',
        observaciones_jefe: '',
        criterios_evaluacion: {
          parcial1: [{ tipo: '', descripcion: '', instrumento: '', porcentaje: 0 }],
          parcial2: [{ tipo: '', descripcion: '', instrumento: '', porcentaje: 0 }],
          parcial3: [{ tipo: '', descripcion: '', instrumento: '', porcentaje: 0 }],
          ordinario: [{ tipo: '', descripcion: '', instrumento: '', porcentaje: 0 }]
        },
        contenidos: [{ unidad: 1, tema: '', horas_planeadas: 0, periodo: '' }],
        bibliografia_basica: [''],
        bibliografia_complementaria: [''],
        declara_apego: false
      }
    },

    calcularTotalHoras() {
      return this.documento.contenidos.reduce((sum, c) => sum + (c.horas_planeadas || 0), 0)
    },

    agregarContenido() {
      const nextUnidad = this.documento.contenidos.length + 1
      this.documento.contenidos.push({ unidad: nextUnidad, tema: '', horas_planeadas: 0, periodo: '' })
    },

    eliminarContenido(index) {
      this.documento.contenidos.splice(index, 1)
    },

    agregarBibliografia(tipo) {
      if (tipo === 'basica') {
        this.documento.bibliografia_basica.push('')
      } else {
        this.documento.bibliografia_complementaria.push('')
      }
    },

    eliminarBibliografia(tipo, index) {
      if (tipo === 'basica') {
        this.documento.bibliografia_basica.splice(index, 1)
      } else {
        this.documento.bibliografia_complementaria.splice(index, 1)
      }
    },

    validarFormulario() {
      const parciales = ['parcial1', 'parcial2', 'parcial3', 'ordinario']
      for (const parcial of parciales) {
        const total = this.calcularTotal(parcial)
        if (total !== 100) {
          return false
        }
      }
      return this.documento.objetivo_general &&
        this.documento.horas_totales > 0 &&
        this.documento.declara_apego
    },

    async guardarBorrador() {
      this.guardando = true
      this.mensaje = ''

      try {
        const dataToSave = {
          asignacion: this.documento.asignacion,
          objetivo_general: this.documento.objetivo_general,
          horas_totales: this.documento.horas_totales,
          criterios_evaluacion: this.documento.criterios_evaluacion,
          contenidos: this.documento.contenidos,
          bibliografia_basica: this.documento.bibliografia_basica
            .filter(b => b && b.trim() !== ''),
          bibliografia_complementaria: this.documento.bibliografia_complementaria
            .filter(b => b && b.trim() !== ''),
          estado: 'BORRADOR'
        }

        let result
        if (this.documento.id) {
          result = await api.updatePlaneacion(this.documento.id, dataToSave)
        } else {
          result = await api.createPlaneacion(dataToSave)
          this.documento.id = result.id
        }

        this.mostrarMensaje('Borrador guardado correctamente', 'success')

      } catch (error) {
        this.mostrarMensaje(
          'Error al guardar: ' + (error.response?.data?.detail || error.message),
          'error'
        )
      } finally {
        this.guardando = false
      }
    },

    async enviarDocumento() {
      if (!this.validarFormulario()) {
        this.mostrarMensaje('Por favor completa todos los campos correctamente', 'error')
        return
      }

      this.guardando = true
      try {
        await this.guardarBorrador()
        await api.enviarPlaneacion(this.documento.id)
        this.mostrarMensaje('Documento enviado para revisión correctamente', 'success')

        setTimeout(() => {
          this.$router.push('/mis-asignaciones')
        }, 2000)
      } catch (error) {
        console.error('Error enviando documento:', error)
        this.mostrarMensaje('Error al enviar documento', 'error')
      } finally {
        this.guardando = false
      }
    },

    mostrarMensaje(texto, tipo) {
      this.mensaje = texto
      this.mensajeTipo = tipo

      setTimeout(() => {
        this.mensaje = ''
      }, 5000)
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
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
}

.page-header h1 {
  font-size: clamp(18px, 2.2vw, 26px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.4px;
}

/* ─── Notice ─── */
.form-notice {
  background: #eeece8;
  border: 1px solid #dedad4;
  border-left: 4px solid #1c2333;
  padding: 14px 18px;
  margin-bottom: 28px;
  border-radius: 10px;
}

.form-notice p {
  margin: 0;
  color: #374151;
  font-size: 13.5px;
}

/* ─── Form card ─── */
.documento-form {
  background: #f7f6f3;
  padding: 32px;
  border-radius: 14px;
  border: 1px solid #dedad4;
}

/* ─── Sections ─── */
.form-section {
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid #dedad4;
}

.form-section:last-of-type {
  border-bottom: none;
}

.form-section h2 {
  color: #1a1a1a;
  margin-bottom: 18px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding-left: 12px;
  border-left: 3px solid #1c2333;
}

.form-section h3 {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin: 18px 0 12px;
}

/* ─── Readonly info grid ─── */
.info-readonly {
  background: #eeece8;
  padding: 18px;
  border-radius: 10px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 20px;
  border: 1px solid #dedad4;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-weight: 600;
  color: #9ca3af;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-item span {
  color: #1a1a1a;
  font-size: 14px;
  font-weight: 500;
}

/* ─── Control info ─── */
.control-info {
  background: #eeece8;
  padding: 16px;
  border-radius: 10px;
  margin-top: 16px;
  border: 1px solid #dedad4;
}

.control-info p {
  margin: 7px 0;
  color: #374151;
  font-size: 13.5px;
}

.note {
  font-style: italic;
  font-size: 12.5px;
  color: #9ca3af;
}

/* ─── Form rows & groups ─── */
.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 18px;
  margin-bottom: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.form-group input,
.form-group textarea,
.form-group select {
  padding: 10px 12px;
  border: 1.5px solid #dedad4;
  border-radius: 9px;
  font-size: 13.5px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  background: #faf9f7;
  color: #1a1a1a;
  transition: border-color 0.14s, box-shadow 0.14s, background 0.14s;
  outline: none;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  border-color: #1c2333;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.form-group input:read-only,
.form-group input[readonly] {
  background: #eeece8;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #dedad4;
}

.form-group small {
  color: #9ca3af;
  font-size: 11.5px;
  margin-top: 4px;
}

/* ─── Declaración checkbox ─── */
.checkbox-declaracion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background: #eeece8;
  border: 1px solid #dedad4;
  padding: 14px;
  margin-top: 20px;
  border-radius: 10px;
}

.checkbox-declaracion input[type="checkbox"] {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: #1c2333;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-declaracion label {
  font-size: 13.5px;
  color: #374151;
  line-height: 1.55;
  cursor: pointer;
}

/* ─── Tables ─── */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13.5px;
  margin-bottom: 16px;
}

.table th {
  background: #1c2333;
  color: white;
  padding: 10px 12px;
  font-weight: 600;
  font-size: 12px;
  text-align: left;
  letter-spacing: 0.3px;
}

.table-light th {
  background: #eeece8;
  color: #374151;
}

.table-dark th {
  background: #1c2333;
  color: white;
}

.table td {
  padding: 9px 10px;
  border-bottom: 1px solid #dedad4;
  color: #374151;
  vertical-align: middle;
}

.table tr:last-child td {
  border-bottom: none;
}

.table tr:hover td {
  background: #faf9f7;
}

.table-secondary td {
  background: #eeece8;
  font-weight: 600;
}

.table tfoot th {
  background: #eeece8;
  color: #374151;
  padding: 10px 12px;
  font-size: 13px;
}

.table-bordered {
  border: 1px solid #dedad4;
  border-radius: 10px;
  overflow: hidden;
}

.table-bordered td,
.table-bordered th {
  border: 1px solid #dedad4;
}

.table-striped tbody tr:nth-child(even) td {
  background: #faf9f7;
}

/* inputs inside table */
.form-control {
  width: 100%;
  padding: 7px 9px;
  border: 1.5px solid #dedad4;
  border-radius: 7px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  background: #faf9f7;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.12s;
}

.form-control:focus {
  border-color: #1c2333;
  background: white;
}

/* ─── Evaluaciones parciales ─── */
.evaluaciones-parciales {
  margin-bottom: 32px;
}

.evaluaciones-parciales > h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  padding-left: 12px;
  border-left: 3px solid #1c2333;
}

.instruccion {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 20px;
  font-style: italic;
}

.parcial-section {
  margin-bottom: 28px;
}

.parcial-section h4 {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 12px;
  padding: 8px 14px;
  background: #eeece8;
  border-radius: 8px;
  border-left: 3px solid #1c2333;
  display: inline-block;
}

.mb-4 {
  margin-bottom: 24px;
}

/* total porcentaje indicator */
.total-porcentaje {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.total-porcentaje.error {
  background: #fff8f0;
  color: #c2410c;
  border-color: #fed7aa;
}

.text-danger {
  color: #c2410c;
  font-size: 12px;
}

/* ─── Buttons inside table ─── */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-weight: 600;
  transition: all 0.12s;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.btn-danger {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

.btn-danger:hover {
  background: #fed7aa;
}

.btn-primary.btn-sm {
  background: #1c2333;
  color: white;
}

.btn-primary.btn-sm:hover {
  background: #263045;
}

/* ─── Bibliografía ─── */
.bibliografia-section {
  margin-bottom: 8px;
}

.bibliografia-section h3 {
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 12px;
}

.mt-4 {
  margin-top: 24px;
}

.text-end {
  text-align: right;
}

/* ─── Observaciones jefe ─── */
.observaciones-section h2 {
  color: #92400e !important;
  border-left-color: #f59e0b !important;
}

.observaciones-box {
  background: #fef9ee;
  border: 1px solid #fbd5a5;
  border-left: 4px solid #f59e0b;
  padding: 14px 16px;
  border-radius: 10px;
  color: #92400e;
  font-size: 14px;
  line-height: 1.6;
}

/* ─── Bottom actions ─── */
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 28px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 12px 24px;
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
  padding: 12px 24px;
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

.btn-secondary:hover:not(:disabled) {
  border-color: #1c2333;
  color: #1a1a1a;
  background: #e5e3de;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ─── Mensaje feedback ─── */
.mensaje {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 10px;
  margin-top: 18px;
  font-size: 13.5px;
  font-weight: 500;
}

.mensaje.success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.mensaje.error {
  background: #fff8f0;
  color: #c2410c;
  border: 1px solid #fed7aa;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .info-readonly {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .documento-form {
    padding: 18px;
  }

  .table {
    font-size: 12px;
  }
}
</style>
