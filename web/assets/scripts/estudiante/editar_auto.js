// editar_auto.js

// Ahora puedes usar apiBaseUrl en tu archivo
const apiBaseUrl = window.config.apiBaseUrl;

const userData = JSON.parse(localStorage.getItem('user'));
const userId = userData?.id_usuario;

// Referencias al DOM
const brandSelect = document.getElementById('vehicle-brand');
const modelSelect = document.getElementById('vehicle-model');
const yearSelect = document.getElementById('vehicle-year');
const plateInput = document.getElementById('vehicle-plate');
const saveChangesBtn = document.getElementById('save-changes');
const cancelBtn = document.getElementById('btnCancelar');
const confirmationMessage = document.getElementById('confirmation-message');

let selectedBrandId = null;
let selectedModelId = null;
let selectedYearId = null;

// Función para cargar las opciones de las APIs
async function loadOptions() {
    try {
        // Cargar marcas
        const brandsResponse = await fetch(`${apiBaseUrl}marcas/`);
        const brands = await brandsResponse.json();
        brands.forEach(brand => {
            const option = document.createElement('option');
            option.value = brand.id_marca;
            option.textContent = brand.nombre_marca;
            brandSelect.appendChild(option);
        });

        // Escuchar cambios en marcas
        brandSelect.addEventListener('change', async () => {
            selectedBrandId = brandSelect.value;
            await loadModels(selectedBrandId);
        });

        // Cargar años
        const yearsResponse = await fetch(`${apiBaseUrl}anios/`);
        const years = await yearsResponse.json();
        years.forEach(year => {
            const option = document.createElement('option');
            option.value = year.id_anio;
            option.textContent = year.anio;
            yearSelect.appendChild(option);
        });

        // Escuchar cambios en el año seleccionado
        yearSelect.addEventListener('change', () => {
            selectedYearId = yearSelect.value;
            console.log("Año seleccionado:", selectedYearId);
        });
    } catch (error) {
        console.error("Error al cargar opciones:", error);
    }
}

// Función para cargar los modelos según la marca seleccionada
async function loadModels(brandId) {
    try {
        modelSelect.innerHTML = '<option value="" disabled selected>Selecciona un modelo</option>';
        const modelsResponse = await fetch(`${apiBaseUrl}modelos/`);
        const models = await modelsResponse.json();
        const filteredModels = models.filter(model => model.id_marca == brandId);
        filteredModels.forEach(model => {
            const option = document.createElement('option');
            option.value = model.id_modelo;
            option.textContent = model.nombre_modelo;
            modelSelect.appendChild(option);
        });

        // Escuchar cambios en el modelo seleccionado
        modelSelect.addEventListener('change', () => {
            selectedModelId = modelSelect.value;
            console.log("Modelo seleccionado:", selectedModelId);
        });
    } catch (error) {
        console.error("Error al cargar modelos:", error);
    }
}

// Función para cargar los datos del vehículo del usuario
async function loadVehicleData() {
    try {
        const response = await fetch(`${apiBaseUrl}usuario-automovil/`);
        const vehicles = await response.json();
        const userVehicle = vehicles.find(vehicle => vehicle.id_usuario == userId);
        if (userVehicle) {
            plateInput.value = userVehicle.placas;
            selectedBrandId = userVehicle.datos_auto.id_marca;
            selectedModelId = userVehicle.datos_auto.id_modelo;
            selectedYearId = userVehicle.datos_auto.id_anio;

            brandSelect.value = selectedBrandId;
            await loadModels(selectedBrandId);
            modelSelect.value = selectedModelId;
            yearSelect.value = selectedYearId;
        }
    } catch (error) {
        console.error("Error al cargar los datos del vehículo:", error);
    }
}

// Función para guardar los cambios
async function saveChanges() {
    try {
        const responseGet = await fetch(`${apiBaseUrl}usuario-automovil/`);
        const vehicles = await responseGet.json();
        const userVehicle = vehicles.find(vehicle => vehicle.id_usuario == userId);

        // Datos que se van a enviar
        const dataAutoData = {
            id_marca: selectedBrandId,
            id_modelo: selectedModelId,
            id_anio: selectedYearId,
        };

        // Si no existe vehículo asociado, creamos uno nuevo
        if (!userVehicle) {
            // Primero creamos datos-auto
            const responseCreateDataAuto = await fetch(`${apiBaseUrl}datos-auto/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataAutoData),
            });

            if (!responseCreateDataAuto.ok) {
                const errorText = await responseCreateDataAuto.text();
                throw new Error(`Error al crear datos del auto: ${responseCreateDataAuto.statusText} - ${errorText}`);
            }

            const createdDataAuto = await responseCreateDataAuto.json();
            const newDataAutoId = createdDataAuto.id_datos_auto;

            // Ahora creamos usuario-automovil
            const vehicleData = {
                id_usuario: userId,
                id_datos_auto: newDataAutoId,
                placas: plateInput.value,
            };

            const responseCreateVehicle = await fetch(`${apiBaseUrl}usuario-automovil/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vehicleData),
            });

            if (!responseCreateVehicle.ok) {
                const errorText = await responseCreateVehicle.text();
                throw new Error(`Error al crear usuario-automovil: ${responseCreateVehicle.statusText} - ${errorText}`);
            }

        } else {
            // Si ya existe vehículo, actualizamos datos
            const vehicleId = userVehicle.id_usuario_automovil;
            const dataAutoId = userVehicle.id_datos_auto;

            // Actualizar la placa en usuario-automovil
            const vehicleData = {
                id_usuario: userId,
                id_datos_auto: dataAutoId,
                placas: plateInput.value,
            };

            const responseVehicle = await fetch(`${apiBaseUrl}usuario-automovil/${vehicleId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(vehicleData),
            });

            if (!responseVehicle.ok) {
                const errorText = await responseVehicle.text();
                throw new Error(`Error al actualizar la placa: ${responseVehicle.statusText} - ${errorText}`);
            }

            // Actualizar marca, modelo y año en datos-auto
            const responseDataAuto = await fetch(`${apiBaseUrl}datos-auto/${dataAutoId}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataAutoData),
            });

            if (!responseDataAuto.ok) {
                const errorText = await responseDataAuto.text();
                console.error("Error al actualizar datos del auto:", errorText);
                throw new Error(`Error al actualizar marca, modelo y año: ${responseDataAuto.statusText} - ${errorText}`);
            }
        }

        // Mostrar mensaje de éxito y redirigir
        confirmationMessage.classList.remove('d-none');
        setTimeout(() => {
            confirmationMessage.classList.add('d-none');
            window.location.href = 'perfil.html';
        }, 2000);

    } catch (error) {
        console.error("Error al guardar los cambios:", error);
        alert("Error al guardar los cambios. Por favor, inténtalo de nuevo.");
    }
}

// Escuchar eventos
saveChangesBtn.addEventListener('click', saveChanges);
cancelBtn.addEventListener('click', () => {
    window.location.href = 'perfil.html';
});

// Inicializar
document.addEventListener('DOMContentLoaded', async () => {
    await loadOptions();
    await loadVehicleData();
});
