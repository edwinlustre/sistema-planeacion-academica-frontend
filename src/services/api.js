const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:8000/api'
  : `http://${window.location.hostname}:8000/api`

// Extrae un mensaje legible de los distintos formatos de error que devuelve DRF
function parsearMensajeError(data) {
  if (!data) return 'Error en la petición'
  if (typeof data === 'string') return data

  // Formato custom de las vistas: { error: "..." }
  if (data.error) return data.error

  // Formato estándar de DRF: { detail: "..." }
  if (data.detail) return String(data.detail)

  // Errores de campos de validación: { campo: ["msg1", "msg2"], ... }
  const entradas = Object.entries(data)
  if (entradas.length) {
    const nombresCampos = {
      password: 'Contraseña',
      password_nueva: 'Nueva contraseña',
      correo_institucional: 'Correo institucional',
      nombre_completo: 'Nombre completo',
      rol: 'Rol'
    }

    return entradas
      .map(([campo, msgs]) => {
        const texto = Array.isArray(msgs) ? msgs.join(', ') : String(msgs)
        return campo === 'non_field_errors' ? texto : `${nombresCampos[campo] || campo}: ${texto}`
      })
      .join(' | ')
  }

  return 'Error en la petición'
}

class ApiService {
  constructor() {
    this.baseURL = API_URL
  }

  getHeaders() {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` })
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const config = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    }

    try {
      const response = await fetch(url, config)

      if (response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        throw new Error('Unauthorized')
      }

      if (response.status === 204) {
        return null
      }

      const text = await response.text()
      let data = null

      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = { error: `Respuesta no válida del servidor: ${text.slice(0, 120)}` }
        }
      }

      if (!response.ok) {
        const mensaje = parsearMensajeError(data)
        console.error(
          `%c[API ${response.status}] ${options.method || 'GET'} ${endpoint}`,
          'color:#c0392b; font-weight:bold',
          '\n→', mensaje,
          '\nData completa:', data
        )
        const err = new Error(mensaje)
        err.status = response.status
        err.data = data
        throw err
      }

      return data
    } catch (error) {
      if (!error.status) {
        // Error de red (sin conexión, CORS, etc.)
        console.error(`%c[API RED] ${endpoint}`, 'color:#c0392b; font-weight:bold', error.message)
      }
      throw error
    }
  }

  // Auth
  // CAMBIO #1: ahora se autentica con correo_institucional en lugar de username
  async login(correo_institucional, password) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ correo_institucional, password })
    })
  }

  async logout() {
    return this.request('/auth/logout/', { method: 'POST' })
  }

  async getPerfil() {
    const token = localStorage.getItem('token')

    if (!token) return null

    return this.request('/auth/perfil/')
  }

  async cambiarPassword(passwords) {
    return this.request('/auth/cambiar-password/', {
      method: 'POST',
      body: JSON.stringify(passwords)
    })
  }

  // Usuarios
  async getUsuarios() {
    return this.request('/usuarios/')
  }

  async createUsuario(data) {
    return this.request('/usuarios/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateUsuario(id, data) {
    return this.request(`/usuarios/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteUsuario(id) {
    return this.request(`/usuarios/${id}/`, { method: 'DELETE' })
  }

  async restablecerPassword(id, password) {
    return this.request(`/usuarios/${id}/restablecer_password/`, {
      method: 'POST',
      body: JSON.stringify({ password })
    })
  }

  async getProfesores() {
    return this.request('/usuarios/profesores/')
  }

  async getJefesCarrera() {
    return this.request('/usuarios/jefes_carrera/')
  }

  // Carreras
  async getCarreras() {
    const data = await this.request('/carreras/')
    return Array.isArray(data) ? data : data?.results || []
  }

  async createCarrera(data) {
    return this.request('/carreras/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateCarrera(id, data) {
    return this.request(`/carreras/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteCarrera(id) {
    return this.request(`/carreras/${id}/`, { method: 'DELETE' })
  }

  async subirMalla(carreraId, archivo, preview = false) {
    const formData = new FormData()
    formData.append('archivo', archivo)

    const token = localStorage.getItem('token')
    const url = `${this.baseURL}/carreras/${carreraId}/subir_malla/${preview ? '?preview=true' : ''}`

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`
      },
      body: formData
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data?.error || 'Error al subir la malla curricular')
    }
    return data
  }

  // Materias
  async getMaterias(carreraId = null) {
    const params = carreraId ? `?carrera=${carreraId}` : ''
    return this.request(`/materias/${params}`)
  }

  async deleteMateria(id) {
    return this.request(`/materias/${id}/`, { method: 'DELETE' })
  }

