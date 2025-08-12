// Obtén la URL base desde config.js
const baseUrl = window.config.apiBaseUrl;
const user = JSON.parse(localStorage.getItem('user'));
const userId = user ? user.id_usuario : null;

// Elementos del DOM
const peakHourTable = document.getElementById('peakHourTable');
const dayInput = document.getElementById('dayInput');
const horaInicioInput = document.getElementById('horaInicioInput');
const horaFinInput = document.getElementById('horaFinInput');
const editHoraPicoId = document.getElementById('editHoraPicoId');
const saveButton = document.getElementById('saveButton');

// Referencia al modal Bootstrap
const hourModalEl = document.getElementById('hourModal');
const hourModal = new bootstrap.Modal(hourModalEl);

// Cargar todas las horas pico al iniciar
async function cargarHorasPico() {
    try {
        const response = await fetch(`${baseUrl}horaspico/`);
        const horasPico = await response.json();

        if (response.ok) {
            peakHourTable.innerHTML = '';
            horasPico.forEach((horaPico, index) => {
                const row = document.createElement('tr');

                // Formato de hora para mostrar (HH:MM)
                const horaInicioFormatted = horaPico.hora_inicio.slice(0,5); // "HH:MM"
                const horaFinFormatted = horaPico.hora_fin.slice(0,5); // "HH:MM"

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${horaPico.dia}</td>
                    <td>${horaInicioFormatted} - ${horaFinFormatted}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editarHoraPico(${horaPico.id_hora_pico})">
                            <i class="bi bi-pencil"></i> Editar
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="confirmarEliminarHoraPico(${horaPico.id_hora_pico})">
                            <i class="bi bi-trash"></i> Eliminar
                        </button>
                    </td>
                `;
                peakHourTable.appendChild(row);
            });
        } else {
            alert('Error al cargar las horas pico.');
        }
    } catch (error) {
        console.error('Error al obtener las horas pico:', error);
        alert('Error al obtener las horas pico.');
    }
}

// Función para obtener datos de una hora pico por ID
async function obtenerHoraPicoPorId(id_hora_pico) {
    const response = await fetch(`${baseUrl}horaspico/${id_hora_pico}/`);
    return await response.json();
}

// Abrir modal para editar una hora pico
async function editarHoraPico(id_hora_pico) {
    const horaPico = await obtenerHoraPicoPorId(id_hora_pico);

    // Asignar valores al modal
    dayInput.value = horaPico.dia || '';
    horaInicioInput.value = horaPico.hora_inicio.slice(0,5) || '';
    horaFinInput.value = horaPico.hora_fin.slice(0,5) || '';
    editHoraPicoId.value = horaPico.id_hora_pico;

    hourModal.show();
}

// Confirmar antes de eliminar una hora pico
function confirmarEliminarHoraPico(id_hora_pico) {
    const confirmDelete = confirm('¿Está seguro de que desea eliminar esta hora pico?');
    if (confirmDelete) {
        eliminarHoraPico(id_hora_pico);
    }
}

// Función para eliminar una hora pico
async function eliminarHoraPico(id_hora_pico) {
    try {
        const response = await fetch(`${baseUrl}horaspico/${id_hora_pico}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Hora pico eliminada');
            cargarHorasPico();
        } else {
            alert('Error al eliminar la hora pico');
        }
    } catch (error) {
        alert('Error al eliminar la hora pico');
    }
}

// Guardar cambios (crear o editar) al presionar el botón "Guardar"
saveButton.addEventListener('click', async () => {
    const dia = dayInput.value.trim();
    const hora_inicio = horaInicioInput.value.trim() + ':00'; // Asegurar formato HH:MM:SS
    const hora_fin = horaFinInput.value.trim() + ':00';
    const id_hora_pico = editHoraPicoId.value;

    if (!dia || !hora_inicio || !hora_fin) {
        alert('Por favor, complete todos los campos.');
        return;
    }

    const bodyData = {
        id_usuario: userId,
        dia,
        hora_inicio,
        hora_fin
    };

    try {
        let response;
        if (id_hora_pico) {
            // Actualizar hora pico existente (PUT)
            response = await fetch(`${baseUrl}horaspico/${id_hora_pico}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });
        } else {
            // Crear nueva hora pico (POST)
            response = await fetch(`${baseUrl}horaspico/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(bodyData)
            });
        }

        if (response.ok) {
            alert(id_hora_pico ? 'Hora pico actualizada exitosamente' : 'Hora pico creada exitosamente');
            cargarHorasPico();
            hourModal.hide();
        } else {
            alert('Error al guardar la hora pico');
        }
    } catch (error) {
        alert('Error al guardar la hora pico');
    }
});

// Preparar el modal para agregar nueva hora pico
document.getElementById('addPeakHourBtn').addEventListener('click', () => {
    dayInput.value = '';
    horaInicioInput.value = '';
    horaFinInput.value = '';
    editHoraPicoId.value = '';
});

// Cargar las horas pico al iniciar
cargarHorasPico();
