<template>
  <div class="login-page">

    <!-- Panel derecho -->
    <div class="right-panel">
      <div class="form-wrapper">

        <div class="form-header">
          <h1>Sistema de Planeación Académica</h1>
          <p class="subtitle">Iniciar sesión</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">

          <!-- CAMBIO #1: campo de correo institucional en vez de username -->
          <div class="field-group">
            <label for="correo">Correo Institucional</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input
                id="correo"
                v-model="correo"
                type="email"
                placeholder="tucorreo@novauniversitas.edu.mx"
                required
                autocomplete="email"
              />
            </div>
          </div>

          <div class="field-group">
            <label for="password">Contraseña</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input
                id="password"
                v-model="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                required
                autocomplete="current-password"
              />
            </div>
          </div>

          <div v-if="error" class="error-banner">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {{ error }}
          </div>

          <button type="submit" class="btn-login" :disabled="loading">
            <span v-if="!loading">Continuar</span>
            <span v-else class="loading-state">
              <svg class="spinner" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
              Iniciando sesión...
            </span>
          </button>
        </form>

        <!-- Panel DEMO actualizado con correos institucionales -->
        <div class="demo-credentials">
          <div class="demo-header">
            <div class="demo-badge">DEMO</div>
            <span>Usuarios de prueba</span>
          </div>
          <div class="credentials-grid">
            <div class="credential-item" @click="fillCredentials('admin@novauniversitas.edu.mx', 'admin')">
              <div class="cred-role">Vicerrectoría</div>
              <div class="cred-info">admin@novauniversitas.edu.mx</div>
            </div>
            <div class="credential-item" @click="fillCredentials('jefatura@novauniversitas.edu.mx', 'adminjefatura')">
              <div class="cred-role">Jefe de Carrera</div>
              <div class="cred-info">jefatura@novauniversitas.edu.mx</div>
            </div>
            <div class="credential-item" @click="fillCredentials('profesor@novauniversitas.edu.mx', 'profesor')">
              <div class="cred-role">Profesor</div>
              <div class="cred-info">profesor@novauniversitas.edu.mx</div>
            </div>
            <div class="credential-item" @click="fillCredentials('edwinj@novauniversitas.edu.mx', 'edwinjefatura')">
              <div class="cred-role">Jefe de Carrera</div>
              <div class="cred-info">edwinj@novauniversitas.edu.mx</div>
            </div>
            <div class="credential-item" @click="fillCredentials('edwin@novauniversitas.edu.mx', 'edwinprofesor')">
              <div class="cred-role">Profesor</div>
              <div class="cred-info">edwin@novauniversitas.edu.mx</div>
            </div>
            <div class="credential-item" @click="fillCredentials('ricardo@novauniversitas.edu.mx', 'ricardojefatura')">
              <div class="cred-role">Jefe de Carrera</div>
              <div class="cred-info">ricardo@novauniversitas.edu.mx</div>
            </div>
            <div class="credential-item" @click="fillCredentials('1ricardo@novauniversitas.edu.mx', 'ricardo123!')">
              <div class="cred-role">Profesor</div>
              <div class="cred-info">1ricardo@novauniversitas.edu.mx</div>
            </div>
          </div>
          <p class="demo-hint">Haz clic en un usuario para autocompletar</p>
        </div>

      </div>
      <footer class="copyright-footer">
        <p>&copy; 2026 NovaUniversitas.</p>
      </footer>
    </div>
  </div>
</template>

<script>
import api from '../services/api.js'

