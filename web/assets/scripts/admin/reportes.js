// Obtenemos la URL base desde config.js
const baseUrl = window.config.apiBaseUrl;
const reportsTable = document.getElementById('reportsTable');

// Cargar todos los reportes al iniciar
async function cargarReportes() {
    try {
        const response = await fetch(`${baseUrl}reportes/`);
        const reportes = await response.json();

        if (response.ok) {
            reportsTable.innerHTML = '';
            reportes.forEach((reporte, index) => {
                const row = document.createElement('tr');

                // Determinar el estado del reporte
                let estado = '';
                if (reporte.esta_solucionado) {
                    estado = 'Solucionado';
                } else if (reporte.esta_proceso) {
                    estado = 'En Proceso';
                } else {
                    estado = 'Pendiente';
                }

                // Encargado (mostrar siempre nombre y apellido si existe)
                let encargado = '-';
                if (reporte.usuario_resuelve && reporte.usuario_resuelve.nombre && reporte.usuario_resuelve.apellidos) {
                    encargado = `${reporte.usuario_resuelve.nombre} ${reporte.usuario_resuelve.apellidos}`;
                }

                // Acciones
                let acciones = '';
                if (estado === 'Pendiente' || estado === 'En Proceso') {
                    acciones = `
                        <button class="btn btn-success btn-sm" onclick="marcarComoResuelto(${reporte.id_reporte})">
                            Marcar como Resuelto
                        </button>
                    `;
                } else {
                    acciones = 'Sin acciones';
                }

                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${reporte.estacionamiento.numero_estacionamiento}</td>
                    <td>${reporte.descripcion_problema}</td>
                    <td>${estado}</td>
                    <td>${encargado}</td>
                    <td>${acciones}</td>
                `;
                reportsTable.appendChild(row);
            });
        } else {
            alert('Error al cargar los reportes.');
        }
    } catch (error) {
        console.error('Error al obtener los reportes:', error);
        alert('Error al obtener los reportes.');
    }
}

// Función para obtener un reporte por ID
async function obtenerReportePorId(id_reporte) {
    const response = await fetch(`${baseUrl}reportes/${id_reporte}/`);
    const data = await response.json();
    return data;
}

// Función para marcar un reporte como resuelto
async function marcarComoResuelto(id_reporte) {
    const confirmAction = confirm('¿Está seguro de marcar este reporte como resuelto?');
    if (!confirmAction) return;

    // Obtener datos del reporte actual
    const reporte = await obtenerReportePorId(id_reporte);

    // Actualizar el reporte: solo cambiamos esta_solucionado a true
    const bodyData = {
        id_usuario_reporta: reporte.id_usuario_reporta,
        id_usuario_resuelve: reporte.id_usuario_resuelve,
        id_estacionamiento: reporte.id_estacionamiento,
        id_tipo_incidencia: reporte.id_tipo_incidencia,
        descripcion_problema: reporte.descripcion_problema,
        fotografia: reporte.fotografia,
        fecha_creacion: reporte.fecha_creacion,
        esta_solucionado: true,        // Aquí marcamos como solucionado
        esta_proceso: reporte.esta_proceso
    };

    try {
        const response = await fetch(`${baseUrl}reportes/${id_reporte}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            alert('Reporte marcado como resuelto exitosamente.');
            cargarReportes(); // Recargar la tabla
        } else {
            alert('Error al marcar el reporte como resuelto.');
        }
    } catch (error) {
        alert('Error al marcar el reporte como resuelto.');
    }
}

// Cargar los reportes al iniciar
cargarReportes();
