// Obtén la URL base desde config.js
const baseUrl = window.config.apiBaseUrl;
const user = JSON.parse(localStorage.getItem('user'));
const userId = user ? user.id_usuario : null;

// Elementos del DOM
const eventosTable = document.getElementById('eventosTable').getElementsByTagName('tbody')[0];
const nuevoEventoForm = document.getElementById('nuevoEventoForm');
const editarEventoForm = document.getElementById('editarEventoForm');

// Función para cargar todos los eventos
async function cargarEventos() {
    try {
        const response = await fetch(`${baseUrl}eventos-especiales/`);
        const eventos = await response.json();

        if (response.ok) {
            eventosTable.innerHTML = ''; // Limpiar la tabla antes de cargar

            eventos.forEach(evento => {
                const row = eventosTable.insertRow();
                row.setAttribute('data-id', evento.id_evento);

                row.innerHTML = `
                    <td>${evento.nombre_evento}</td>
                    <td>${evento.fecha_evento}</td>
                    <td>${evento.hora_evento}</td>
                    <td>${evento.descripcion_evento}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-2" onclick="editarEvento(${evento.id_evento})" data-bs-toggle="modal" data-bs-target="#editarEventoModal">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="confirmarEliminarEvento(${evento.id_evento})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;
            });
        } else {
            alert('Error al cargar los eventos.');
        }
    } catch (error) {
        console.error('Error al obtener los eventos:', error);
        alert('Error al obtener los eventos.');
    }
}

// Función para obtener datos de un evento por su ID
async function obtenerEventoPorId(id_evento) {
    const response = await fetch(`${baseUrl}eventos-especiales/${id_evento}/`);
    const data = await response.json();
    return data;
}

// Función para abrir el modal de edición con los datos del evento
async function editarEvento(id_evento) {
    const evento = await obtenerEventoPorId(id_evento);

    // Cargar datos en el modal de edición
    // Verificamos que existan los datos y asignamos valores vacíos si no.
    document.getElementById('editNombreEvento').value = evento.nombre_evento || '';
    document.getElementById('editFechaEvento').value = evento.fecha_evento || '';
    document.getElementById('editHoraEvento').value = evento.hora_evento || '';
    document.getElementById('editDetallesEvento').value = evento.descripcion_evento || '';

    // Al enviar el formulario de edición
    editarEventoForm.onsubmit = async function (e) {
        e.preventDefault();
        await actualizarEvento(id_evento);
    };
}

// Función para actualizar un evento
async function actualizarEvento(id_evento) {
    const nombre_evento = document.getElementById('editNombreEvento').value;
    const fecha_evento = document.getElementById('editFechaEvento').value;
    const hora_evento = document.getElementById('editHoraEvento').value;
    const descripcion_evento = document.getElementById('editDetallesEvento').value;

    try {
        const response = await fetch(`${baseUrl}eventos-especiales/${id_evento}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: userId,
                nombre_evento,
                fecha_evento,
                hora_evento,
                descripcion_evento
            })
        });

        if (response.ok) {
            alert('Evento actualizado exitosamente');
            cargarEventos();
            const modal = bootstrap.Modal.getInstance(document.getElementById('editarEventoModal'));
            modal.hide(); // Cerrar el modal
        } else {
            alert('Error al actualizar el evento');
        }
    } catch (error) {
        alert('Error al actualizar el evento');
    }
}

// Confirmar antes de eliminar un evento
function confirmarEliminarEvento(id_evento) {
    const confirmDelete = confirm('¿Estás seguro de eliminar este evento?');
    if (confirmDelete) {
        eliminarEvento(id_evento);
    }
}

// Función para eliminar un evento
async function eliminarEvento(id_evento) {
    try {
        const response = await fetch(`${baseUrl}eventos-especiales/${id_evento}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Evento eliminado');
            cargarEventos();
        } else {
            alert('Error al eliminar el evento');
        }
    } catch (error) {
        alert('Error al eliminar el evento');
    }
}

// Función para crear un nuevo evento
nuevoEventoForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre_evento = document.getElementById('nombreEvento').value;
    const fecha_evento = document.getElementById('fechaEvento').value;
    const hora_evento = document.getElementById('horaEvento').value;
    const descripcion_evento = document.getElementById('detallesEvento').value;

    try {
        const response = await fetch(`${baseUrl}eventos-especiales/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: userId,
                nombre_evento,
                fecha_evento,
                hora_evento,
                descripcion_evento
            })
        });

        if (response.ok) {
            alert('Evento creado');
            cargarEventos();
            const modal = bootstrap.Modal.getInstance(document.getElementById('nuevoEventoModal'));
            modal.hide(); // Cerrar el modal
        } else {
            alert('Error al crear el evento');
        }
    } catch (error) {
        alert('Error al crear el evento');
    }
});

// Cargar eventos al iniciar
cargarEventos();