  // Asignaciones
  async getAsignaciones(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/asignaciones/${queryString ? '?' + queryString : ''}`)
  }

  async createAsignacion(data) {
    return this.request('/asignaciones/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAsignacion(id, data) {
    return this.request(`/asignaciones/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteAsignacion(id) {
    return this.request(`/asignaciones/${id}/`, { method: 'DELETE' })
  }

  // Planeaciones
  async getPlaneaciones(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    return this.request(`/planeaciones/${queryString ? '?' + queryString : ''}`)
  }

  async getPlaneacion(id) {
    return this.request(`/planeaciones/${id}/`)
  }

  async createPlaneacion(data) {
    return this.request('/planeaciones/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePlaneacion(id, data) {
    return this.request(`/planeaciones/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async enviarPlaneacion(id) {
    return this.request(`/planeaciones/${id}/enviar/`, {
      method: 'POST'
    })
  }

  async aprobarPlaneacion(id, observaciones = '') {
    return this.request(`/planeaciones/${id}/aprobar/`, {
      method: 'POST',
      body: JSON.stringify({ observaciones })
    })
  }

  async rechazarPlaneacion(id, observaciones) {
    return this.request(`/planeaciones/${id}/rechazar/`, {
      method: 'POST',
      body: JSON.stringify({ observaciones })
    })
  }

  // Avances
  async getAvances(params = {}) {
    const queryString = new URLSearchParams(params).toString()
    const data = await this.request(`/avances/${queryString ? '?' + queryString : ''}`)
    return Array.isArray(data) ? data : data.results || []
  }

  async getAvancesPorPlaneacion(planeacionId) {
    const data = await this.request(`/avances/?planeacion=${planeacionId}`)
    return Array.isArray(data) ? data : data.results || []
  }


  async getAvance(id) {
    return this.request(`/avances/${id}/`)
  }

  async createAvance(data) {
    return this.request('/avances/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAvance(id, data) {
    return this.request(`/avances/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async enviarAvance(id) {
    return this.request(`/avances/${id}/enviar/`, { method: 'POST' })
  }

  async aprobarAvance(id, observaciones = '') {
    return this.request(`/avances/${id}/aprobar/`, {
      method: 'POST',
      body: JSON.stringify({ observaciones })
    })
  }

  async rechazarAvance(id, observaciones) {
    return this.request(`/avances/${id}/rechazar/`, {
      method: 'POST',
      body: JSON.stringify({ observaciones })
    })
  }

  // Plantillas
  async getPlantillas() {
    return this.request('/plantillas/')
  }

  async createPlantilla(data) {
    return this.request('/plantillas/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ================================
  // Configuración de Periodos Escolares
  // ================================

  async getConfiguracionPeriodos() {
    const data = await this.request('/configuracion-periodos/', {
      method: 'GET'
    })

    // DRF paginado devuelve { results: [...] }
    return data?.results || data
  }

  async getConfiguracionPeriodo(id) {
    return await this.request(`/configuracion-periodos/${id}/`, {
      method: 'GET'
    })
  }

  async getConfiguracionPeriodoActivo() {
    return await this.request('/configuracion-periodos/activo/', {
      method: 'GET'
    })
  }

  async getConfiguracionPeriodoPorNombre(periodo) {
    return await this.request(
      `/configuracion-periodos/por_periodo/?periodo=${encodeURIComponent(periodo)}`,
      {
        method: 'GET'
      }
    )
  }

  async createConfiguracionPeriodo(data) {
    return await this.request('/configuracion-periodos/', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateConfiguracionPeriodo(id, data) {
    return await this.request(`/configuracion-periodos/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    })
  }

  async deleteConfiguracionPeriodo(id) {
    return await this.request(`/configuracion-periodos/${id}/`, {
      method: 'DELETE'
    })
  }

  // Generación y descarga de PDFs de Avances
  async generarPDFAvance(avanceId) {
    return await this.request(`/avances/${avanceId}/generar_pdf/`, {
      method: 'POST'
    })
  }

  async descargarPDFAvance(avanceId) {
    const url = `${this.baseURL}/avances/${avanceId}/descargar_pdf/`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al descargar PDF')
    }

    return await response.blob()
  }

  async generarPDFPlaneacion(planeacionId) {
    return await this.request(
      `/planeaciones/${planeacionId}/generar_pdf/`,
      {
        method: 'POST'
      }
    )
  }

  async descargarPDFPlaneacion(planeacionId) {
    const url = `${this.baseURL}/planeaciones/${planeacionId}/descargar_pdf/`

    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders()
    })

    if (!response.ok) {
      throw new Error('Error al descargar PDF')
    }

    return await response.blob()
  }

  async getPendientesVicerrectoria() {
    return this.request('/pendientes-vicerrectoria/')
  }

  // CAMBIO #5: obtener historial de planeaciones previas del mismo profesor/materia
  // Usado en CrearAvance.vue para mostrar el banner de importación
  async getHistorialImportable(materiaId, periodoActual) {
    const params = new URLSearchParams({
      materia_id: materiaId,
      periodo_actual: periodoActual
    }).toString()
    return this.request(`/planeaciones/historial-importable/?${params}`)
  }
}

export default new ApiService()
