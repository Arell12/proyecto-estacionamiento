const apiBaseUrl = window.config.apiBaseUrl;

const controlNumberInput = document.getElementById("controlNumber");
const continuarBtn = document.getElementById("continuarBtn");
const messageEl = document.getElementById("message");
const parkingGrid = document.getElementById("parking-grid");

// Modales
const entradaModal = new bootstrap.Modal(document.getElementById('entradaModal'));
const entradaModalBody = document.getElementById('entradaModalBody');
const salidaModal = new bootstrap.Modal(document.getElementById('salidaModal'));
const salidaModalBody = document.getElementById('salidaModalBody');

// Generar espacios de estacionamiento desde la API
const generateParkingSpaces = async () => {
    parkingGrid.innerHTML = ""; // Limpia el contenido previo
    try {
        const response = await fetch(`${apiBaseUrl}estacionamientos/`);
        const parkingSpaces = await response.json();

        parkingSpaces.forEach((space) => {
            const col = document.createElement("div");
            col.className = "col-6 col-md-3";

            let statusClass = "";
            let statusText = "";
            if (space.esta_ocupado) {
                statusClass = "bg-danger"; // Rojo para ocupado
                statusText = "Ocupado";
            } else if (space.es_reservado) {
                statusClass = "bg-primary"; // Azul para reservado
                statusText = "Reservado";
            } else {
                statusClass = "bg-success"; // Verde para disponible
                statusText = "Disponible";
            }

            col.innerHTML = `
                <div class="parking-space ${statusClass} text-white p-3 text-center rounded shadow-sm">
                    <div>${space.numero_estacionamiento} - ${statusText}</div>
                </div>
            `;
            parkingGrid.appendChild(col);
        });
    } catch (error) {
        console.error("Error al obtener los datos del estacionamiento:", error);
        const errorMessage = document.createElement("p");
        errorMessage.className = "text-danger";
        errorMessage.textContent = "Error al cargar los datos del estacionamiento. Inténtalo más tarde.";
        parkingGrid.appendChild(errorMessage);
    }
};

function mostrarMensaje(texto, exito = false) {
    messageEl.textContent = texto;
    messageEl.style.display = 'block';
    messageEl.className = 'message ' + (exito ? 'message-success' : 'message-error');
}

// Función para obtener la fecha y hora actual en formato deseado
function obtenerFechaHoraActual() {
    const ahora = new Date();
    const fecha = ahora.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = ahora.toTimeString().split(' ')[0]; // HH:MM:SS
    return { fecha, hora };
}

