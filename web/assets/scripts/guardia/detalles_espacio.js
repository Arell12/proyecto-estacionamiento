const baseUrl = window.config.apiBaseUrl;
const idEstacionamiento = localStorage.getItem('idEstacionamiento');
const numeroLugarGuardado = localStorage.getItem('numeroEstacionamiento');

// Elementos del DOM
const nombreEstudianteInput = document.getElementById('nombreEstudiante');
const autoInput = document.getElementById('auto');
const matriculaInput = document.getElementById('matricula');
const numeroLugarInput = document.getElementById('numeroLugar');
const muevoNumeroLugarSelect = document.getElementById('muevoNumeroLugar');
const btnEditar = document.getElementById('btnEditar');
const btnGuardar = document.getElementById('btnGuardar');
const btnAceptar = document.getElementById('btnAceptar');

// Variables para almacenar datos globales
let historialGuardado = null;

// Función para cargar los datos iniciales
async function cargarDatos() {
    try {
        const historialResponse = await fetch(`${baseUrl}historial/`);
        const historialData = await historialResponse.json();

        // Filtrar por id_estacionamiento y validar entradas
        historialGuardado = historialData.find(
            (historial) =>
                historial.id_estacionamiento === parseInt(idEstacionamiento) &&
                historial.fecha_salida === null
        );

        if (!historialGuardado) {
            nombreEstudianteInput.value = 'No registrado';
            autoInput.value = 'No registrado';
            matriculaInput.value = 'No registrado';
            numeroLugarInput.value = numeroLugarGuardado;
            muevoNumeroLugarSelect.disabled = false;
            return;
        }

        // Obtener información del usuario-automovil
        const usuarioAutomovilResponse = await fetch(`${baseUrl}usuario-automovil/`);
        const usuarioAutomovilData = await usuarioAutomovilResponse.json();
        const usuarioAutomovil = usuarioAutomovilData.find(
            (ua) => ua.id_usuario_automovil === historialGuardado.id_usuario_automovil
        );

        const usuarioResponse = await fetch(`${baseUrl}usuarios/`);
        const usuarioData = await usuarioResponse.json();
        const usuario = usuarioData.find((u) => u.id_usuario === usuarioAutomovil.id_usuario);

        const datosAutoResponse = await fetch(`${baseUrl}datos-auto/`);
        const datosAutoData = await datosAutoResponse.json();
        const datosAuto = datosAutoData.find((da) => da.id_datos_auto === usuarioAutomovil.id_datos_auto);

        // Asignar valores a los campos
        nombreEstudianteInput.value = `${usuario.nombre} ${usuario.apellidos}`;
        autoInput.value = `${datosAuto.marca.nombre_marca} ${datosAuto.modelo.nombre_modelo} ${datosAuto.anio.anio}`;
        matriculaInput.value = usuarioAutomovil.placas;
        numeroLugarInput.value = numeroLugarGuardado;

        // Cargar los lugares disponibles en el combobox
        const estacionamientosResponse = await fetch(`${baseUrl}estacionamientos/`);
        const estacionamientosData = await estacionamientosResponse.json();

        estacionamientosData
            .filter((e) => !e.esta_ocupado)
            .forEach((e) => {
                const optionText = e.es_reservado
                    ? `${e.numero_estacionamiento} - Reservado para discapacitados`
                    : `${e.numero_estacionamiento}`;
                muevoNumeroLugarSelect.insertAdjacentHTML(
                    'beforeend',
                    `<option value="${e.id_estacionamiento}">${optionText}</option>`
                );
            });

        muevoNumeroLugarSelect.disabled = false;
    } catch (error) {
        console.error('Error al cargar datos:', error);
    }
}

// Función para habilitar edición
btnEditar.addEventListener('click', () => {
    muevoNumeroLugarSelect.removeAttribute('disabled');
    btnGuardar.classList.remove('d-none');
    btnEditar.classList.add('d-none');
});

// Función para guardar cambios
btnGuardar.addEventListener('click', async () => {
    try {
        const nuevoIdEstacionamiento = muevoNumeroLugarSelect.value;

        // Obtener datos del nuevo estacionamiento
        const nuevoEstacionamientoResponse = await fetch(`${baseUrl}estacionamientos/${nuevoIdEstacionamiento}/`);
        if (!nuevoEstacionamientoResponse.ok) {
            throw new Error('Error al obtener datos del nuevo estacionamiento.');
        }
        const nuevoEstacionamientoData = await nuevoEstacionamientoResponse.json();

        // Actualizar historial con el nuevo id_estacionamiento
        const actualizarHistorial = await fetch(`${baseUrl}historial/${historialGuardado.id_historial}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...historialGuardado,
                id_estacionamiento: nuevoIdEstacionamiento,
            }),
        });

        if (!actualizarHistorial.ok) {
            throw new Error('Error al actualizar el historial.');
        }

        // Marcar el nuevo estacionamiento como ocupado
        const actualizarNuevoEstacionamiento = await fetch(`${baseUrl}estacionamientos/${nuevoIdEstacionamiento}/`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...nuevoEstacionamientoData,
                esta_ocupado: true,
            }),
        });

        if (!actualizarNuevoEstacionamiento.ok) {
            throw new Error('Error al actualizar el nuevo estacionamiento.');
        }

        // Obtener datos del estacionamiento actual (el que se va a liberar)
        const estacionamientoActualResponse = await fetch(`${baseUrl}estacionamientos/`);
        if (!estacionamientoActualResponse.ok) {
            throw new Error('Error al obtener datos del estacionamiento actual.');
        }
        const estacionamientosData = await estacionamientoActualResponse.json();
        const estacionamientoActual = estacionamientosData.find(
            (e) => e.numero_estacionamiento === parseInt(numeroLugarGuardado)
        );

        // Validar que se encontró el estacionamiento actual
        if (!estacionamientoActual) {
            throw new Error('No se encontró el estacionamiento actual en la API.');
        }

        // Liberar el estacionamiento actual
        const liberarEstacionamientoActual = await fetch(
            `${baseUrl}estacionamientos/${estacionamientoActual.id_estacionamiento}/`,
            {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...estacionamientoActual,
                    esta_ocupado: false, // Cambiar el estado de ocupación
                }),
            }
        );

        if (!liberarEstacionamientoActual.ok) {
            throw new Error('Error al liberar el estacionamiento actual.');
        }

        alert('Cambio de lugar exitoso.');
        window.location.href = 'gestion_espacio.html';
    } catch (error) {
        console.error('Error al guardar cambios:', error);
        alert('Hubo un problema al procesar los cambios. Inténtalo nuevamente.');
    }
});


// Cargar datos al iniciar
document.addEventListener('DOMContentLoaded', cargarDatos);
