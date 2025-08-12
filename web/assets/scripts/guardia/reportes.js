const baseUrl = window.config.apiBaseUrl;
const incidenciasTabla = document.getElementById('incidenciasTabla');
const filtroEstado = document.getElementById('filtroEstadoIncidencia');
const buscarIncidencia = document.getElementById('buscarIncidencia');

// Función para cargar datos desde la API
async function cargarIncidencias() {
    try {
        const response = await fetch(`${baseUrl}reportes/`);
        if (!response.ok) {
            throw new Error('Error al obtener las incidencias.');
        }

        const reportes = await response.json();
        renderTabla(reportes);
    } catch (error) {
        console.error('Error al cargar incidencias:', error);
    }
}

// Función para renderizar la tabla
function renderTabla(reportes) {
    incidenciasTabla.innerHTML = '';

    reportes.forEach((reporte) => {
        const numeroEspacio = reporte.estacionamiento.numero_estacionamiento;
        const tipoIncidencia = reporte.tipo_incidencia.nombre;
        let estado = '';

        if (reporte.esta_solucionado) {
            estado = '<span class="badge bg-success badge-custom">Resuelta</span>';
        } else if (reporte.esta_proceso) {
            estado = '<span class="badge bg-danger text-dark badge-custom">En Proceso</span>';
        } else {
            estado = '<span class="badge bg-warning text-dark badge-custom">Pendiente</span>';
        }

        const estadoTexto = reporte.esta_solucionado
            ? 'resuelta'
            : reporte.esta_proceso
            ? 'en_proceso'
            : 'pendiente';

        const fila = `
            <tr data-estado="${estadoTexto}">
                <td>${numeroEspacio}</td>
                <td>${tipoIncidencia}</td>
                <td>${estado}</td>
                <td>
                    <a href="detalles_incidencia.html" class="btn btn-sm btn-info-custom btn-detalles" 
                       data-id-reporte="${reporte.id_reporte}" 
                       data-id-usuario-reporta="${reporte.id_usuario_reporta}" 
                       data-id-usuario-resuelve="${reporte.id_usuario_resuelve}" 
                       data-id-estacionamiento="${reporte.id_estacionamiento}" 
                       data-id-tipo-incidencia="${reporte.id_tipo_incidencia}" 
                       data-descripcion="${reporte.descripcion_problema}" 
                       data-fotografia="${reporte.fotografia}" 
                       data-fecha-creacion="${reporte.fecha_creacion}" 
                       data-esta-solucionado="${reporte.esta_solucionado}" 
                       data-esta-proceso="${reporte.esta_proceso}">
                        Detalles
                    </a>
                </td>
            </tr>
        `;

        incidenciasTabla.insertAdjacentHTML('beforeend', fila);
    });

    // Añadir evento a los botones "Detalles"
document.querySelectorAll('.btn-detalles').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();

        const id_usuario_resuelve_attr = btn.getAttribute('data-id-usuario-resuelve');
        const id_usuario_resuelve = id_usuario_resuelve_attr ? parseInt(id_usuario_resuelve_attr, 10) : null;

        const datos = {
            id_reporte: parseInt(btn.getAttribute('data-id-reporte'), 10),
            id_usuario_reporta: parseInt(btn.getAttribute('data-id-usuario-reporta'), 10),
            id_usuario_resuelve: id_usuario_resuelve,
            id_estacionamiento: parseInt(btn.getAttribute('data-id-estacionamiento'), 10),
            id_tipo_incidencia: parseInt(btn.getAttribute('data-id-tipo-incidencia'), 10),
            descripcion_problema: btn.getAttribute('data-descripcion'),
            fotografia: btn.getAttribute('data-fotografia'),
            fecha_creacion: btn.getAttribute('data-fecha-creacion'),
            esta_solucionado: btn.getAttribute('data-esta-solucionado') === 'true',
            esta_proceso: btn.getAttribute('data-esta-proceso') === 'true',
        };

        // Para depuración
        console.log('Datos guardados en localStorage:', datos);

        localStorage.setItem('incidenciaSeleccionada', JSON.stringify(datos));
        window.location.href = 'detalles_incidencia.html';
    });
});

}


// Función para filtrar las incidencias
function filtrarIncidencias() {
    const estadoFiltro = filtroEstado.value.toLowerCase();
    const busquedaFiltro = buscarIncidencia.value.toLowerCase();

    const filas = incidenciasTabla.querySelectorAll('tr');
    filas.forEach((fila) => {
        const numeroEspacio = fila.children[0].textContent.toLowerCase();
        const estadoFila = fila.dataset.estado;

        const coincideEstado = !estadoFiltro || estadoFila.includes(estadoFiltro);
        const coincideBusqueda = !busquedaFiltro || numeroEspacio.includes(busquedaFiltro);

        fila.style.display = coincideEstado && coincideBusqueda ? '' : 'none';
    });
}

// Inicializar la tabla y los eventos
document.addEventListener('DOMContentLoaded', () => {
    cargarIncidencias();

    filtroEstado.addEventListener('change', filtrarIncidencias);
    buscarIncidencia.addEventListener('input', filtrarIncidencias);
});
