# Sistema de Gestión de Estacionamiento

## Descripción

Sistema web para la gestión y administración de estacionamientos universitarios. Permite a estudiantes, guardias y administrativos gestionar espacios, reportar incidencias, programar eventos y monitorear el uso del estacionamiento en tiempo real.

## Características Principales

### 👨‍🎓 Para Estudiantes
- **Gestión de Espacios**: Visualización de espacios ocupados y libres
- **Eventos del Día**: Consulta de eventos programados para hoy
- **Análisis de Uso**: Visualización de horas pico del estacionamiento
- **Sistema de Reportes**: Reporte de problemas y seguimiento de estado
- **Historial Personal**: Registro completo de entradas y salidas
- **Gestión de Perfil**: Actualización de foto e información del vehículo y visualización de datos personales
- **Asignación Automática**: Sistema de asignación de espacios en la entrada

### 👮‍♂️ Para Guardias
- **Gestión de Espacios**: Administración y reasignación de lugares
- **Gestión de Reportes**: Visualización, asignación y resolución de incidencias
- **Control de Estado**: Seguimiento del progreso de reportes
- **Sistema de Asignación**: Gestión de responsables para cada reporte

### 👔 Para Administrativos
- **Programación de Eventos**: Administración de eventos que afecten el estacionamiento
- **Gestión de Horas Pico**: Configuración de períodos de alta demanda
- **Administración de Reportes**: Consulta y gestión completa de incidencias
- **Gestión de Usuarios**: Registro y administración de usuarios del sistema

## Estructura del Proyecto

```
proyecto-estacionamiento/
├── django/                 # API Django REST Framework
├── web/               # Aplicación web cliente
│   ├── assets/
│   │   └── images/	
│   │   └── scripts/		#JS para la logica de cada page
│				└── admin/
│				└── estudiante/
│				└── guardia/
│   │       ├── config.js
│   │       └── firebaseConfig.js
│   └── pages/		#HTML para cada usuario
│       └── administrativo/
│       └── estudiante/
│           └── entrada_estacionamiento.html
│       └── vigilante/
│   ├── index.html		#Página de Inicio
└── db/              # Respaldo de la bd, SQl para creación e inserciones de PostgreSQL
```

## Tecnologías Utilizadas

### Backend
- **Django REST Framework** - API REST
- **PostgreSQL** - Base de datos
- **Hostinger Email Service** - Servicio de recuperación de contraseñas

### Frontend
- **HTML5, CSS3, JavaScript** - Tecnologías base
- **Bootstrap** - Framework CSS
- **Firebase** - Almacenamiento de imágenes

## Instalación y Configuración

### Requisitos Previos
- Python
- PostgreSQL
- Cuenta en Firebase (para almacenamiento de imágenes)
- Cuenta en Hostinger (para servicio de correo)

### Configuración del Backend

1. **Clonar el repositorio**


2. **Crear entorno virtual**
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar base de datos**
   - Crear base de datos en PostgreSQL y utilizar el respaldo proporcionado
   - Actualizar configuración en `settings.py`:
   ```python
   DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.postgresql',
           'NAME': 'tu_base_de_datos',
           'USER': 'tu_usuario',
           'PASSWORD': 'tu_contraseña',
           'HOST': 'localhost',
           'PORT': '5432',
       }
   }
   ```

5. **Configurar servicio de correo**
   Actualizar en `settings.py`:
   ```python
   EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
   EMAIL_HOST = 'tu_host_hostinger'
   EMAIL_PORT = 587
   EMAIL_USE_TLS = True
   EMAIL_HOST_USER = 'tu_email@tudominio.com'
   EMAIL_HOST_PASSWORD = 'tu_contraseña'
   ```

6. **Ejecutar servidor**
   ```bash
   python manage.py runserver
   ```

### Configuración del Frontend

1. **Navegar al directorio frontend**
   ```bash
   cd ../web
   ```

2. **Configurar Firebase**
   Actualizar `assets/scripts/firebaseConfig.js`:
   ```javascript
   const firebaseConfig = {
     apiKey: "tu_api_key",
     authDomain: "tu_auth_domain",
     projectId: "tu_project_id",
     storageBucket: "tu_storage_bucket",
     messagingSenderId: "tu_messaging_sender_id",
     appId: "tu_app_id"
   };
   ```

3. **Configurar API endpoint**
   Actualizar `assets/scripts/config.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:8000/api'; // Para desarrollo local
   ```

4. **Servir archivos**
   Puedes usar cualquier servidor web estático o abrir directamente `index.html`

