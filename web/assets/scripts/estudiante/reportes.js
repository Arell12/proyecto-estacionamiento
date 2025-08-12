const apiBaseUrl = window.config.apiBaseUrl;

const userData = JSON.parse(localStorage.getItem('user'));
const userId = userData?.id_usuario;

// Referencia al cuerpo de la tabla
const reportsTbody = document.getElementById('reports-tbody');

// Función para cargar los reportes
async function loadReports() {
    try {
        // Obtener reportes del usuario actual
        const reportsResponse = await fetch(`${apiBaseUrl}reportes/`);
        const reports = await reportsResponse.json();
        const userReports = reports.filter(report => report.id_usuario_reporta == userId);

        // Verificar si no hay reportes asociados al usuario
        if (!userReports.length) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="4" class="text-center text-muted">No se encontraron reportes asociados al usuario.</td>
            `;
            reportsTbody.appendChild(row);
            return; // Salir de la función
        }

        // Generar filas dinámicas para cada reporte
        for (const report of userReports) {
            const parkingResponse = await fetch(`${apiBaseUrl}estacionamientos/${report.id_estacionamiento}/`);
            const parkingData = await parkingResponse.json();

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(report.fecha_creacion)}</td>
                <td>${parkingData.numero_estacionamiento}</td>
                <td>${report.descripcion_problema}</td>
                <td>${determineStatus(report.esta_proceso, report.esta_solucionado)}</td>
            `;
            reportsTbody.appendChild(row);
        }
    } catch (error) {
        console.error("Error al cargar los reportes:", error);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="4" class="text-center text-danger">Error al cargar los reportes.</td>
        `;
        reportsTbody.appendChild(row);
    }
}

// Función para formatear fechas en DD/MM/YYYY
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return date.toLocaleDateString(undefined, options);
}

// Función para determinar el estado del reporte
function determineStatus(inProcess, solved) {
    if (!inProcess && !solved) {
        return '<span class="badge bg-warning">Pendiente</span>';
    } else if (inProcess && !solved) {
        return '<span class="badge bg-danger">En Proceso</span>';
    } else if (solved) {
        return '<span class="badge bg-success">Resuelto</span>';
    }
    return '<span class="badge bg-secondary">Desconocido</span>'; // En caso de error
}

// Inicializar
document.addEventListener('DOMContentLoaded', loadReports);
