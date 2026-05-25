# Sistema de Plenacion Academica NovaUniversitas

Sistema web para la gestión de planeaciones académicas y avances programáticos en instituciones universitarias. La plataforma permite administrar el flujo de creación, revisión y validación de documentos académicos entre profesores, jefaturas de carrera y vicerrectoría académica.

---

## Descripción general

El sistema fue desarrollado con el objetivo de digitalizar y optimizar los procesos de planeación académica y seguimiento docente dentro de NovaUniversitas, reemplazando flujos manuales basados en documentos físicos y mejorando la organización institucional.

La plataforma organiza el trabajo docente mediante:

- **Planeaciones académicas:** planes de curso por materia y periodo escolar.
- **Avances programáticos:** reportes parciales de cumplimiento académico.

Cada documento sigue un flujo de estados controlado:

```text
BORRADOR → ENVIADA → APROBADA / CON_OBSERVACIONES
```

---

## Roles del sistema

| Rol | Funciones principales |
|------|------------------------|
| **Vicerrectoría Académica** | Configurar periodos escolares, gestionar usuarios y carreras, validar y aprobar planeaciones y avances |
| **Jefatura de Carrera** | Supervisar planeaciones y avances académicos de su carrera |
| **Profesor** | Crear, editar y enviar planeaciones académicas y avances programáticos |

---

## Características principales

- Gestión de usuarios basada en roles
- Sistema de autenticación por token
- Control de sesiones con expiración automática
- Creación y edición de planeaciones académicas
- Registro de avances programáticos
- Generación automática de documentos PDF
- Validaciones en frontend y backend
- Dashboard dinámico según el rol del usuario
- Gestión de periodos escolares
- Administración de carreras y asignaciones
- Flujo institucional de revisión y aprobación
- Soporte para materias compartidas

---

## Stack tecnológico

### Frontend

- Vue.js 3
- Vue Router 4
- Composition API (`<script setup>`)
- Vite 7

### Backend

- Django 4.2
- Django REST Framework
- MySQL
- DRF TokenAuthentication
- ReportLab
- django-cors-headers

---

## Arquitectura general

```text
Login
   │
   ▼
Dashboard (según rol)
   │
   ├── Vicerrectoría Académica
   │      ├── Gestión de usuarios
   │      ├── Gestión de carreras
   │      ├── Configuración de periodos
   │      └── Validación de documentos
   │
   ├── Jefatura de Carrera
   │      ├── Supervisión académica
   │      ├── Revisión de planeaciones
   │      └── Revisión de avances
   │
   └── Profesor
          ├── Mis asignaciones
          ├── Planeaciones académicas
          └── Avances programáticos
```

---

## Capturas del sistema

> Agrega aquí screenshots del sistema para mostrar la interfaz y funcionalidades principales.

### Login

```md
![Login](docs/screenshots/login.png)
```

### Dashboard

```md
![Dashboard](docs/screenshots/dashboard.png)
```

### Planeaciones académicas

```md
![Planeaciones](docs/screenshots/planeaciones.png)
```

### Avances programáticos

```md
![Avances](docs/screenshots/avances.png)
```

---

## Instalación y ejecución

### Requisitos previos

- Node.js >= 18
- Python >= 3.10
- MySQL >= 8.0
- pip

---

## Backend

```bash
cd backend/academico

pip install -r requirements.txt

python manage.py migrate

python manage.py runserver
```

El backend quedará disponible en:

```text
http://localhost:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

El frontend quedará disponible en:

```text
http://localhost:5173
```

---

## Autenticación

El sistema utiliza autenticación mediante token utilizando Django REST Framework.

Características:

- Login mediante correo institucional y contraseña
- Sesiones almacenadas en `localStorage`
- Expiración automática de sesión después de 2 horas
- Protección de rutas mediante Vue Router Guards
- Redirección automática al login cuando la sesión expira

---

## Generación de PDFs

Los documentos PDF se generan desde el backend utilizando ReportLab.

El sistema permite generar:

- Planeaciones académicas
- Avances programáticos
- Reportes institucionales

Los archivos se sirven desde el directorio `media/` y son consumidos desde el frontend mediante endpoints REST.

---

## Estructura del proyecto

```text
frontend/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── router/
│   │   └── index.js
│   ├── services/
│   │   └── api.js
│   ├── views/
│   └── components/
│       ├── vicerrectoria/
│       ├── jefatura/
│       └── profesor/
│
backend/
├── academico/
├── config/
├── media/
└── manage.py
```

---

## Configuración

La URL base de la API se configura desde:

```text
frontend/src/services/api.js
```

Configuración actual:

- Desarrollo:
  
```text
http://localhost:8000/api
```

- Producción:
  
```text
http://{hostname}:8000/api
```

---

## Comandos útiles

| Comando | Descripción |
|----------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Genera el build de producción |
| `npm run preview` | Previsualiza el build generado |

---

## Mejoras futuras

- Notificaciones por correo electrónico
- Dashboard analítico con estadísticas
- Firma digital de documentos
- Exportación de reportes en Excel
- Historial de cambios por documento
- Sistema de observaciones avanzado
- Soporte multiinstitución

---

## Licencia

Proyecto desarrollado con fines académicos e institucionales para NovaUniversitas.

---

## Autor

**Edwin Lustre Rodriguez**

Desarrollador del sistema web de planeación académica y avances programáticos para NovaUniversitas.