### Base de Datos

#### Descripción de la Base de Datos PostgreSQL

La base de datos está diseñada con una estructura relacional que gestiona usuarios, vehículos, estacionamientos, reportes y eventos. A continuación se describe cada tabla principal:

##### Tablas de Catálogos
- **Roles**: Define los tipos de usuarios del sistema (Estudiante, Guardia, Administrativo)
- **Marcas**: Catálogo de marcas de vehículos (Toyota, Nissan, Ford, etc.)
- **Modelos**: Modelos específicos de vehículos, relacionados con las marcas
- **Anios**: Años de fabricación de los vehículos
- **Tipos_Incidencia**: Catálogo de tipos de problemas reportables (Estacionamiento Ocupado, Daños, etc.)

##### Gestión de Usuarios
- **Usuarios**: Información personal de los usuarios del sistema
  - `numero_control`: Identificador único del estudiante/usuario
  - `nombre`, `apellidos`: Datos personales
  - `correo_electronico`: Email institucional
  - `fecha_nacimiento`, `telefono`: Información de contacto
  - `foto_perfil`: URL o referencia a la imagen de perfil
  - `capacidades_diferentes`: Boolean para identificar necesidades especiales
  - `id_rol`: Relación con la tabla Roles

- **Credenciales**: Almacena las credenciales de acceso
  - `id_usuario`: Relación con Usuarios
  - `contrasena`: Contraseña del usuario ⚠️ *Actualmente almacenada en texto plano*

##### Gestión de Vehículos
- **Datos_Auto**: Información técnica de los vehículos
  - Relaciona `id_marca`, `id_modelo`, `id_anio` para formar la especificación completa

- **Usuario_Automovil**: Tabla de relación usuario-vehículo
  - `id_usuario`: Propietario del vehículo
  - `id_datos_auto`: Especificaciones del vehículo
  - `placas`: Número de placas del vehículo

##### Sistema de Estacionamiento
- **Estacionamientos**: Gestión de espacios físicos
  - `numero_estacionamiento`: Identificador del espacio
  - `es_reservado`: Indica si es un espacio reservado (capacidades diferentes)
  - `esta_ocupado`: Estado actual del espacio

- **Historial**: Registro de entradas y salidas
  - `id_usuario_automovil`: Vehículo que utilizó el espacio
  - `id_estacionamiento`: Espacio utilizado
  - `fecha_entrada`, `hora_entrada`: Timestamp de entrada
  - `fecha_salida`, `hora_salida`: Timestamp de salida

##### Sistema de Reportes
- **Reportes**: Gestión de incidencias
  - `id_usuario_reporta`: Usuario que genera el reporte
  - `id_usuario_resuelve`: Usuario asignado para resolver (Guardia/Administrativo)
  - `id_estacionamiento`: Espacio relacionado con la incidencia
  - `id_tipo_incidencia`: Tipo de problema reportado
  - `descripcion_problema`: Detalle del problema
  - `fotografia`: Evidencia fotográfica (opcional)
  - `fecha_creacion`: Timestamp del reporte
  - `esta_solucionado`: Estado de resolución
  - `esta_proceso`: Indica si está siendo atendido

##### Gestión de Eventos y Horarios
- **HorasPico**: Configuración de horarios de alta demanda
  - `id_usuario`: Administrativo que configura
  - `dia`: Día de la semana
  - `hora_inicio`, `hora_fin`: Período de hora pico

- **EventosEspeciales**: Eventos que afectan el estacionamiento
  - `id_usuario`: Administrativo que programa
  - `nombre_evento`: Nombre del evento
  - `fecha_evento`, `hora_evento`: Fecha y hora del evento
  - `descripcion_evento`: Descripción detallada

##### Relaciones Principales
```
Usuarios (1) ←→ (N) Credenciales
Usuarios (1) ←→ (N) Usuario_Automovil
Marcas (1) ←→ (N) Modelos
Datos_Auto (N) ←→ (1) Marcas, Modelos, Anios
Usuario_Automovil (N) ←→ (1) Datos_Auto
Historial (N) ←→ (1) Usuario_Automovil, Estacionamientos
Reportes (N) ←→ (1) Usuarios (reporta/resuelve), Estacionamientos, Tipos_Incidencia
```

##### Consideraciones Técnicas
- **Integridad Referencial**: Todas las relaciones están definidas con foreign keys
- **Campos Obligatorios**: Los campos críticos como numero_control, correo_electronico son NOT NULL
- **Estados Booleanos**: Se utilizan para gestionar estados (ocupado, solucionado, en proceso)
- **Timestamps**: Registro preciso de fechas y horas para auditoría

