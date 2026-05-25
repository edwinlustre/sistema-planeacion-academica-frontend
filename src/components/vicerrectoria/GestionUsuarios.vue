<template>
  <div class="page-container">
    <div class="page-header">
      <h1>Gestión de Usuarios</h1>
      <button @click="abrirModalNuevo" class="btn-primary">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        Nuevo Usuario
      </button>
    </div>

    <!-- Filtros -->
    <div class="filtros">
      <input v-model="busqueda" type="text" placeholder="Buscar por nombre o correo..." class="input-busqueda" />
      <select v-model="filtroRol" class="select-filtro">
        <option value="">Todos los roles</option>
        <option value="VICERRECTORIA">Vicerrectoría Academica</option>
        <option value="JEFATURA_CARRERA">Jefatura de Carrera</option>
        <option value="PROFESOR">Profesor/Profesora</option>
      </select>
    </div>

    <!-- Tabla de usuarios -->
    <div class="tabla-container">
      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Correo Institucional</th>
            <th>Rol</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="usuario in usuariosFiltrados" :key="usuario.id">
            <td>{{ usuario.nombre_completo || '-' }}</td>
            <td>{{ usuario.correo_institucional || '-' }}</td>
            <td>
              <span :class="['badge-rol', getRolClass(usuario.rol)]">
                {{ getRolNombre(usuario.rol) }}
              </span>
            </td>
            <td>
              <div class="acciones">
                <button @click="editarUsuario(usuario)" class="btn-icon" title="Editar">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button @click="restablecerPassword(usuario)" class="btn-icon" title="Restablecer contraseña">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </button>
                <button @click="confirmarEliminar(usuario)" class="btn-icon btn-danger" title="Eliminar Usuario">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="usuariosFiltrados.length === 0" class="empty-state">
        <p>No se encontraron usuarios</p>
      </div>
    </div>

    <!-- Modal Nuevo/Editar Usuario -->
    <div v-if="mostrarModalNuevo || mostrarModalEditar" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-custom">
        <div class="modal-header">
          <h2>{{ mostrarModalEditar ? 'Editar Usuario' : 'Nuevo Usuario' }}</h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="guardarUsuario" class="modal-body">
          <!-- 1. Datos de Identificación -->
          <div class="form-group">
            <label>Nombre Completo *</label>
            <input v-model="usuarioForm.nombre_completo" type="text" required
              placeholder="Ej: M.T.C.A., Dr, M.D. Edwin Rodriguez" />
          </div>

          <div class="form-group">
            <label>Correo Institucional *</label>
            <input v-model="usuarioForm.correo_institucional" type="email" required
              placeholder="usuario@novauniversitas.edu.mx" />
          </div>

          <!-- 2. Selección de Rol Principal -->
          <div class="form-group">
            <label>Rol Principal *</label>
            <select v-model="usuarioForm.rol" required @change="alCambiarRol">
              <option value="PROFESOR">Profesor/Profesora</option>
              <option value="JEFATURA_CARRERA">Jefatura de Carrera</option>
              <option value="VICERRECTORIA">Vicerrectoría Académica</option>
            </select>
          </div>

          <div v-if="mostrarModalEditar && usuarioForm.rol !== rolOriginal" class="warning-box" style="margin-bottom:16px">
            <p><strong>Cambio de rol:</strong> de <strong>{{ getRolNombre(rolOriginal) }}</strong> a <strong>{{ getRolNombre(usuarioForm.rol) }}</strong>.</p>
            <p>Esto afecta los permisos del usuario en todo el sistema.</p>
          </div>

          <!-- 3. Lógica Condicional: Solo para PROFESOR -->
          <template v-if="usuarioForm.rol === 'PROFESOR'">
            <div class="checkbox-area" style="margin-bottom: 15px;">
              <label class="checkbox-label" style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                <input type="checkbox" v-model="esJefeTambien" style="width: 16px; height: 16px;" />
                <span style="font-size: 14px; font-weight: 600;">¿Este profesor es también Jefe de Carrera?</span>
              </label>
            </div>

            <!-- Aparece solo si se marca la casilla anterior -->
            <div class="form-group animate-fade-in" v-if="esJefeTambien">
              <label>Carrera a la que pertenece (Jefatura) *</label>
              <select v-model="carreraSeleccionada" :required="esJefeTambien">
                <option :value="null">Seleccionar carrera a cargo...</option>
                <option v-for="carrera in carreras" :key="carrera.id" :value="carrera.id">
                  {{ carrera.nombre }}
                </option>
              </select>
              <small style="color: #0369a1;">
                Al ser Jefe, sus planeaciones serán aprobadas por Vicerrectoría Academica para evitar autoevaluación.
              </small>
            </div>
          </template>

          <!-- 4. Contraseña al crear -->
          <div v-if="mostrarModalNuevo" class="form-group"
            style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            <label>Contraseña inicial *</label>
            <input v-model="usuarioForm.password" type="password" required
              autocomplete="new-password"
              placeholder="Ingresa una contraseña temporal" />
            <small>Para cambiarla después usa el botón de restablecer contraseña.</small>
          </div>

          <!-- Mensajes y Botones -->
          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="cerrarModal" class="btn-secondary">Cancelar</button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? 'Guardando...' : (mostrarModalEditar ? 'Guardar cambios' : 'Registrar Usuario') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Restablecer Contraseña -->
    <div v-if="mostrarModalPassword" class="modal-overlay" @click.self="mostrarModalPassword = false">
      <div class="modal-custom modal-small">
        <div class="modal-header">
          <h2>Restablecer Contraseña</h2>
          <button @click="mostrarModalPassword = false" class="btn-cerrar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form @submit.prevent="confirmarRestablecerPassword" class="modal-body">
          <p>¿Restablecer contraseña para <strong>{{ usuarioSeleccionado?.nombre_completo ||
            usuarioSeleccionado?.correo_institucional }}</strong>?</p>

          <div class="form-group">
            <label>Nueva contraseña temporal *</label>
            <input v-model="nuevaPassword" type="password" required autocomplete="new-password"
              placeholder="Ingresa una contraseña temporal" />
            <small>Debe cumplir las reglas de seguridad del sistema.</small>
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            {{ mensaje }}
          </div>

          <div class="modal-footer">
            <button type="button" @click="mostrarModalPassword = false" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn-primary" :disabled="guardando">
              {{ guardando ? 'Restableciendo...' : 'Restablecer' }}
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
  name: 'GestionUsuarios',
  data() {
    return {
      usuarios: [],
      busqueda: '',
      filtroRol: '',
      carreras: [],
      esJefeTambien: false, // Controla la aparición del dropdown de carrera[cite: 14]
      carreraSeleccionada: null,

      mostrarModalNuevo: false,
      mostrarModalEditar: false,
      mostrarModalPassword: false,

      usuarioForm: this.getEmptyForm(),
      usuarioSeleccionado: null,
      nuevaPassword: '',
      rolOriginal: '',

      mensaje: '',
      mensajeTipo: '',
      guardando: false
    }
  },
  computed: {
    usuariosFiltrados() {
      return this.usuarios.filter(usuario => {
        // Filtro de búsqueda
        if (this.busqueda) {
          const busquedaLower = this.busqueda.toLowerCase()
          const coincide =
            (usuario.nombre_completo && usuario.nombre_completo.toLowerCase().includes(busquedaLower)) ||
            (usuario.correo_institucional && usuario.correo_institucional.toLowerCase().includes(busquedaLower))

          if (!coincide) return false
        }

        // Filtro de rol
        if (this.filtroRol && usuario.rol !== this.filtroRol) {
          return false
        }

        return true
      })
    }
  },
  mounted() {
    this.cargarUsuarios()
    this.cargarCarreras()
  },
  methods: {
    async cargarUsuarios() {
      try {
        const response = await api.getUsuarios()
        this.usuarios = Array.isArray(response)
          ? response
          : response.results || []
      } catch (error) {
        console.error('Error cargando usuarios:', error)
        this.usuarios = []
        this.mostrarMensaje('Error al cargar usuarios', 'error')
      }
    },

    async cargarCarreras() {
      try {
        const response = await api.getCarreras()
        this.carreras = Array.isArray(response) ? response : response.results || []
      } catch (error) {
        console.error('Error cargando carreras:', error)
      }
    },

    getEmptyForm() {
      return {
        password: '',
        nombre_completo: '',
        correo_institucional: '',
        rol: 'PROFESOR',
        activo: true  // Siempre activo por defecto
      }
    },

    abrirModalNuevo() {
      this.usuarioForm = this.getEmptyForm()
      this.mostrarModalNuevo = true
    },

    editarUsuario(usuario) {
      this.usuarioForm = {
        id: usuario.id,
        nombre_completo: usuario.nombre_completo || '',
        correo_institucional: usuario.correo_institucional || '',
        rol: usuario.rol,
        activo: true
      };
      this.rolOriginal = usuario.rol;
      this.esJefeTambien = usuario.tiene_cargo_jefatura || false;
      this.carreraSeleccionada = usuario.carrera_jefatura_id || null;
      this.mostrarModalEditar = true;
    },

    alCambiarRol() {
      // Al cambiar de rol, limpiar estado híbrido para que no arrastre valores stale
      this.esJefeTambien = false;
      this.carreraSeleccionada = null;
    },

    cerrarModal() {
      this.mostrarModalNuevo = false;
      this.mostrarModalEditar = false;
      this.usuarioForm = this.getEmptyForm();
      this.esJefeTambien = false;
      this.carreraSeleccionada = null;
      this.rolOriginal = '';
      this.mensaje = '';
    },

    async guardarUsuario() {
      this.guardando = true;

      const esProfesor = this.usuarioForm.rol === 'PROFESOR'

      const payload = {
        nombre_completo: this.usuarioForm.nombre_completo,
        correo_institucional: this.usuarioForm.correo_institucional,
        rol: this.usuarioForm.rol,
        activo: this.usuarioForm.activo,
        // carrera_id solo aplica a JEFATURA_CARRERA; para PROFESOR solo importa el flag
        carrera_id: !esProfesor && this.carreraSeleccionada ? this.carreraSeleccionada : null,
        esJefeTambien: esProfesor ? this.esJefeTambien : false
      };

      if (this.mostrarModalNuevo) {
        payload.password = this.usuarioForm.password
      }

      try {
        if (this.mostrarModalEditar) {
          await api.updateUsuario(this.usuarioForm.id, payload);
          this.mostrarMensaje('Usuario actualizado correctamente', 'success');
        } else {
          await api.createUsuario(payload);
          this.mostrarMensaje('Usuario registrado correctamente', 'success');
        }

        setTimeout(() => {
          this.cerrarModal();
        }, 2000);

      } catch (error) {
        this.mostrarMensaje(error.message || 'Error al guardar usuario', 'error');
      } finally {
        this.guardando = false;
        await this.cargarUsuarios();
      }
    },

    async confirmarEliminar(usuario) {
      // Verificamos que no se intente borrar a sí mismo
      const userData = localStorage.getItem('user')
      if (!userData) {
        this.$router.push('/login')
        return
      }
      const self = JSON.parse(userData);
      if (self.id === usuario.id) {
        this.mostrarMensaje('No puedes eliminar tu propia cuenta', 'error');
        return;
      }

      if (confirm(`¿Estás seguro de eliminar al usuario ${usuario.nombre_completo}? Esta acción no se puede deshacer.`)) {
        try {
          await api.deleteUsuario(usuario.id);
          this.mostrarMensaje('Usuario eliminado correctamente', 'success');
          await this.cargarUsuarios(); // Recargar la lista
        } catch (error) {
          this.mostrarMensaje('No se pudo eliminar: el usuario tiene registros asociados (materias o planeaciones).', 'error');
        }
      }
    },

    restablecerPassword(usuario) {
      this.usuarioSeleccionado = usuario
      this.nuevaPassword = ''
      this.mensaje = ''
      this.mostrarModalPassword = true
    },

    async confirmarRestablecerPassword() {
      this.guardando = true
      this.mensaje = ''

      try {
        const password = this.nuevaPassword.trim()
        if (!password) {
          this.mostrarMensaje('Ingresa una contraseña temporal', 'error')
          return
        }

        await api.restablecerPassword(this.usuarioSeleccionado.id, password)

        this.mostrarMensaje('Contraseña restablecida correctamente', 'success')
        setTimeout(() => {
          this.mostrarModalPassword = false
        }, 1500)

      } catch (error) {
        this.mostrarMensaje(error.message || 'Error al restablecer contraseña', 'error')
      } finally {
        this.guardando = false
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

    getRolNombre(rol) {
      const roles = {
        'VICERRECTORIA': 'Vicerrectoría Academica',
        'JEFATURA_CARRERA': 'Jefatura de Carrera',
        'PROFESOR': 'Profesor/Profesora'
      }
      return roles[rol] || rol
    },

    getRolClass(rol) {
      return rol ? rol.toLowerCase().replace('_', '-') : ''
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
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(20px, 2.5vw, 28px);
  font-weight: 700;
  color: #1a1a1a;
  letter-spacing: -0.4px;
}

/* ─── Filtros ─── */
.filtros {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.input-busqueda {
  flex: 1;
  min-width: 240px;
  padding: 9px 14px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f7f6f3;
  color: #1a1a1a;
  transition: border-color 0.15s, box-shadow 0.15s;
  outline: none;
}

.input-busqueda::placeholder {
  color: #c0bdb7;
}

.input-busqueda:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.select-filtro {
  padding: 9px 14px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f7f6f3;
  color: #1a1a1a;
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.select-filtro:focus {
  border-color: #1c2333;
}

/* ─── Tabla ─── */
.tabla-container {
  background: #f7f6f3;
  border-radius: 14px;
  border: 1px solid #dedad4;
  overflow: hidden;
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla thead {
  background: #eeece8;
}

.tabla th {
  padding: 13px 16px;
  text-align: left;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  color: #6b7280;
  border-bottom: 1px solid #dedad4;
}

.tabla td {
  padding: 13px 16px;
  font-size: 13.5px;
  color: #374151;
  border-bottom: 1px solid #eeece8;
}

.tabla tbody tr:last-child td {
  border-bottom: none;
}

.tabla tbody tr:hover td {
  background: #eeece8;
}

/* ─── Badges ─── */
.badge-rol {
  padding: 4px 11px;
  border-radius: 50px;
  font-size: 12px;
  font-weight: 600;
  display: inline-block;
}

.badge-rol.vicerrectoria {
  background: #e0e7ff;
  color: #3730a3;
}

.badge-rol.jefatura-carrera {
  background: #fae8ff;
  color: #7e22ce;
}

.badge-rol.profesor {
  background: #dcfce7;
  color: #166534;
}

/* ─── Acciones ─── */
.acciones {
  display: flex;
  gap: 5px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  padding: 0;
  background: #eeece8;
  border: 1px solid #dedad4;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: background 0.12s, border-color 0.12s, color 0.12s;
}

.btn-icon:hover {
  background: #e2e0db;
  border-color: #c0bdb7;
  color: #1a1a1a;
}

.btn-icon.btn-danger {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #9f1239;
}

.btn-icon.btn-danger:hover {
  background: #ffe4e6;
  border-color: #fca5a5;
}

/* ─── Empty state ─── */
.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
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

.modal-small {
  max-width: 460px;
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-size: 13.5px;
  font-family: inherit;
  background: #f7f6f3;
  color: #1a1a1a;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  outline: none;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #1c2333;
  background: white;
  box-shadow: 0 0 0 3px rgba(28, 35, 51, 0.07);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #eeece8;
  color: #9ca3af;
  cursor: not-allowed;
}

.form-group small {
  display: block;
  margin-top: 5px;
  font-size: 12px;
  color: #9ca3af;
}

/* ─── Warning box ─── */
.warning-box {
  background: #fef9ee;
  border-left: 3px solid #f59e0b;
  padding: 14px 16px;
  border-radius: 10px;
  margin: 14px 0;
}

.warning-box p {
  margin: 4px 0;
  color: #92400e;
  font-size: 13.5px;
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

/* ─── Footer ─── */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 18px;
  border-top: 1px solid #dedad4;
}

/* ─── Botones ─── */
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

.btn-secondary:hover {
  background: #e2e0db;
}

@media (max-width: 640px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
