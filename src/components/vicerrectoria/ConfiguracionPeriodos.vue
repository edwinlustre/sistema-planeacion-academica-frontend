<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Configuración de Periodos Escolares</h1>
    </div>

    <div class="info-box">
      <p><strong>Información:</strong></p>
      <p>Configura las fechas de evaluación para cada periodo escolar. Estas fechas se mostrarán automáticamente a los
        profesores al crear sus planeaciones académicas.</p>
      <p><strong>Nota:</strong> Solo puede haber un periodo activo a la vez.</p>
    </div>

    <!-- Lista de periodos -->
    <div class="periodos-grid">
      <div v-for="periodo in periodos" :key="periodo.id" :class="['periodo-card', { 'activo': periodo.activo }]">
        <div class="periodo-header">
          <h2>{{ periodo.periodo_escolar }}</h2>
          <span v-if="periodo.activo" class="badge-activo">Activo</span>
          <span v-else class="badge-inactivo">Inactivo</span>
        </div>

        <div class="periodo-fechas">
          <div class="fecha-item">
            <strong>1er Parcial:</strong>
            <span>{{ periodo.parcial1_texto }}</span>
          </div>
          <div class="fecha-item">
            <strong>2do Parcial:</strong>
            <span>{{ periodo.parcial2_texto }}</span>
          </div>
          <div class="fecha-item">
            <strong>3er Parcial:</strong>
            <span>{{ periodo.parcial3_texto }}</span>
          </div>
          <div class="fecha-item ordinario">
            <strong>Ordinario:</strong>
            <span>{{ periodo.ordinario_texto }}</span>
          </div>
        </div>

        <div class="periodo-acciones">
          <button @click="editarPeriodo(periodo)" class="btn-secondary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Editar
          </button>
          <button v-if="!periodo.activo" @click="activarPeriodo(periodo)" class="btn-success">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="10 8 16 12 10 16"/>
            </svg>
            Activar
          </button>
          <button v-if="periodo.activo" @click="desactivarPeriodo(periodo)" class="btn-warning">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="10" y1="15" x2="10" y2="9"/><line x1="14" y1="15" x2="14" y2="9"/>
            </svg>
            Desactivar
          </button>
          <button @click="eliminarPeriodo(periodo)" class="btn-danger">
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

    <!-- Empty state -->
    <div v-if="periodos.length === 0 && !cargando" class="empty-state">
      <div class="empty-icon">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/>
        </svg>
      </div>
      <h3>No hay periodos configurados</h3>
      <p>Crea el primer periodo escolar para que los profesores puedan ver las fechas de evaluación</p>
      <button @click="mostrarModal = true" class="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Crear Primer Periodo
      </button>
    </div>

    <!-- Loading -->
    <div v-if="cargando" class="loading">
      <div class="spinner"></div>
      <p>Cargando periodos...</p>
    </div>

    <!-- Modal Crear/Editar Periodo -->
    <div v-if="mostrarModal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-custom">
        <div class="modal-header">
          <h2>{{ periodoForm.id ? 'Editar' : 'Nuevo' }} Periodo Escolar</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarPeriodo" class="modal-body">
          <div class="form-group">
            <label>Periodo Escolar *</label>
            <input v-model="periodoForm.periodo_escolar" type="text" required placeholder="Ej: 2026-B, 2027-A"
              pattern="[0-9]{4}-[A-B]" title="Formato: YYYY-A o YYYY-B" />
            <small>Formato: Año-Semestre (Ejemplo: 2026-1 para el primer semestre de 2026)</small>
          </div>

          <div class="fechas-section">
            <h3>Fechas de Evaluaciones Parciales</h3>

            <!-- Parcial 1 -->
            <div class="fecha-group">
              <h4>1er Parcial</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Fecha Inicio *</label>
                  <input v-model="periodoForm.parcial1_inicio" type="date" required />
                </div>
                <div class="form-group">
                  <label>Fecha Fin *</label>
                  <input v-model="periodoForm.parcial1_fin" type="date" required />
                </div>
              </div>
            </div>

            <!-- Parcial 2 -->
            <div class="fecha-group">
              <h4>2do Parcial</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Fecha Inicio *</label>
                  <input v-model="periodoForm.parcial2_inicio" type="date" required />
                </div>
                <div class="form-group">
                  <label>Fecha Fin *</label>
                  <input v-model="periodoForm.parcial2_fin" type="date" required />
                </div>
              </div>
            </div>

            <!-- Parcial 3 -->
            <div class="fecha-group">
              <h4>3er Parcial</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Fecha Inicio *</label>
                  <input v-model="periodoForm.parcial3_inicio" type="date" required />
                </div>
                <div class="form-group">
                  <label>Fecha Fin *</label>
                  <input v-model="periodoForm.parcial3_fin" type="date" required />
                </div>
              </div>
            </div>

            <!-- Ordinario -->
            <div class="fecha-group ordinario-group">
              <h4>Evaluación Ordinaria</h4>
              <div class="form-row">
                <div class="form-group">
                  <label>Fecha Inicio *</label>
                  <input v-model="periodoForm.ordinario_inicio" type="date" required />
                </div>
                <div class="form-group">
                  <label>Fecha Fin *</label>
                  <input v-model="periodoForm.ordinario_fin" type="date" required />
                </div>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="periodoForm.activo" />
              <span>Marcar como periodo activo</span>
            </label>
            <small v-if="periodoForm.activo" class="warning">
              Al activar este periodo, se desactivará automáticamente el periodo activo actual
            </small>
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="cerrarModal" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? 'Guardando...' : 'Guardar' }}
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
  name: 'ConfiguracionPeriodos',
  data() {
    return {
      periodos: [],
      mostrarModal: false,
      periodoForm: this.getEmptyForm(),
      mensaje: '',
      mensajeTipo: '',
      guardando: false,
      cargando: false
    }
  },
  mounted() {
    this.cargarPeriodos()
  },
  methods: {
    async cargarPeriodos() {
      this.cargando = true
      try {
        const response = await api.getConfiguracionPeriodos()
        this.periodos = Array.isArray(response) ? response : response.results || []
      } catch (error) {
        console.error('Error cargando periodos:', error)
        this.mostrarMensaje('Error al cargar periodos', 'error')
      } finally {
        this.cargando = false
      }
    },

    getEmptyForm() {
      return {
        periodo_escolar: '',
        parcial1_inicio: '',
        parcial1_fin: '',
        parcial2_inicio: '',
        parcial2_fin: '',
        parcial3_inicio: '',
        parcial3_fin: '',
        ordinario_inicio: '',
        ordinario_fin: '',
        activo: true
      }
    },

    editarPeriodo(periodo) {
      this.periodoForm = {
        id: periodo.id,
        periodo_escolar: periodo.periodo_escolar,
        parcial1_inicio: periodo.parcial1_inicio,
        parcial1_fin: periodo.parcial1_fin,
        parcial2_inicio: periodo.parcial2_inicio,
        parcial2_fin: periodo.parcial2_fin,
        parcial3_inicio: periodo.parcial3_inicio,
        parcial3_fin: periodo.parcial3_fin,
        ordinario_inicio: periodo.ordinario_inicio,
        ordinario_fin: periodo.ordinario_fin,
        activo: periodo.activo
      }
      this.mostrarModal = true
    },

    async guardarPeriodo() {
      this.guardando = true
      this.mensaje = ''

      try {
        if (this.periodoForm.id) {
          await api.updateConfiguracionPeriodo(this.periodoForm.id, this.periodoForm)
          this.mostrarMensaje('Periodo actualizado correctamente', 'success')
        } else {
          await api.createConfiguracionPeriodo(this.periodoForm)
          this.mostrarMensaje('Periodo creado correctamente', 'success')
        }

        await this.cargarPeriodos()
        setTimeout(() => this.cerrarModal(), 1500)
      } catch (error) {
        console.error('Error guardando periodo:', error)
        const errorMsg = error.response?.data?.detail ||
          error.response?.data?.non_field_errors?.[0] ||
          'Error al guardar periodo'
        this.mostrarMensaje(errorMsg, 'error')
      } finally {
        this.guardando = false
      }
    },

    async activarPeriodo(periodo) {
      if (!confirm(`¿Activar el periodo ${periodo.periodo_escolar}?\n\nSe desactivará el periodo activo actual.`)) {
        return
      }

      try {
        await api.updateConfiguracionPeriodo(periodo.id, { activo: true })
        this.mostrarMensaje('Periodo activado correctamente', 'success')
        await this.cargarPeriodos()
      } catch (error) {
        console.error('Error activando periodo:', error)
        this.mostrarMensaje('Error al activar periodo', 'error')
      }
    },

    async desactivarPeriodo(periodo) {
      if (!confirm(`¿Desactivar el periodo ${periodo.periodo_escolar}?\n\nLos profesores no podrán ver estas fechas en sus planeaciones.`)) {
        return
      }

      try {
        await api.updateConfiguracionPeriodo(periodo.id, { activo: false })
        this.mostrarMensaje('Periodo desactivado correctamente', 'success')
        await this.cargarPeriodos()
      } catch (error) {
        console.error('Error desactivando periodo:', error)
        this.mostrarMensaje('Error al desactivar periodo', 'error')
      }
    },

    async eliminarPeriodo(periodo) {
      if (!confirm(`¿Eliminar el periodo ${periodo.periodo_escolar}?\n\nEsta acción no se puede deshacer.`)) {
        return
      }

      try {
        await api.deleteConfiguracionPeriodo(periodo.id)
        this.mostrarMensaje('Periodo eliminado correctamente', 'success')
        await this.cargarPeriodos()
      } catch (error) {
        console.error('Error eliminando periodo:', error)
        this.mostrarMensaje('Error al eliminar periodo', 'error')
      }
    },

    cerrarModal() {
      this.mostrarModal = false
      this.periodoForm = this.getEmptyForm()
      this.mensaje = ''
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

/* ─── Layout ─── */
.page-container {
  width: 100%;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.4px;
}

/* ─── Info box ─── */
.info-box {
  background: #eeece8;
  border-left: 3px solid #1c2333;
  padding: 16px 18px;
  border-radius: 12px;
  margin-bottom: 26px;
  border: 1px solid #dedad4;
  border-left: 3px solid #1c2333;
}

.info-box p {
  margin: 5px 0;
  font-size: 13.5px;
  color: #374151;
  line-height: 1.55;
}

/* ─── Grid ─── */
.periodos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 16px;
  margin-bottom: 26px;
}

/* ─── Periodo card ─── */
.periodo-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 22px;
  border: 1.5px solid #dedad4;
  transition: transform 0.18s, box-shadow 0.18s;
}