continuarBtn.addEventListener('click', async () => {
    messageEl.style.display = 'none'; // Ocultar mensaje previo
    const numeroControl = controlNumberInput.value.trim();

    // Validación simple: solo verificar que no esté vacío
    if (numeroControl === "") {
        mostrarMensaje('Por favor, ingresa un número de control.');
        return;
    }

    // 1. Buscar usuario
    let usuario;
    try {
        const respUsuarios = await fetch(`${apiBaseUrl}usuarios/`);
        const usuarios = await respUsuarios.json();
        usuario = usuarios.find(u => u.numero_control === numeroControl && u.id_rol === 1);
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        mostrarMensaje('Error interno al buscar usuario.');
        return;
    }

    if (!usuario) {
        // Puede que no exista o su rol no sea 1
        try {
            const respUsuarios = await fetch(`${apiBaseUrl}usuarios/`);
            const usuariosFull = await respUsuarios.json();
            const usuarioNC = usuariosFull.find(u => u.numero_control === numeroControl);
            if (!usuarioNC) {
                mostrarMensaje('Usuario no encontrado.');
            } else if (usuarioNC.id_rol !== 1) {
                mostrarMensaje('Solo los estudiantes tienen acceso a este estacionamiento.');
            }
        } catch (error) {
            console.error('Error al verificar rol usuario:', error);
            mostrarMensaje('Error interno.');
        }
        return;
    }

    const { id_usuario, nombre, apellidos, capacidades_diferentes } = usuario;

    // 2. Buscar usuario-automovil
    let usuarioAutomovil;
    try {
        const respUA = await fetch(`${apiBaseUrl}usuario-automovil/`);
        const usuarioAutomovilList = await respUA.json();
        usuarioAutomovil = usuarioAutomovilList.find(ua => ua.id_usuario === id_usuario);
    } catch (error) {
        console.error('Error al buscar usuario-automovil:', error);
        mostrarMensaje('Error interno al buscar el automóvil del usuario.');
        return;
    }

    if (!usuarioAutomovil) {
        mostrarMensaje('Aún no ha registrado su automóvil.');
        return;
    }

    const { id_usuario_automovil } = usuarioAutomovil;

    // 3. Verificar si existe un historial sin salida (fecha_salida y hora_salida null)
    let historialActual;
    try {
        const respHistorial = await fetch(`${apiBaseUrl}historial/`);
        const historialList = await respHistorial.json();
        historialActual = historialList.find(h => h.id_usuario_automovil === id_usuario_automovil && h.fecha_salida === null && h.hora_salida === null);
    } catch (error) {
        console.error('Error al obtener historial:', error);
        mostrarMensaje('Error interno al verificar historial.');
        return;
    }

    const { fecha, hora } = obtenerFechaHoraActual();

    if (historialActual) {
        // Marcar salida
        const id_historial = historialActual.id_historial;
        const id_estacionamiento = historialActual.id_estacionamiento;

        // Actualizar el historial con fecha_salida y hora_salida
        const updateHistorialData = {
            id_usuario_automovil: historialActual.id_usuario_automovil,
            id_estacionamiento: id_estacionamiento,
            fecha_entrada: historialActual.fecha_entrada,
            hora_entrada: historialActual.hora_entrada,
            fecha_salida: fecha,
            hora_salida: hora
        };

        try {
            const respUpdateHistorial = await fetch(`${apiBaseUrl}historial/${id_historial}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateHistorialData)
            });

            if (!respUpdateHistorial.ok) {
                mostrarMensaje('Error al marcar la salida.');
                return;
            }
        } catch (error) {
            console.error('Error al actualizar historial:', error);
            mostrarMensaje('Error interno al marcar la salida.');
            return;
        }

        // Marcar estacionamiento como libre otra vez
        try {
            const respEst = await fetch(`${apiBaseUrl}estacionamientos/${id_estacionamiento}/`);
            const estacionamiento = await respEst.json();
            const updateEstData = {
                numero_estacionamiento: estacionamiento.numero_estacionamiento,
                es_reservado: estacionamiento.es_reservado,
                esta_ocupado: false
            };

            const respUpdateEst = await fetch(`${apiBaseUrl}estacionamientos/${id_estacionamiento}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateEstData)
            });

            if (!respUpdateEst.ok) {
                mostrarMensaje('Error al actualizar estacionamiento.');
                return;
            }
        } catch (error) {
            console.error('Error al liberar estacionamiento:', error);
            mostrarMensaje('Error interno al liberar estacionamiento.');
            return;
        }

        // Mostrar modal salida
        salidaModalBody.innerHTML = `
            <p><strong>Nombre:</strong> ${nombre} ${apellidos}</p>
            <p><strong>Salida marcada:</strong> ${fecha} ${hora}</p>
            <p>Viaje con cuidado</p>
        `;
        salidaModal.show();
        setTimeout(() => {
            salidaModal.hide();
            controlNumberInput.value = '';
        }, 7000);

    } else {
        // Marcar entrada
        // Buscar estacionamiento disponible
        let estacionamientoDisponible;
        try {
            const respEst = await fetch(`${apiBaseUrl}estacionamientos/`);
            const estacionamientos = await respEst.json();
            estacionamientoDisponible = estacionamientos.find(e => !e.esta_ocupado && e.es_reservado === capacidades_diferentes);
        } catch (error) {
            console.error('Error al buscar estacionamiento disponible:', error);
            mostrarMensaje('Error interno al buscar estacionamiento.');
            return;
        }

        if (!estacionamientoDisponible) {
            mostrarMensaje('Estacionamiento sin espacios.');
            return;
        }

        const { id_estacionamiento, numero_estacionamiento, es_reservado } = estacionamientoDisponible;

        // Marcar estacionamiento como ocupado
        const updateEstData = {
            numero_estacionamiento: numero_estacionamiento,
            es_reservado: es_reservado,
            esta_ocupado: true
        };

        try {
            const respUpdateEst = await fetch(`${apiBaseUrl}estacionamientos/${id_estacionamiento}/`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateEstData)
            });

            if (!respUpdateEst.ok) {
                mostrarMensaje('Error al actualizar estacionamiento.');
                return;
            }
        } catch (error) {
            console.error('Error al actualizar estacionamiento:', error);
            mostrarMensaje('Error interno al actualizar estacionamiento.');
            return;
        }

        // Crear nuevo registro en historial
        const newHistorialData = {
            id_usuario_automovil: id_usuario_automovil,
            id_estacionamiento: id_estacionamiento,
            fecha_entrada: fecha,
            hora_entrada: hora,
            fecha_salida: null,
            hora_salida: null
        };

        try {
            const respCreateHist = await fetch(`${apiBaseUrl}historial/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newHistorialData)
            });

            if (!respCreateHist.ok) {
                mostrarMensaje('Error al crear registro en el historial.');
                return;
            }
        } catch (error) {
            console.error('Error al crear historial:', error);
            mostrarMensaje('Error interno al crear historial.');
            return;
        }

        // Mostrar modal entrada
        entradaModalBody.innerHTML = `
            <p><strong>Bienvenido:</strong> ${nombre} ${apellidos}</p>
            <p><strong>Entrada marcada:</strong> ${fecha} ${hora}</p>
            <p><strong>Número de Estacionamiento:</strong> <span style="font-size:1.5em;">${numero_estacionamiento}</span></p>
        `;
        entradaModal.show();
        setTimeout(() => {
            entradaModal.hide();
            controlNumberInput.value = '';
        }, 7000);
    }

    // Actualizar estado del estacionamiento tras las operaciones
    generateParkingSpaces();
});

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    generateParkingSpaces();
});