export default {
  name: 'Login',
  data() {
    return {
      correo: '',       // CAMBIO #1: antes era `username`
      password: '',
      error: '',
      loading: false
    }
  },
  methods: {
    async handleLogin() {
      this.error = ''
      this.loading = true
      try {
        // CAMBIO #1: se envía correo_institucional al backend en lugar de username
        const response = await api.login(this.correo, this.password)
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        localStorage.setItem('token_time', Date.now())
        this.$router.push('/dashboard')
      } catch (error) {
        this.error = 'Correo institucional o contraseña incorrectos'
      } finally {
        this.loading = false
      }
    },
    fillCredentials(correo, pass) {
      this.correo = correo
      this.password = pass
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.login-page {
  min-height: 100vh;
  display: flex;
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* ─── Panel izquierdo ─── */
.left-panel {
  width: 44%;
  background: #1c2333;
  position: relative;
  overflow: hidden;
  display: flex;
}

.left-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 48px;
  width: 100%;
  position: relative;
  z-index: 2;
}

.brand { display: flex; align-items: center; gap: 12px; }

.brand-icon {
  width: 38px; height: 38px;
  background: rgba(255,255,255,0.12);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
}

.brand-name {
  font-size: 17px; font-weight: 700; color: white; letter-spacing: -0.2px;
}

.hero-text { margin-top: auto; padding-bottom: 56px; }

.hero-text h2 {
  font-size: clamp(30px, 3.5vw, 48px);
  font-weight: 700;
  color: white;
  line-height: 1.12;
  letter-spacing: -1px;
  margin-bottom: 18px;
}

.hero-text p {
  color: rgba(255,255,255,0.45);
  font-size: 15px;
  line-height: 1.65;
  max-width: 280px;
}

/* Decoración */
.deco-1, .deco-2 {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 1;
}

.deco-1 {
  width: 420px; height: 420px;
  border: 1px solid rgba(255,255,255,0.06);
  top: -120px; right: -160px;
}

.deco-2 {
  width: 260px; height: 260px;
  border: 1px solid rgba(255,255,255,0.05);
  background: rgba(46,61,92,0.5);
  top: 20px; right: -60px;
}

.deco-grid {
  position: absolute;
  bottom: 0; right: 0;
  width: 220px; height: 220px;
  background-image:
    linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: radial-gradient(ellipse at bottom right, black 0%, transparent 65%);
  z-index: 1;
}

/* ─── Panel derecho ─── */
.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 40px;
  background: #eeece8;
  position: relative;
  padding-bottom: 100px;
}

.form-wrapper { width: 100%; max-width: 420px; }

.form-header { margin-bottom: 36px; }

.form-header h1 {
  font-size: 30px; font-weight: 700;
  color: #1a1a1a; letter-spacing: -0.5px;
  margin-bottom: 5px;
}

.subtitle { color: #9ca3af; font-size: 14.5px; }

/* ─── Form ─── */
.login-form { display: flex; flex-direction: column; gap: 18px; }

.field-group label {
  display: block;
  font-size: 13px; font-weight: 600;
  color: #374151; margin-bottom: 7px;
}

.input-wrapper { position: relative; }

.input-icon {
  position: absolute; left: 13px; top: 50%;
  transform: translateY(-50%);
  color: #9ca3af; pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 13px 12px 40px;
  border: 1.5px solid #dedad4;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px; color: #1a1a1a;
  background: #f7f6f3;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
  outline: none;
}

.input-wrapper input::placeholder { color: #c0bdb7; }

.input-wrapper input:focus {
  border-color: #1c2333;
  background: #ffffff;
  box-shadow: 0 0 0 3px rgba(28,35,51,0.08);
}

.error-banner {
  display: flex; align-items: center; gap: 8px;
  background: #fff8f0;
  border: 1px solid #fbd5a5;
  color: #92400e;
  padding: 10px 13px;
  border-radius: 10px;
  font-size: 13.5px;
}

.btn-login {
  width: 100%; padding: 13px;
  background: #1c2333;
  color: white; border: none;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px; font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
  margin-top: 4px;
}

.btn-login:hover:not(:disabled) {
  background: #263045;
  box-shadow: 0 6px 20px rgba(28,35,51,0.25);
  transform: translateY(-1px);
}

.btn-login:active:not(:disabled) { transform: translateY(0); }
.btn-login:disabled { opacity: 0.55; cursor: not-allowed; }

.loading-state { display: flex; align-items: center; justify-content: center; gap: 8px; }

.spinner { animation: spin 0.9s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ─── Demo ─── */
.demo-credentials {
  margin-top: 28px;
  padding: 18px;
  background: #f7f6f3;
  border-radius: 12px;
  border: 1px solid #dedad4;
}

.demo-header { display: flex; align-items: center; gap: 9px; margin-bottom: 12px; }

.demo-badge {
  font-size: 9.5px; font-weight: 700; letter-spacing: 1px;
  background: #1c2333; color: white;
  padding: 3px 7px; border-radius: 5px;
}

.demo-header span { font-size: 13px; font-weight: 600; color: #6b7280; }

.credentials-grid { display: flex; flex-direction: column; gap: 5px; }

.credential-item {
  display: flex; justify-content: space-between; align-items: center;
  padding: 9px 13px;
  background: white;
  border: 1px solid #e8e5e0;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.12s, box-shadow 0.12s;
}

.credential-item:hover {
  border-color: #1c2333;
  box-shadow: 0 2px 8px rgba(28,35,51,0.08);
}

.cred-role { font-size: 13px; font-weight: 600; color: #1a1a1a; flex-shrink: 0; }
/* CAMBIO #1: font-size reducido porque correos son más largos que usernames */
.cred-info { font-size: 10.5px; color: #9ca3af; font-family: 'Courier New', monospace; text-align: right; }

.demo-hint { margin-top: 9px; font-size: 11.5px; color: #c0bdb7; text-align: center; }

/* ─── Copyright Footer ─── */
.copyright-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 16px 40px;
  text-align: center;
  border-top: 1px solid #dedad4;
  background: #f7f6f3;
}

.copyright-footer p {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}

/* ─── Responsive ─── */
@media (max-width: 768px) {
  .login-page { flex-direction: column; }
  .left-panel { width: 100%; min-height: 200px; }
  .left-content { flex-direction: row; align-items: center; padding: 28px; }
  .hero-text { margin-top: 0; padding-bottom: 0; }
  .hero-text h2 { font-size: 22px; }
  .hero-text p { display: none; }
  .right-panel { padding: 32px 20px; }
}
</style>