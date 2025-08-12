const baseUrl = window.config.apiBaseUrl;

// Elementos del DOM
const tipoIncidencia = document.getElementById('tipoIncidencia');
const descripcionIncidencia = document.getElementById('descripcionIncidencia');
const encargadoResolver = document.getElementById('encargadoResolver');
const btnMarcarResuelta = document.getElementById('btnMarcarResuelta');
const btnMarcarPendiente = document.getElementById('btnMarcarPendiente');
const imagenIncidencia = document.getElementById('imagenIncidencia');

// Cargar datos guardados del HTML anterior
const incidenciaGuardada = JSON.parse(localStorage.getItem('incidenciaSeleccionada'));

// Función para inicializar la página
async function inicializar() {
    try {
        // Cargar tipos de incidencia
        const tiposResponse = await fetch(`${baseUrl}tipos-incidencia/`);
        const tiposData = await tiposResponse.json();

        // Cargar tipos de incidencia
        tiposData.forEach((tipo) => {
            const selected = tipo.id_tipo_incidencia === parseInt(incidenciaGuardada.id_tipo_incidencia, 10) ? 'selected' : '';
            tipoIncidencia.insertAdjacentHTML(
                'beforeend',
                `<option value="${tipo.id_tipo_incidencia}" ${selected}>${tipo.nombre}</option>`
            );
        });

        // Configurar descripción e imagen
        descripcionIncidencia.value = incidenciaGuardada.descripcion_problema;
        imagenIncidencia.src = incidenciaGuardada.fotografia || 'https://via.placeholder.com/400';

        // Cargar encargados
        const usuariosResponse = await fetch(`${baseUrl}usuarios/`);
        const usuariosData = await usuariosResponse.json();

        // Primero, agregar opción por defecto si es necesario
        if (!incidenciaGuardada.id_usuario_resuelve) {
            encargadoResolver.insertAdjacentHTML(
                'beforeend',
                `<option value="" disabled selected>Seleccione un encargado</option>`
            );
        }

        usuariosData
            .filter((usuario) => usuario.id_rol === 2)
            .forEach((usuario) => {
                const selected = incidenciaGuardada.id_usuario_resuelve && usuario.id_usuario === parseInt(incidenciaGuardada.id_usuario_resuelve, 10) ? 'selected' : '';
                encargadoResolver.insertAdjacentHTML(
                    'beforeend',
                    `<option value="${usuario.id_usuario}" ${selected}>${usuario.nombre} ${usuario.apellidos}</option>`
                );
            });

        // Deshabilitar elementos según estado
        if (incidenciaGuardada.esta_solucionado) {
            deshabilitarTodo();
        } else if (incidenciaGuardada.esta_proceso) {
            tipoIncidencia.setAttribute('disabled', 'disabled');
            encargadoResolver.setAttribute('disabled', 'disabled');
            btnMarcarPendiente.setAttribute('disabled', 'disabled');
        }
    } catch (error) {
        console.error('Error al inicializar:', error);
    }
}

// Deshabilitar todos los elementos de la interfaz
function deshabilitarTodo() {
    tipoIncidencia.setAttribute('disabled', 'disabled');
    encargadoResolver.setAttribute('disabled', 'disabled');
    btnMarcarResuelta.setAttribute('disabled', 'disabled');
    btnMarcarPendiente.setAttribute('disabled', 'disabled');
}

// Función para actualizar estado en la API
async function actualizarEstado(estaProceso, estaSolucionado) {
    try {
        const nuevoIdTipoIncidencia = parseInt(tipoIncidencia.value, 10);
        const nuevoIdUsuarioResuelve = parseInt(encargadoResolver.value, 10);

        // Validar selección de encargado
        if (isNaN(nuevoIdUsuarioResuelve)) {
            alert('Por favor, selecciona un encargado antes de actualizar el estado.');
            return;
        }

        // Crear el cuerpo de la solicitud
        const body = {
            id_reporte: parseInt(incidenciaGuardada.id_reporte, 10),
            id_usuario_reporta: parseInt(incidenciaGuardada.id_usuario_reporta, 10),
            id_usuario_resuelve: nuevoIdUsuarioResuelve, // Convertido a número
            id_estacionamiento: parseInt(incidenciaGuardada.id_estacionamiento, 10),
            id_tipo_incidencia: nuevoIdTipoIncidencia, // Convertido a número
            descripcion_problema: incidenciaGuardada.descripcion_problema,
            fotografia: incidenciaGuardada.fotografia,
            fecha_creacion: incidenciaGuardada.fecha_creacion,
            esta_solucionado: estaSolucionado,
            esta_proceso: estaProceso,
        };

        // Mostrar datos enviados a la API para depuración
        console.log('Datos enviados a la API:', body);

        // Hacer la solicitud PUT a la API
        const response = await fetch(`${baseUrl}reportes/${body.id_reporte}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            // Leer el cuerpo de respuesta en caso de error
            const errorData = await response.json();
            console.error('Error de la API:', errorData);
            throw new Error('Error al actualizar el reporte.');
        }

        // Notificar al usuario y ajustar la interfaz
        alert('Estado actualizado con éxito.');
        if (estaSolucionado) {
            deshabilitarTodo(); // Deshabilitar todos los elementos si está solucionado
        } else {
            btnMarcarResuelta.setAttribute('disabled', 'disabled');
            btnMarcarPendiente.setAttribute('disabled', 'disabled');
        }

        // Actualizar incidenciaGuardada con los nuevos valores
        incidenciaGuardada.id_usuario_resuelve = nuevoIdUsuarioResuelve;
        incidenciaGuardada.id_tipo_incidencia = nuevoIdTipoIncidencia;
        incidenciaGuardada.esta_solucionado = estaSolucionado;
        incidenciaGuardada.esta_proceso = estaProceso;

        // En detalles_incidencia.js
        console.log('incidenciaGuardada actualizada:', incidenciaGuardada);

    } catch (error) {
        console.error('Error al actualizar estado:', error);
        alert('Ocurrió un error al intentar actualizar el estado. Inténtalo nuevamente.');
    }
}

// Eventos para botones
btnMarcarResuelta.addEventListener('click', () => actualizarEstado(false, true));
btnMarcarPendiente.addEventListener('click', () => actualizarEstado(true, false));

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', inicializar);
