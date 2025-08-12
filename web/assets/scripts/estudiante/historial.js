const apiBaseUrl = window.config.apiBaseUrl;

const userData = JSON.parse(localStorage.getItem('user'));
const userId = userData?.id_usuario;

// Referencias al DOM
const historyTbody = document.getElementById('history-tbody');

// Función para cargar el historial
async function loadHistory() {
    try {
        const userVehicleResponse = await fetch(`${apiBaseUrl}usuario-automovil/`);
        const userVehicles = await userVehicleResponse.json();
        const userVehicle = userVehicles.find(vehicle => vehicle.id_usuario == userId);

        // Si no hay vehículo asociado, termina la ejecución (sin mostrar mensaje)
        if (!userVehicle) {
            return;
        }

        const userVehicleId = userVehicle.id_usuario_automovil;

        const historyResponse = await fetch(`${apiBaseUrl}historial/`);
        const historyData = await historyResponse.json();
        const userHistory = historyData.filter(entry => entry.id_usuario_automovil == userVehicleId);

        // Si no se encuentra historial para el vehículo del usuario
        if (!userHistory.length) {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td colspan="6" class="text-center text-muted">No se encontró historial asociado al usuario.</td>
            `;
            historyTbody.appendChild(row);
            return;
        }

        // Generar filas dinámicas para cada entrada en el historial
        for (const entry of userHistory) {
            const parkingResponse = await fetch(`${apiBaseUrl}estacionamientos/${entry.id_estacionamiento}/`);
            const parkingData = await parkingResponse.json();

            // Si la fecha_salida u hora_salida son null, mostramos '----'
            const fechaSalida = entry.fecha_salida ? formatDate(entry.fecha_salida) : '----';
            const horaSalida = entry.hora_salida ? formatTime(entry.hora_salida) : '----';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatDate(entry.fecha_entrada)}</td>
                <td>${fechaSalida}</td>
                <td>${userVehicle.placas}</td>
                <td>${parkingData.numero_estacionamiento}</td>
                <td>${formatTime(entry.hora_entrada)}</td>
                <td>${horaSalida}</td>
            `;
            historyTbody.appendChild(row);
        }
    } catch (error) {
        console.error("Error al cargar el historial de estacionamiento:", error);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="6" class="text-center text-danger">Error al cargar el historial.</td>
        `;
        historyTbody.appendChild(row);
    }
}

// Función para formatear horas en formato HH:MM AM/PM
function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const hourNumber = parseInt(hour, 10);
    const period = hourNumber >= 12 ? 'PM' : 'AM';
    const formattedHour = hourNumber % 12 || 12;
    return `${formattedHour}:${minute} ${period}`;
}

// Función para formatear fechas en DD/MM/YYYY
function formatDate(dateString) {
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
}

// Inicializar
document.addEventListener('DOMContentLoaded', loadHistory);