.periodo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.07);
}

.periodo-card.activo {
  border-color: #86efac;
  background: #f7fef9;
  box-shadow: 0 0 0 1px #bbf7d0;
}

.periodo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e5e0d8;
}

.periodo-header h2 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.5px;
}

.badge-activo {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 700;
}

.badge-inactivo {
  background: #eeece8;
  color: #9ca3af;
  border: 1px solid #dedad4;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
}

/* ─── Fechas ─── */
.periodo-fechas {
  margin-bottom: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.fecha-item {
  padding: 9px 12px;
  background: white;
  border-radius: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #eeece8;
}

.fecha-item.ordinario {
  border-color: #fbd5a5;
  background: #fef9ee;
}

.fecha-item strong {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.fecha-item span {
  font-size: 13px;
  color: #6b7280;
}

/* ─── Acciones ─── */
.periodo-acciones {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* ─── Empty / loading ─── */
.empty-state {
  text-align: center;
  padding: 70px 20px;
  background: #f7f6f3;
  border-radius: 14px;
  border: 1px solid #dedad4;
  color: #9ca3af;
}

.empty-icon {
  width: 64px;
  height: 64px;
  background: #eeece8;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  margin: 0 auto 16px;
}

.empty-state h3 {
  margin: 0 0 8px;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
}

.empty-state p {
  margin: 0 0 20px;
  font-size: 13.5px;
  color: #9ca3af;
}

.loading {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 3px solid #eeece8;
  border-top: 3px solid #1c2333;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 0.85s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.18);
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

/* ─── Secciones del form ─── */
.fechas-section {
  background: #f7f6f3;
  border: 1px solid #dedad4;
  padding: 18px;
  border-radius: 12px;
  margin: 18px 0;
}

.fechas-section h3 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 700;
  color: #1a1a1a;
}

.fecha-group {
  background: white;
  padding: 14px;
  border-radius: 10px;
  margin-bottom: 12px;
  border: 1px solid #e5e0d8;
}

.fecha-group h4 {
  margin: 0 0 12px 0;
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.ordinario-group {
  border: 1.5px solid #fbd5a5;
  background: #fef9ee;
}

/* ─── Form ─── */
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

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

.form-group input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f7f6f3;
  color: #1a1a1a;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}

.form-group input:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #9ca3af;
}

.form-group small.warning {
  color: #92400e;
  background: #fef9ee;
  padding: 7px 10px;
  border-radius: 7px;
  margin-top: 8px;
  border: 1px solid #fbd5a5;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 13.5px;
  color: #374151;
  font-weight: 500;
}

.checkbox-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1c2333;
}

/* ─── Mensaje ─── */
.mensaje {
  padding: 11px 14px;
  border-radius: 10px;
  margin-bottom: 14px;
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

/* ─── Botones ─── */
.btn-primary,
.btn-secondary,
.btn-success,
.btn-warning,
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(28, 35, 51, 0.22);
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

.btn-secondary:hover {
  background: #e2e0db;
}

.btn-success {
  background: #f0fdf4;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.btn-success:hover {
  background: #dcfce7;
  border-color: #86efac;
}

.btn-warning {
  background: #fef9ee;
  color: #d97706;
  border: 1px solid #fbd5a5;
}

.btn-warning:hover {
  background: #fef3c7;
  border-color: #fcd34d;
}

.btn-danger {
  background: #fff1f2;
  color: #9f1239;
  border: 1px solid #fecdd3;
}

.btn-danger:hover {
  background: #ffe4e6;
  border-color: #fca5a5;
}

@media (max-width: 768px) {
  .periodos-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .periodo-acciones {
    flex-direction: column;
  }

  .periodo-acciones button {
    width: 100%;
  }
}
</style>