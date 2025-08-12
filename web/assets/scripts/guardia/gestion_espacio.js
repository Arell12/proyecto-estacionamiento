// Base URL de la API obtenida desde config.js
const baseUrl = window.config.apiBaseUrl;

// Elementos DOM
const espaciosTabla = document.getElementById('espaciosTabla');
const filtroEstado = document.getElementById('filtroEstado');
const filtroBusqueda = document.getElementById('filtroBusqueda');
const btnBuscar = document.getElementById('btnBuscar');

// Función para obtener datos de la API
async function fetchEspacios() {
    try {
        const response = await fetch(`${baseUrl}estacionamientos/`);
        if (!response.ok) throw new Error('Error al obtener los datos.');
        return await response.json();
    } catch (error) {
        console.error(error);
        alert('No se pudieron cargar los espacios.');
        return [];
    }
}

// Función para renderizar la tabla
function renderTabla(espacios) {
    espaciosTabla.innerHTML = ''; // Limpiar tabla
    espacios.forEach((espacio) => {
        const estado = espacio.esta_ocupado ? 'Ocupado' : 'Disponible';
        const badgeClass = espacio.esta_ocupado ? 'bg-danger' : 'bg-success';

        const acciones = espacio.esta_ocupado
            ? `<a href="detalles_espacio.html" class="btn btn-sm btn-info btn-detalles" 
                    data-id="${espacio.id_estacionamiento}" 
                    data-numero="${espacio.numero_estacionamiento}">
                    Detalles
                </a>`
            : '-';

        const row = `
            <tr data-estado="${estado.toLowerCase()}">
                <td>${espacio.numero_estacionamiento}</td>
                <td><span class="badge ${badgeClass}">${estado}</span></td>
                <td>${acciones}</td>
            </tr>
        `;
        espaciosTabla.insertAdjacentHTML('beforeend', row);
    });

    // Añadir evento a los botones de "Detalles"
    document.querySelectorAll('.btn-detalles').forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const idEstacionamiento = btn.getAttribute('data-id');
            const numeroEstacionamiento = btn.getAttribute('data-numero');

            // Guardar ID y número de espacio en localStorage
            localStorage.setItem('idEstacionamiento', idEstacionamiento);
            localStorage.setItem('numeroEstacionamiento', numeroEstacionamiento);

            // Redirigir a la página de detalles
            window.location.href = 'detalles_espacio.html';
        });
    });
}

// Función para filtrar datos en la tabla
function filtrarTabla() {
    const estadoFiltro = filtroEstado.value.toLowerCase();
    const busquedaFiltro = filtroBusqueda.value.toLowerCase();

    const filas = espaciosTabla.querySelectorAll('tr');
    filas.forEach((fila) => {
        const estado = fila.getAttribute('data-estado');
        const numero = fila.children[0].textContent.toLowerCase();

        const coincideEstado = estadoFiltro ? estado.includes(estadoFiltro) : true;
        const coincideBusqueda = numero.includes(busquedaFiltro);

        fila.style.display = coincideEstado && coincideBusqueda ? '' : 'none';
    });
}

// Inicializar tabla al cargar la página
document.addEventListener('DOMContentLoaded', async () => {
    const espacios = await fetchEspacios();
    renderTabla(espacios);

    // Añadir eventos de filtrado
    filtroEstado.addEventListener('change', filtrarTabla);
    filtroBusqueda.addEventListener('input', filtrarTabla);
    btnBuscar.addEventListener('click', filtrarTabla);
});
