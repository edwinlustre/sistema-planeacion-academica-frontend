<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Avance Programático — {{ getNombreAvance() }}</h1>
      <button @click="$router.back()" class="btn-secondary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Volver
      </button>
    </div>

    <!-- Banner modo solo lectura -->
    <div v-if="modoLectura" class="alert-lectura">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <p>Este avance está <strong>{{ form.estado === 'ENVIADO' ? 'en revisión' : 'aprobado' }}</strong> y no puede ser modificado.</p>
    </div>

    <!-- Banner con observaciones de jefatura -->
    <div v-if="form?.estado === 'CON_OBSERVACIONES'" class="alert-rechazo">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-rechazo-icon">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      <div>
        <strong>Avance con observaciones de jefatura de carrera</strong>
        <p>{{ form.observaciones_jefe }}</p>
      </div>
    </div>

    <!-- Banner historial importable -->
    <div v-if="historial.tiene && !avance.id" class="banner-historial">
      <div class="banner-historial-header" @click="historial.expandido = !historial.expandido">
        <div class="banner-historial-texto">
          <div class="banner-historial-icono">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div>
            <strong>Tienes historial de avances anteriores</strong>
            <p>Encontramos avances de esta materia en periodos previos. Puedes importar uno como punto de partida.</p>
          </div>
        </div>
        <span class="banner-historial-toggle">{{ historial.expandido ? 'Ocultar' : 'Ver historial' }}</span>
      </div>

      <div v-if="historial.expandido" class="banner-historial-lista">
        <div
          v-for="item in historial.items"
          :key="item.id"
          class="historial-opcion"
          :class="{ 'historial-opcion-seleccionada': historial.seleccionadoId === item.id }"
          @click="historial.seleccionadoId = item.id"
        >
          <div class="historial-opcion-meta">
            <span class="historial-periodo">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              Periodo {{ item.periodo_escolar }}
            </span>
            <span class="historial-estado-badge" :class="'estado-' + item.estado.toLowerCase()">{{ item.estado }}</span>
          </div>
          <p class="historial-objetivo" v-if="item.objetivo_general">
            {{ item.objetivo_general.slice(0, 120) }}{{ item.objetivo_general.length > 120 ? '...' : '' }}
          </p>
        </div>

        <div class="historial-acciones" v-if="historial.seleccionadoId">
          <button type="button" class="btn-importar" @click="importarHistorial">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Importar este avance
          </button>
          <button type="button" class="btn-cancelar-import" @click="historial.seleccionadoId = null">
            Cancelar
          </button>
        </div>
      </div>
    </div>

    <form @submit.prevent="guardar" @keydown.enter="evitarEnter" class="avance-form">

      <!-- Avance por Unidades -->
      <div class="form-section">
        <h2>Avance por Unidades</h2>

        <!-- Leyenda visual -->
        <div class="leyenda-cobertura">
          <span class="leyenda-item">
            <span class="leyenda-dot leyenda-cubierto"></span> Tema cubierto (resaltado en PDF)
          </span>
          <span class="leyenda-item">
            <span class="leyenda-dot leyenda-no-cubierto"></span> Tema no cubierto
          </span>
        </div>

        <div
          v-for="(unidad, index) in avance.avance_unidades"
          :key="index"
          class="unidad-item"
          :class="{ 'unidad-cubierta': unidad.cubierto }"
        >
          <div class="unidad-header">
            <h3>Unidad {{ unidad.unidad }}</h3>

            <label
              class="toggle-cubierto"
              :class="{ 'toggle-cubierto-activo': unidad.cubierto, disabled: modoLectura }"
            >
              <input
                type="checkbox"
                :checked="unidad.cubierto"
                disabled
                style="display:none"
              />
              <svg v-if="unidad.cubierto" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9"/>
              </svg>
              <span>{{ unidad.cubierto ? 'Tema cubierto' : 'Tema no cubierto' }}</span>
            </label>
          </div>

          <div class="unidad-container">
            <div class="unidad-titulo-banner">
              <h4>{{ unidad.titulo_principal }}</h4>
            </div>

            <div class="subtemas-grid-indentado">
              <div v-for="(st, sIdx) in unidad.subtemas_seguimiento" :key="sIdx" class="subtema-card-mini">
                <label class="check-container">
                  <input type="checkbox" v-model="st.visto" @change="calcularPorcentaje(unidad)" :disabled="modoLectura" />
                  <span class="checkmark"></span>
                  <span class="subtema-texto">{{ st.texto }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Horas Planeadas</label>
              <input v-model.number="unidad.horas_planeadas" type="number" :disabled="modoLectura" required min="0"
                @input="calcularPorcentaje(unidad)" />
            </div>

            <div class="form-group">
              <label>Horas Impartidas</label>
              <input
                v-model.number="unidad.horas_impartidas"
                type="number"
                :disabled="modoLectura"
                required
                min="0"
                :max="unidad.horas_planeadas || 0"
                @input="calcularPorcentaje(unidad)"
              />
              <p v-if="unidad.horas_impartidas > unidad.horas_planeadas" class="aviso-exceso">
                No puede superar las horas planeadas
              </p>
            </div>

            <div class="form-group">
              <label>% Avance</label>
              <input :value="calcularPorcentaje(unidad)" type="number" disabled class="readonly" />
            </div>
          </div>

          <div class="form-group">
            <label class="label-observaciones">
              Observaciones
              <span
                v-if="esOrdinario && !unidad.cubierto"
                class="badge-obligatorio"
              >
                Obligatorio cuando el tema no está cubierto
              </span>
            </label>
            <textarea
              v-model="unidad.observaciones"
              rows="2"
              :disabled="modoLectura"
              :class="{
                'obs-requerida': esOrdinario && !unidad.cubierto && !unidad.observaciones?.trim()
              }"
              :placeholder="esOrdinario && !unidad.cubierto
                ? 'Describa las causas por las cuales el tema no está cubierto.'
                : 'Observaciones opcionales...'"
            ></textarea>
          </div>
        </div>

        <!-- Indicador global de cobertura -->
        <div class="resumen-cobertura" v-if="avance.avance_unidades.length">
          <span class="resumen-texto">
            <strong>{{ unidadesCubiertas }}</strong> de
            <strong>{{ avance.avance_unidades.length }}</strong> temas marcados como cubiertos
          </span>
          <div class="barra-cobertura">
            <div class="barra-fill" :style="{ width: porcentajeCobertura + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Estrategias Didácticas -->
      <div class="form-section">
        <h2>Estrategias Didácticas Empleadas</h2>

        <div class="checkbox-grid">
          <label v-for="estrategia in estrategiasDisponibles" :key="estrategia">
            <input type="checkbox" :value="estrategia" v-model="avance.estrategias_didacticas" :disabled="modoLectura" />
            {{ estrategia }}
          </label>
        </div>

        <div class="form-group">
          <label>Otras Estrategias</label>
          <input v-model="avance.otras_estrategias" type="text" :disabled="modoLectura" />
        </div>
      </div>

      <!-- Material Didáctico -->
      <div class="form-section">
        <h2>Material Didáctico</h2>

        <h3>Material Empleado</h3>
        <div class="checkbox-grid">
          <label v-for="material in materialesDisponibles" :key="material">
            <input type="checkbox" :value="material" v-model="avance.material_empleado" :disabled="modoLectura" />
            {{ material }}
          </label>
        </div>

        <h3>Material Generado por el Docente</h3>
        <div class="checkbox-grid">
          <label v-for="material in materialesGenerados" :key="material">
            <input type="checkbox" :value="material" v-model="avance.material_generado" :disabled="modoLectura" />
            {{ material }}
          </label>
        </div>

        <div class="form-group">
          <label>Otros Materiales</label>
          <input v-model="avance.otros_materiales" type="text" :disabled="modoLectura" />
        </div>
      </div>

      <!-- Incidencias -->
      <div class="form-section">
        <h2>Incidencias y Ajustes Académicos</h2>
        <div class="form-group">
          <label>Describir incidencias relevantes</label>
          <textarea
            v-model="avance.incidencias"
            rows="4"
            placeholder="Suspensión de clases, ajustes en la planeación, etc."
            :disabled="modoLectura"
          ></textarea>
        </div>
      </div>

      <!-- Advertencia ordinario con unidades incompletas -->
      <div v-if="esOrdinario && hayUnidadesSinObservacion" class="alerta-obs-faltantes">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
          <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span><strong>Atención:</strong> Hay unidades que no están cubiertas y no tienen observaciones.
        En el avance Ordinario las observaciones son <strong>obligatorias</strong> cuando un tema no está cubierto.</span>
      </div>

      <div class="form-section notification-area">
        <h3>📢 Notificar a otras Jefaturas (Para conocimiento)</h3>
        <p class="helper-text">Selecciona las carreras que comparten esta materia para que sus jefes estén informados del avance.</p>
        
        <div class="jefaturas-selector-grid">
          <label v-for="carrera in carrerasParaNotificar" :key="carrera.id" class="chip-checkbox">
            <input 
              type="checkbox" 
              :value="carrera.id" 
              v-model="form.jefaturas_notificadas"
              :disabled="modoLectura"
            />
            <span>{{ carrera.nombre }}</span>
          </label>
        </div>
      </div>

      <!-- Botones de acción -->
      <div v-if="!modoLectura" class="form-actions">
        <button type="button" @click="guardarBorrador" class="btn-secondary" :disabled="guardando">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Guardar Borrador
        </button>
        <button
          type="submit"
          class="btn-primary"
          :disabled="guardando || (esOrdinario && hayUnidadesSinObservacion)"
          :title="esOrdinario && hayUnidadesSinObservacion ? 'Completa las observaciones obligatorias antes de enviar' : ''"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
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