## Funcionalidades Especiales

### Sistema de Entrada al Estacionamiento
- **Ubicación**: `pages/estudiante/entrada_estacionamiento.html`
- **Función**: Asignación automática de espacios por número de control
- **Características**: 
  - Consideración de necesidades especiales (capacidades diferentes)
  - Visualización en tiempo real de espacios libres/ocupados
  - Interfaz optimizada para uso en tablets/dispositivos de entrada

### Sistema de Gestión de Imágenes
- Integración con Firebase Storage
- Subida y gestión de fotos de perfil e incidencias
- Almacenamiento en la nube

## Consideraciones de Seguridad

⚠️ **Importante**: Este proyecto fue desarrollado con fines académicos y contiene las siguientes consideraciones de seguridad:

- **Contraseñas en texto plano**: El sistema almacena contraseñas sin cifrado
- **Configuración local**: Todas las configuraciones están preparadas para entorno local
- **Antes de producción**: Se recomienda implementar hash de contraseñas y configuración de seguridad apropiada

## API Endpoints

La API está construida con Django REST Framework y utiliza ViewSets para la mayoría de las operaciones CRUD.

### Base URL
```
/api/v1/
```

### Autenticación
- `POST /api/v1/login/` - Inicio de sesión
- `POST /api/v1/recuperar-contrasena/` - Recuperación de contraseña

### Gestión de Catálogos
- `GET|POST /api/v1/anios/` - Años de vehículos
- `GET|POST /api/v1/roles/` - Roles de usuarios
- `GET|POST /api/v1/marcas/` - Marcas de vehículos
- `GET|POST /api/v1/modelos/` - Modelos de vehículos
- `GET|POST /api/v1/tipos-incidencia/` - Tipos de incidencias

### Gestión de Usuarios
- `GET|POST /api/v1/usuarios/` - Usuarios del sistema
- `GET|PUT|PATCH|DELETE /api/v1/usuarios/{id}/` - Operaciones específicas por usuario
- `GET|POST /api/v1/credenciales/` - Credenciales de acceso

### Gestión de Vehículos
- `GET|POST /api/v1/datos-auto/` - Información de vehículos
- `GET|PUT|PATCH|DELETE /api/v1/datos-auto/{id}/` - Operaciones específicas por vehículo
- `GET|POST /api/v1/usuario-automovil/` - Relación usuario-vehículo
- `GET|PUT|PATCH|DELETE /api/v1/usuario-automovil/{id}/` - Gestión de asociaciones

### Gestión de Estacionamiento
- `GET|POST /api/v1/estacionamientos/` - Espacios de estacionamiento
- `GET|PUT|PATCH|DELETE /api/v1/estacionamientos/{id}/` - Gestión de espacios específicos
- `GET|POST /api/v1/historial/` - Historial de entradas y salidas
- `GET|PUT|PATCH|DELETE /api/v1/historial/{id}/` - Operaciones específicas de historial

### Gestión de Eventos y Horarios
- `GET|POST /api/v1/horaspico/` - Configuración de horas pico
- `GET|PUT|PATCH|DELETE /api/v1/horaspico/{id}/` - Gestión de horas pico específicas
- `GET|POST /api/v1/eventos-especiales/` - Eventos especiales
- `GET|PUT|PATCH|DELETE /api/v1/eventos-especiales/{id}/` - Gestión de eventos específicos

### Sistema de Reportes
- `GET|POST /api/v1/reportes/` - Reportes de incidencias
- `GET|PUT|PATCH|DELETE /api/v1/reportes/{id}/` - Gestión de reportes específicos

### Operaciones CRUD Disponibles
Todos los ViewSets registrados soportan las siguientes operaciones estándar:
- `GET /endpoint/` - Listar todos los registros
- `POST /endpoint/` - Crear nuevo registro
- `GET /endpoint/{id}/` - Obtener registro específico
- `PUT /endpoint/{id}/` - Actualizar registro completo
- `PATCH /endpoint/{id}/` - Actualización parcial
- `DELETE /endpoint/{id}/` - Eliminar registro

## Licencia

Este proyecto fue desarrollado con fines académicos. 

## Contacto

[Carlos Armando Arellano Cruz] - [carlosarell36@gmail.com]
[Maria Guadalupe Martinez Hernandez] - [malumarher710@gmail.com]