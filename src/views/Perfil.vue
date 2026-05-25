<template>
  <div class="perfil-container">

    <nav class="breadcrumb">
      <router-link to="/dashboard" class="back-link">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
        Volver al inicio
      </router-link>
    </nav>

    <div class="perfil-grid">

      <!-- Info personal -->
      <div class="perfil-card">
        <div class="card-header">
          <div class="avatar-large">{{ (user.nombre_completo || user.correo_institucional || '?')[0].toUpperCase() }}</div>
          <div>
            <h1>{{ user.nombre_completo || user.correo_institucional }}</h1>
            <span class="role-badge">{{ getRolNombre(user.rol) }}</span>
          </div>
        </div>

        <div class="info-section">
          <h2>Información Personal</h2>
          <div class="info-list">
            <div class="info-row">
              <div class="info-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
                Nombre Completo
              </div>
              <span class="info-value">{{ user.nombre_completo || 'No especificado' }}</span>
            </div>
            <div class="info-row">
              <div class="info-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Correo Institucional
              </div>
              <span class="info-value">{{ user.correo_institucional || 'No especificado' }}</span>
            </div>
            <div class="info-row">
              <div class="info-label">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Rol
              </div>
              <span class="info-value">{{ getRolNombre(user.rol) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Cambiar contraseña -->
      <div class="perfil-card">
        <div class="section-title-wrap">
          <h2>Cambiar Contraseña</h2>
          <p>Actualiza tu contraseña de acceso al sistema</p>
        </div>

        <form @submit.prevent="cambiarPassword" class="password-form">
          <div class="form-group">
            <label for="pwd-actual">Contraseña Actual</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="pwd-actual" v-model="passwords.actual" type="password" placeholder="Tu contraseña actual" required/>
            </div>
          </div>

          <div class="form-group">
            <label for="pwd-nueva">Nueva Contraseña</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input id="pwd-nueva" v-model="passwords.nueva" type="password" placeholder="Nueva contraseña" required/>
            </div>
          </div>

          <div class="form-group">
            <label for="pwd-confirm">Confirmar Nueva Contraseña</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <input id="pwd-confirm" v-model="passwords.confirmacion" type="password" placeholder="Repite la nueva contraseña" required/>
            </div>
          </div>

          <div v-if="mensaje" :class="['mensaje', mensajeTipo]">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle v-if="mensajeTipo === 'error'" cx="12" cy="12" r="10"/><line v-if="mensajeTipo === 'error'" x1="12" y1="8" x2="12" y2="12"/><line v-if="mensajeTipo === 'error'" x1="12" y1="16" x2="12.01" y2="16"/>
              <polyline v-if="mensajeTipo === 'success'" points="20 6 9 17 4 12"/>
            </svg>
            {{ mensaje }}
          </div>

          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Guardando...' : 'Cambiar Contraseña' }}
          </button>
        </form>
      </div>

    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Perfil',
  data() {
    return {
      user: {},
      passwords: { actual: '', nueva: '', confirmacion: '' },
      mensaje: '', mensajeTipo: '', loading: false
    }
  },
  mounted() { this.loadUserData() },
  methods: {
    loadUserData() {
      const userData = localStorage.getItem('user')
      if (userData) this.user = JSON.parse(userData)
    },
    getRolNombre(rol) {
      const roles = {
        'VICERRECTORIA': 'Vicerrectoría Academica',
        'JEFATURA_CARRERA': 'Jefatura de Carrera',
        'PROFESOR': 'Profesor/Profesora'
      }
      return roles[rol] || rol
    },
    async cambiarPassword() {
      this.mensaje = ''
      if (this.passwords.nueva !== this.passwords.confirmacion) {
        this.mensaje = 'Las contraseñas no coinciden'
        this.mensajeTipo = 'error'
        return
      }
      if (this.passwords.nueva.length < 4) {
        this.mensaje = 'La contraseña debe tener al menos 4 caracteres'
        this.mensajeTipo = 'error'
        return
      }
      this.loading = true
      try {
        const response = await api.cambiarPassword({
          password_actual: this.passwords.actual,
          password_nueva: this.passwords.nueva,
          password_confirmacion: this.passwords.confirmacion
        })
        this.mensaje = 'Contraseña cambiada correctamente'
        this.mensajeTipo = 'success'
        if (response.token) localStorage.setItem('token', response.token)
        this.passwords = { actual: '', nueva: '', confirmacion: '' }
      } catch (error) {
        this.mensaje = error.message || 'Error al cambiar la contraseña'
        this.mensajeTipo = 'error'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

.perfil-container {
  font-family: 'Plus Jakarta Sans', sans-serif;
  max-width: 900px;
}

.back-link {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 13.5px; font-weight: 500;
  color: #6b7280; text-decoration: none;
  margin-bottom: 24px;
  transition: color 0.12s;
}
.back-link:hover { color: #1a1a1a; }

.perfil-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}

.perfil-card {
  background: #f7f6f3;
  border-radius: 14px;
  padding: 28px;
  border: 1px solid #dedad4;
}

/* Header con avatar */
.card-header {
  display: flex; align-items: center; gap: 16px;
  margin-bottom: 28px;
  padding-bottom: 22px;
  border-bottom: 1px solid #dedad4;
}

.avatar-large {
  width: 56px; height: 56px;
  background: #1c2333; color: white;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; font-weight: 700;
  flex-shrink: 0;
}

.card-header h1 {
  font-size: 18px; font-weight: 700;
  color: #1a1a1a; margin-bottom: 6px;
  letter-spacing: -0.2px;
}

.role-badge {
  display: inline-block;
  background: #eeece8;
  color: #374151;
  border: 1px solid #dedad4;
  padding: 3px 11px;
  border-radius: 50px;
  font-size: 12px; font-weight: 600;
}

/* Info */
.info-section h2, .section-title-wrap h2 {
  font-size: 14px; font-weight: 700;
  color: #1a1a1a; margin-bottom: 4px;
  letter-spacing: -0.1px;
}

.section-title-wrap { margin-bottom: 22px; }
.section-title-wrap p { font-size: 13px; color: #9ca3af; margin-top: 3px; }

.info-list { margin-top: 16px; display: flex; flex-direction: column; gap: 2px; }

.info-row {
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  border-radius: 8px;
  background: #eeece8;
  border: 1px solid #dedad4;
}

.info-label {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: #6b7280;
}

.info-value { font-size: 13px; font-weight: 600; color: #1a1a1a; }

/* Form */
.password-form { display: flex; flex-direction: column; gap: 16px; }

.form-group label {
  display: block;
  font-size: 13px; font-weight: 600;
  color: #374151; margin-bottom: 6px;
}

.input-wrapper { position: relative; }

.input-icon {
  position: absolute; left: 12px; top: 50%;
  transform: translateY(-50%);
  color: #9ca3af; pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 11px 12px 11px 38px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; color: #1a1a1a;
  background: #eeece8;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.input-wrapper input::placeholder { color: #c0bdb7; }

.input-wrapper input:focus {
  border-color: #1c2333;
  background: #faf9f7;
  box-shadow: 0 0 0 3px rgba(28,35,51,0.07);
}

.mensaje {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 13px;
  border-radius: 10px;
  font-size: 13.5px;
}

.mensaje.success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
.mensaje.error { background: #fff8f0; border: 1px solid #fbd5a5; color: #92400e; }

.btn-primary {
  padding: 12px 24px;
  background: #1c2333;
  color: white; border: none;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s, transform 0.1s;
  align-self: flex-start;
}

.btn-primary:hover:not(:disabled) {
  background: #263045;
  box-shadow: 0 4px 14px rgba(28,35,51,0.2);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) { transform: translateY(0); }
.btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

@media (max-width: 700px) {
  .perfil-grid { grid-template-columns: 1fr; }
}
</style>