const createEmptyAvance = () => ({
  planeacion: null,
  numero_avance: 1,
  avance_unidades: [],
  estrategias_didacticas: [],
  otras_estrategias: '',
  material_empleado: [],
  material_generado: [],
  otros_materiales: '',
  incidencias: ''
})

export default {
  name: 'CrearAvance',
  data() {
    return {
      todasLasCarreras: [],
      planeacionData: null,
      avance: createEmptyAvance(),
      form: {
        estado: '',
        observaciones_jefe: '',
        jefaturas_notificadas: []
      },
      historial: {
        tiene: false,
        expandido: false,
        items: [],
        seleccionadoId: null
      },
      estrategiasDisponibles: [
        'Clase expositiva',
        'Análisis y discusión de lecturas',
        'Ejercicios prácticos',
        'Estudio de casos',
        'Aprendizaje basado en proyectos',
        'Exposiciones orales',
        'Trabajo colaborativo',
        'Investigación'
      ],
      materialesDisponibles: [
        'Presentaciones digitales',
        'Lecturas académicas',
        'Videos educativos',
        'Plataforma institucional',
        'Recursos digitales',
        'Software especializado'
      ],
      materialesGenerados: [
        'Guías didácticas',
        'Rúbricas',
        'Estudios de caso',
        'Ejercicios',
        'Material de apoyo',
        'Instrumentos de evaluación'
      ],
      mensaje: '',
      mensajeTipo: '',
      guardando: false
    }
  },

  async mounted() {
    this.cargarCarreras();
    try {
      const planeacionId = this.$route.params.planeacionId
      const avanceId     = this.$route.query.avanceId
      const numero       = Number(this.$route.query.numero)

      this.avance.planeacion = parseInt(planeacionId)

      if (avanceId) {
        const resp = await api.getAvance(avanceId)
        this.form = { ...this.form, ...resp }
        await this.cargarAvanceExistente(avanceId)
        this.validarModoLectura()
      }
      else {
        if (!numero) {
          console.error('Numero de avance no recibido')
          return
        }
        await this.cargarDatos(planeacionId, numero)
        await this.cargarHistorial(planeacionId)
      }

    } catch (error) {
      console.error('Error en mounted:', error)
    }
  },

  computed: {
    carrerasParaNotificar() {
      const nombrePropio = this.planeacionData?.carrera_nombre
      if (!nombrePropio) return this.todasLasCarreras
      return this.todasLasCarreras.filter(c => c.nombre !== nombrePropio)
    },

    modoLectura() {
      const modoQuery = this.$route.query.modo
      const estadosNoEditables = ['ENVIADO', 'APROBADO', 'APROBADA']
      return modoQuery === 'ver' || estadosNoEditables.includes(this.form.estado)
    },

    esOrdinario() {
      return this.avance.numero_avance === 4
    },

    hayUnidadesSinObservacion() {
      if (!this.esOrdinario) return false
      return this.avance.avance_unidades.some(u => !u.cubierto && !(u.observaciones || '').trim())
    },

    unidadesCubiertas() {
      return this.avance.avance_unidades.filter(u => u.cubierto).length
    },
    porcentajeCobertura() {
      const total = this.avance.avance_unidades.length
      if (!total) return 0
      return Math.round((this.unidadesCubiertas / total) * 100)
    }
  },

  watch: {
    '$route.query'() {
      if (this.$route.query.avanceId) {
        this.validarModoLectura()
      }
    },
    'form.estado'() {
      this.validarModoLectura()
    }
  },

  methods: {
    getAvanceInicial() {
      return createEmptyAvance()
    },

    normalizarListaSeleccionable(lista) {
      if (!Array.isArray(lista)) return []
      return [...new Set(lista.filter(Boolean).map(item => String(item).trim()).filter(Boolean))]
    },

    async cargarCarreras() {
      this.todasLasCarreras = await api.getCarreras()
    },

    // CrearAvance.vue
    construirUnidadesBase(planeacion) {
      return (planeacion.contenidos || []).map(c => {
        // Dividimos el contenido por saltos de línea[cite: 48]
        const lineas = (c.tema || '').split('\n').filter(linea => linea.trim() !== '');
        
        // El primer renglón es el título principal de la unidad
        const tituloUnidad = lineas[0] || `Unidad ${c.unidad}`;
        
        // El resto de los renglones se convierten en la lista de seguimiento individual
        const subtemasSeguimiento = lineas.slice(1).map(s => ({
          texto: s.trim(),
          visto: false // Este es el check que guardaremos en la BD
        }));

        return {
          unidad: c.unidad,
          titulo_principal: tituloUnidad, // Nuevo campo para el encabezado[cite: 48]
          subtemas_seguimiento: subtemasSeguimiento,
          horas_planeadas: c.horas_planeadas,
          horas_impartidas: 0,
          porcentaje_avance: 0,
          observaciones: '',
          cubierto: false
        };
      });
    },

    combinarUnidadesConAnterior(unidadesBase, avanceAnterior) {
      if (!avanceAnterior?.avance_unidades?.length) return unidadesBase

      const anterioresPorUnidad = new Map(
        avanceAnterior.avance_unidades.map(unidad => [String(unidad.unidad), unidad])
      )

      return unidadesBase.map(unidadBase => {
        const anterior = anterioresPorUnidad.get(String(unidadBase.unidad))
        if (!anterior) return unidadBase

        return {
          ...unidadBase,
          tema: anterior.tema || unidadBase.tema,
          subtemas_seguimiento: anterior.subtemas_seguimiento || unidadBase.subtemas_seguimiento,
          horas_planeadas: anterior.horas_planeadas ?? unidadBase.horas_planeadas,
          horas_impartidas: anterior.horas_impartidas ?? 0,
          porcentaje_avance: anterior.porcentaje_avance ?? 0,
          observaciones: anterior.observaciones || '',
          cubierto: anterior.cubierto ?? false
        }
      })
    },

    aplicarDatosArrastrados(avanceAnterior = null) {
      this.avance.material_empleado = this.normalizarListaSeleccionable(
        avanceAnterior?.material_empleado || []
      )
      this.avance.material_generado = this.normalizarListaSeleccionable(
        avanceAnterior?.material_generado || []
      )
      this.avance.otros_materiales = avanceAnterior?.otros_materiales || ''
    },

    async cargarDatos(planeacionId, numero) {
      try {
        const planeacion = await api.getPlaneacion(planeacionId)
        this.planeacionData = planeacion
        const avances = await api.getAvancesPorPlaneacion(planeacionId)
        const unidadesBase = this.construirUnidadesBase(planeacion)

        const avanceAnterior = avances.find(a => a.numero_avance === numero - 1)

        this.avance = {
          ...this.getAvanceInicial(),
          planeacion: Number(planeacionId),
          numero_avance: numero,
          avance_unidades: this.combinarUnidadesConAnterior(unidadesBase, avanceAnterior)
        }

        // Calcular porcentajes y cubiertos iniciales
        this.avance.avance_unidades.forEach(unidad => this.calcularPorcentaje(unidad))
      } catch (error) {
        console.error('Error al cargar datos:', error)
      }
    },

    async cargarAvanceExistente(id) {
      try {
        const data = await api.getAvance(id)
        this.planeacionData = await api.getPlaneacion(data.planeacion)
        if (data.avance_unidades) {
          data.avance_unidades = data.avance_unidades.map(u => ({
            ...u,
            cubierto: u.cubierto ?? false
          }))
        }
        data.estrategias_didacticas = this.normalizarListaSeleccionable(data.estrategias_didacticas)
        data.material_empleado = this.normalizarListaSeleccionable(data.material_empleado)
        data.material_generado = this.normalizarListaSeleccionable(data.material_generado)
        this.avance = data

        // Calcular porcentajes y cubiertos
        this.avance.avance_unidades.forEach(unidad => this.calcularPorcentaje(unidad))
      } catch (error) {
        console.error('Error cargando avance existente:', error)
      }
    },

    async cargarHistorial(planeacionId) {
      try {
        const planeacion = await api.getPlaneacion(planeacionId)
        const periodo    = planeacion.periodo_escolar

        const resp = await api.axiosInstance.get(
          `/planeaciones/historial-importable/`,
          { params: { materia_id: planeacion.asignacion, periodo_actual: periodo } }
        )
        const data = resp.data
        this.historial.tiene = data.tiene_historial
        this.historial.items = data.planeaciones || []
      } catch (e) {
        this.historial.tiene = false
      }
    },

    importarHistorial() {
      const item = this.historial.items.find(i => i.id === this.historial.seleccionadoId)
      if (!item) return

      const contenidos = item.contenidos || []
      this.avance.avance_unidades = contenidos.map(c => ({
        unidad: c.unidad,
        tema: c.tema,
        horas_planeadas: c.horas_planeadas,
        horas_impartidas: 0,
        porcentaje_avance: 0,
        observaciones: '',
        cubierto: false
      }))

      this.historial.expandido = false
      this.historial.seleccionadoId = null
      this.mostrarMensaje('Datos importados del historial. Puedes editarlos antes de enviar.', 'success')
    },

    actualizarCoberturaUnidad(unidad) {
      const horasPlaneadas = Number(unidad.horas_planeadas) || 0
      const horasImpartidas = Number(unidad.horas_impartidas) || 0
      unidad.cubierto = horasPlaneadas > 0 && horasImpartidas === horasPlaneadas
      return unidad.cubierto
    },

    normalizarEntero(valor) {
      const numero = Number(valor)
      if (!Number.isFinite(numero) || numero < 0) return 0
      return Math.trunc(numero)
    },

    normalizarAvanceParaGuardar() {
      const avanceNormalizado = {
        ...this.avance,
        avance_unidades: (this.avance.avance_unidades || []).map(unidad => {
          // Calcular porcentaje de horas
          const horasPlaneadas = Number(unidad.horas_planeadas) || 0
          const horasImpartidas = Number(unidad.horas_impartidas) || 0
          const porcentajeHoras = horasPlaneadas > 0 
            ? Math.min(100, Math.round((horasImpartidas / horasPlaneadas) * 100)) 
            : 0

          // Cubierto basado en subtemas
          const subtemas = unidad.subtemas_seguimiento || []
          const cubierto = subtemas.length > 0 && subtemas.every(st => st.visto)

          return {
            ...unidad,
            porcentaje_avance: porcentajeHoras,
            cubierto: cubierto,
            horas_impartidas: this.normalizarEntero(unidad.horas_impartidas)
          };
        }),
        // ... resto de la normalización
      };
      return avanceNormalizado;
    },

    evitarEnter(e) {
      if (e.target.tagName !== 'TEXTAREA') {
        e.preventDefault()
      }
    },

    calcularPorcentaje(unidad) {
      // Calcular porcentaje basado en horas
      const horasPlaneadas = Number(unidad.horas_planeadas) || 0
      const horasImpartidas = Number(unidad.horas_impartidas) || 0
      const porcentaje = horasPlaneadas > 0 
        ? Math.min(100, Math.round((horasImpartidas / horasPlaneadas) * 100)) 
        : 0
      
      unidad.porcentaje_avance = porcentaje

      // Actualizar cubierto basado en subtemas
      const subtemas = unidad.subtemas_seguimiento || []
      unidad.cubierto = subtemas.length > 0 && subtemas.every(st => st.visto)
      
      return porcentaje
    },

    // Este método ya no es necesario que valide horas para el estado "cubierto"[cite: 50]
    actualizarCoberturaUnidad(unidad) {
      // Lo dejamos vacío o lo eliminamos, ya que ahora calcularPorcentaje 
      // es quien manda sobre el estado 'cubierto' basándose en los checks[cite: 50]
      return unidad.cubierto;
    },

    getNombreAvance() {
      const nombres = { 1: 'Parcial 1', 2: 'Parcial 2', 3: 'Parcial 3', 4: 'Ordinario' }
      return nombres[this.avance.numero_avance] || `Avance ${this.avance.numero_avance}`
    },

    async guardarBorrador() {
      this.guardando = true
      try {
        const payload = this.normalizarAvanceParaGuardar()
        if (this.avance.id) {
          await api.updateAvance(this.avance.id, payload)
        } else {
          const nuevo = await api.createAvance(payload)
          this.avance.id = nuevo.id
        }
        this.mostrarMensaje('Borrador guardado correctamente', 'success')
      } catch (error) {
        this.mostrarMensaje('Error al guardar el borrador', 'error')
      } finally {
        this.guardando = false
      }
    },

    async guardar() {
      if (this.esOrdinario && this.hayUnidadesSinObservacion) {
        this.mostrarMensaje(
          'Completa las observaciones en todas las unidades que no están cubiertas antes de enviar.',
          'error'
        )
        return
      }

      this.guardando = true
      try {
        const payload = this.normalizarAvanceParaGuardar()
        let avanceId = this.avance.id

        if (avanceId) {
          await api.updateAvance(avanceId, payload)
        } else {
          const result = await api.createAvance(payload)
          avanceId = result.id
        }

        await api.enviarAvance(avanceId)
        this.mostrarMensaje('Avance enviado para revisión', 'success')

        setTimeout(() => {
          this.$router.push('/mis-planeaciones')
        }, 2000)
      } catch (error) {
        const detail =
          error?.response?.data?.non_field_errors?.[0] ||
          error?.response?.data?.detail ||
          'Error al enviar el avance'
        this.mostrarMensaje(detail, 'error')
      } finally {
        this.guardando = false
      }
    },

    mostrarMensaje(texto, tipo) {
      this.mensaje = texto
      this.mensajeTipo = tipo
      setTimeout(() => { this.mensaje = '' }, 5500)
    },

    validarModoLectura() {
      const modoQuery = this.$route.query.modo
      const estadosNoEditables = ['ENVIADO', 'APROBADO', 'APROBADA']
      const debeSerModoLectura = estadosNoEditables.includes(this.form.estado)

      if (debeSerModoLectura && modoQuery !== 'ver') {
        this.$router.replace({
          path: this.$route.path,
          query: { ...this.$route.query, modo: 'ver' }
        })
      } else if (!debeSerModoLectura && modoQuery === 'ver') {
        const query = { ...this.$route.query }
        delete query.modo
        this.$router.replace({ path: this.$route.path, query })
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
  align-items: center;
  margin-bottom: 24px;
  gap: 16px;
}

.page-header h1 {
  font-size: clamp(17px, 2.2vw, 24px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.4px;
}

/* ─── Alertas ─── */
.alert-lectura {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #eeece8;
  border: 1px solid #dedad4;
  border-left: 4px solid #1c2333;
  padding: 14px 18px;
  border-radius: 10px;
  margin-bottom: 20px;
  color: #374151;
  font-size: 14px;
}

.alert-rechazo {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  background: #fef9ee;
  border: 1px solid #fbd5a5;
  border-left: 4px solid #f59e0b;
  padding: 16px 18px;
  border-radius: 12px;
  margin-bottom: 22px;
  color: #92400e;
}

.alert-rechazo-icon { flex-shrink: 0; margin-top: 2px; }
.alert-rechazo strong { font-size: 14px; font-weight: 700; display: block; margin-bottom: 5px; }
.alert-rechazo p { margin: 0; font-size: 13.5px; }

/* ─── Banner historial — paleta del sistema ─── */
.banner-historial {
  background: #f7f6f3;
  border: 1.5px solid #dedad4;
  border-radius: 12px;
  margin-bottom: 22px;
  overflow: hidden;
}

.banner-historial-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s;
}

.banner-historial-header:hover { background: #eeece8; }

.banner-historial-texto {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.banner-historial-icono {
  width: 36px;
  height: 36px;
  background: #1c2333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.banner-historial-texto strong {
  display: block;
  font-size: 14px;
  color: #1a1a1a;
  margin-bottom: 2px;
}

.banner-historial-texto p {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.banner-historial-toggle {
  font-size: 12.5px;
  font-weight: 700;
  color: #374151;
  white-space: nowrap;
  background: #eeece8;
  border: 1.5px solid #dedad4;
  border-radius: 8px;
  padding: 5px 12px;
  cursor: pointer;
  flex-shrink: 0;
}

.banner-historial-lista {
  border-top: 1px solid #dedad4;
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.historial-opcion {
  background: white;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  padding: 12px 14px;
  cursor: pointer;
  transition: border-color 0.14s;
}

.historial-opcion:hover { border-color: #1c2333; }
.historial-opcion-seleccionada { border-color: #1c2333; background: #f7f6f3; }

.historial-opcion-meta {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.historial-periodo {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
  font-weight: 700;
  color: #1a1a1a;
}

.historial-estado-badge {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 100px;
}
.estado-aprobada, .estado-aprobado { background: #f0fdf4; color: #15803d; }
.estado-enviada, .estado-enviado   { background: #fef9ee; color: #d97706; }
.estado-borrador                   { background: #eeece8; color: #6b7280; }
.estado-con_observaciones          { background: #fff8f0; color: #c2410c; }

.historial-objetivo {
  font-size: 12.5px;
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.historial-acciones {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding-top: 4px;
}

.btn-importar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: #1c2333;
  color: white;
  border: none;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.12s;
}
.btn-importar:hover { background: #263045; }

.btn-cancelar-import {
  padding: 9px 16px;
  background: none;
  color: #6b7280;
  border: 1.5px solid #dedad4;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13.5px;
  font-weight: 600;
  cursor: pointer;
  transition: border-color 0.12s;
}
.btn-cancelar-import:hover { border-color: #1c2333; color: #374151; }

/* ─── Form card ─── */
.avance-form {
  background: #f7f6f3;
  padding: 32px;
  border-radius: 14px;
  border: 1px solid #dedad4;
}

.form-section {
  margin-bottom: 36px;
  padding-bottom: 28px;
  border-bottom: 1px solid #dedad4;
}

.form-section:last-of-type { border-bottom: none; }

.form-section h2 {
  color: #1a1a1a;
  margin-bottom: 14px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.3px;
  text-transform: uppercase;
  padding-left: 12px;
  border-left: 3px solid #1c2333;
}

.form-section h3 {
  font-size: 13.5px;
  font-weight: 600;
  color: #374151;
  margin: 20px 0 12px;
}

/* ─── Leyenda cobertura ─── */
.leyenda-cobertura {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  font-size: 12.5px;
  color: #6b7280;
  flex-wrap: wrap;
}

.leyenda-item { display: flex; align-items: center; gap: 7px; }

.leyenda-dot {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  border: 1.5px solid;
}

.leyenda-cubierto { background: #fef9c3; border-color: #ca8a04; }
.leyenda-no-cubierto { background: #eeece8; border-color: #dedad4; }

/* ─── Unidad item ─── */
.unidad-item {
  background: #eeece8;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1.5px solid #dedad4;
  transition: background 0.2s, border-color 0.2s;
}

.unidad-cubierta {
  background: #fefce8 !important;
  border-color: #ca8a04 !important;
}

.unidad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 10px;
}

.unidad-header h3 {
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  padding-left: 10px;
  border-left: 3px solid #1c2333;
}

/* Toggle cubierto */
.toggle-cubierto {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 13px;
  border-radius: 20px;
  border: 1.5px solid #dedad4;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  user-select: none;
  transition: all 0.15s;
}

.toggle-cubierto:hover:not(.disabled) {
  border-color: #ca8a04;
  background: #fef9c3;
  color: #854d0e;
}

.toggle-cubierto-activo {
  border-color: #ca8a04 !important;
  background: #fef9c3 !important;
  color: #854d0e !important;
}

.toggle-cubierto.disabled { opacity: 0.55; cursor: not-allowed; }

/* tema párrafo */
.tema-parrafo {
  padding: 12px 14px;
  background: #faf9f7;
  border: 1.5px solid #dedad4;
  border-radius: 9px;
  min-height: 56px;
  transition: background 0.2s, border-color 0.2s;
}

.tema-parrafo-cubierto {
  background: #fef9c3 !important;
  border-color: #ca8a04 !important;
}

.tema-texto {
  margin: 0;
  font-size: 13.5px;
  color: #1a1a1a;
  line-height: 1.6;
  white-space: pre-wrap;
}

.tema-vacio {
  margin: 0;
  font-size: 13.5px;
  color: #9ca3af;
  font-style: italic;
}

/* ─── Form groups ─── */
.form-group { margin-bottom: 16px; }

.form-group label, .label-observaciones {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
}

.form-group input,
.form-group textarea {
  width: 100%;
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
.form-group textarea:focus {
  border-color: #1c2333;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.form-group input.readonly {
  background: #eeece8;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #dedad4;
}

.obs-requerida {
  border-color: #f59e0b !important;
  background: #fffbeb !important;
}

.obs-requerida:focus {
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15) !important;
}

.badge-obligatorio {
  font-size: 11px;
  font-weight: 700;
  color: #b45309;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  padding: 2px 9px;
  border-radius: 100px;
}

.aviso-exceso {
  margin-top: 5px;
  font-size: 12px;
  color: #c2410c;
  background: #fff7ed;
  padding: 5px 10px;
  border-radius: 6px;
  border: 1px solid #fed7aa;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 14px;
}

/* ─── Barra de cobertura ─── */
.resumen-cobertura {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 6px;
  padding: 10px 0 0;
}

.resumen-texto {
  font-size: 13px;
  color: #374151;
  white-space: nowrap;
}

.barra-cobertura {
  flex: 1;
  height: 6px;
  background: #dedad4;
  border-radius: 100px;
  overflow: hidden;
}

.barra-fill {
  height: 100%;
  background: #ca8a04;
  border-radius: 100px;
  transition: width 0.3s ease;
}

/* ─── Alerta obs faltantes ─── */
.alerta-obs-faltantes {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 13px 16px;
  background: #fef9ee;
  border: 1.5px solid #fbd5a5;
  border-left: 3px solid #f59e0b;
  border-radius: 10px;
  font-size: 13.5px;
  color: #92400e;
  margin-bottom: 18px;
}

.alerta-obs-faltantes svg { flex-shrink: 0; margin-top: 1px; }

/* ─── Checkboxes ─── */
.checkbox-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
  gap: 10px;
  margin-bottom: 18px;
}

.checkbox-grid label {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 13.5px;
  color: #374151;
  cursor: pointer;
  padding: 9px 12px;
  background: #faf9f7;
  border: 1.5px solid #dedad4;
  border-radius: 8px;
  transition: border-color 0.12s, background 0.12s;
  line-height: 1.3;
}

.checkbox-grid label:hover { border-color: #1c2333; background: #eeece8; }

.checkbox-grid input[type="checkbox"] {
  width: 15px; height: 15px;
  cursor: pointer;
  accent-color: #1c2333;
  flex-shrink: 0;
}

/* ─── Acciones ─── */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
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

.btn-secondary:hover:not(:disabled) { border-color: #1c2333; color: #1a1a1a; background: #e5e3de; }
.btn-secondary:disabled { opacity: 0.5; cursor: not-allowed; }

/* ─── Mensaje ─── */
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

.mensaje.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.mensaje.error   { background: #fff8f0; color: #c2410c; border: 1px solid #fed7aa; }

/* ─── Disabled global ─── */
input:disabled,
textarea:disabled,
select:disabled {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
  border-color: #e5e7eb;
}

input[type="checkbox"]:disabled { opacity: 0.5; cursor: not-allowed; }

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .form-row { grid-template-columns: 1fr; }
  .avance-form { padding: 18px; }
  .checkbox-grid { grid-template-columns: 1fr; }
  .leyenda-cobertura { flex-direction: column; gap: 8px; }
  .resumen-cobertura { flex-direction: column; align-items: flex-start; }
  .barra-cobertura { width: 100%; }
  .banner-historial-header { flex-direction: column; align-items: flex-start; gap: 10px; }
}

/* Estilos para el efecto de indentación y tarjetitas[cite: 48] */
.unidad-container {
  margin-top: 16px;
}

.unidad-titulo-banner {
  background: #1c2333;
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.unidad-titulo-banner h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
}

.subtemas-grid-indentado {
  margin-left: 25px; /* Crea el efecto de jerarquía */
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.subtema-card-mini {
  background: #ffffff;
  border: 1px solid #dedad4;
  border-radius: 8px;
  padding: 10px 14px;
  transition: all 0.2s;
}

.subtema-card-mini:has(input:checked) {
  background: #f0fdf4; /* Verde muy tenue si está listo */
  border-color: #bbf7d0;
}

.check-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  width: 100%;
}

.check-container input[type="checkbox"] {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #dedad4;
  border-radius: 4px;
  background: white;
  position: relative;
  flex-shrink: 0;
  transition: all 0.2s;
}

.check-container input:checked + .checkmark {
  background: #1c2333;
  border-color: #1c2333;
}

.check-container input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.subtema-texto {
  font-size: 13.5px;
  color: #374151;
  line-height: 1.4;
}

</style>