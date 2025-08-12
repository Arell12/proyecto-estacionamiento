// Obtener referencia a los elementos HTML
const profileImage = document.getElementById("profile-image");
const controlNumber = document.getElementById("control-number");
const fullName = document.getElementById("full-name");
const birthDate = document.getElementById("birth-date");
const phone = document.getElementById("phone");
const email = document.getElementById("email");
const capacidadDiferente = document.getElementById("capacidad-diferente");
const vehicleBrand = document.getElementById("vehicle-brand");
const vehicleModel = document.getElementById("vehicle-model");
const vehicleYear = document.getElementById("vehicle-year");
const vehiclePlate = document.getElementById("vehicle-plate");

// Obtener userData desde localStorage
const userData = JSON.parse(localStorage.getItem("user"));
const userId = userData?.id_usuario;

// Base URL desde config.js
const apiBaseUrl = window.config.apiBaseUrl;

// Validar userId
/* if (!userId) {
    console.error("El ID del usuario no se obtuvo correctamente. Verifica el almacenamiento en localStorage.");
} */

// Función para cargar información del usuario
async function loadUserInfo() {
    try {
        const response = await fetch(`${apiBaseUrl}usuarios/${userId}/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const user = await response.json();

        profileImage.src = user.foto_perfil || "https://freesvg.org/img/abstract-user-flat-4.png";
        controlNumber.value = user.numero_control;
        fullName.value = `${user.nombre} ${user.apellidos}`;
        birthDate.value = user.fecha_nacimiento;
        phone.value = user.telefono;
        email.value = user.correo_electronico;
        capacidadDiferente.value = user.capacidades_diferentes ? "Sí" : "No";
    } catch (error) {
        console.error("Error cargando la información del usuario:", error);
    }
}

// Función para cargar información del vehículo
async function loadVehicleInfo() {
    try {
        // console.log("Cargando información del vehículo...");
        const vehicleBrand = document.getElementById("vehicle-brand");
        const vehicleModel = document.getElementById("vehicle-model");
        const vehicleYear = document.getElementById("vehicle-year");
        const vehiclePlate = document.getElementById("vehicle-plate");

        // console.log("Elementos del DOM para el vehículo:", {
        //     vehicleBrand,
        //     vehicleModel,
        //     vehicleYear,
        //     vehiclePlate,
        // });

        if (!vehicleBrand || !vehicleModel || !vehicleYear || !vehiclePlate) {
            throw new Error("No se encontraron todos los elementos del DOM para el vehículo.");
        }

        const response = await fetch(`${apiBaseUrl}usuario-automovil/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const vehicles = await response.json();

        // console.log("Datos obtenidos de la API de vehículos:", vehicles);

        // Buscar el vehículo correspondiente al usuario
        const userVehicle = vehicles.find(vehicle => vehicle.id_usuario === userId);

        if (userVehicle) {
            // console.log("Vehículo encontrado para el usuario:", userVehicle);

            // Obtener datos del vehículo
            const { marca, modelo, anio } = userVehicle.datos_auto || {};
            const placas = userVehicle.placas; 

            // console.log("Placas obtenidas:", placas);

            vehicleBrand.textContent = marca?.nombre_marca || "No especificado";
            vehicleModel.textContent = modelo?.nombre_modelo || "No especificado";
            vehicleYear.textContent = anio?.anio || "No especificado";
            vehiclePlate.textContent = placas || "Sin matrícula";
        } else {
            console.warn("No se encontró un vehículo para el usuario con ID:", userId);
            vehicleBrand.textContent = "No especificado";
            vehicleModel.textContent = "No especificado";
            vehicleYear.textContent = "No especificado";
            vehiclePlate.textContent = "Sin matrícula";
        }
    } catch (error) {
        console.error("Error cargando la información del vehículo:", error);
    }
}

// Botón para editar vehículo
document.getElementById('edit-vehicle').addEventListener('click', () => {
    window.location.href = "editar_vehiculo.html";
});

// --- Código para cambio de contraseña ---

// Referencias a elementos del modal de cambiar contraseña
const submitPasswordChangeBtn = document.getElementById('submit-password-change');
const newPasswordInput = document.getElementById('new-password');
const confirmPasswordInput = document.getElementById('confirm-password');
const passwordErrorDiv = document.getElementById('password-error');
const passwordSuccessDiv = document.getElementById('password-success');

// Función para actualizar la contraseña
async function updatePasswordForUser(userId, newPassword) {
    try {
        // Obtener todas las credenciales
        const response = await fetch(`${apiBaseUrl}credenciales/`);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);

        const credenciales = await response.json();
        // Encontrar la credencial del usuario actual
        const credencialUsuario = credenciales.find(c => c.id_usuario === userId);

        if (!credencialUsuario) {
            throw new Error("No se encontró una credencial para este usuario.");
        }

        const id_credencial = credencialUsuario.id_credencial;
        const datosActualizados = {
            id_credencial: credencialUsuario.id_credencial,
            id_usuario: credencialUsuario.id_usuario,
            contrasena: newPassword
        };

        // Actualizar la credencial mediante PUT
        const updateResponse = await fetch(`${apiBaseUrl}credenciales/${id_credencial}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosActualizados)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            throw new Error(`Error actualizando contraseña: ${errorText}`);
        }

        return true;
    } catch (error) {
        console.error("Error actualizando la contraseña:", error);
        throw error;
    }
}

// Evento al hacer clic en "Enviar" (cambiar contraseña)
submitPasswordChangeBtn.addEventListener('click', async () => {
    passwordErrorDiv.style.display = 'none';
    passwordSuccessDiv.style.display = 'none';

    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();

    // Validar contraseñas
    if (!newPassword || !confirmPassword) {
        passwordErrorDiv.textContent = 'Por favor, completa ambos campos.';
        passwordErrorDiv.style.display = 'block';
        return;
    }

    if (newPassword !== confirmPassword) {
        passwordErrorDiv.textContent = 'Las contraseñas no coinciden.';
        passwordErrorDiv.style.display = 'block';
        return;
    }

    try {
        // Intentar actualizar la contraseña
        const resultado = await updatePasswordForUser(userId, newPassword);
        if (resultado) {
            passwordSuccessDiv.textContent = 'Contraseña actualizada con éxito.';
            passwordSuccessDiv.style.display = 'block';

            // Limpiar inputs
            newPasswordInput.value = '';
            confirmPasswordInput.value = '';

            // Cerrar modal luego de 2 segundos (opcional)
            setTimeout(() => {
                const modalElement = document.getElementById('changePasswordModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                if (modal) {
                    modal.hide();
                }
            }, 2000);
        }
    } catch (error) {
        passwordErrorDiv.textContent = `Error: ${error.message}`;
        passwordErrorDiv.style.display = 'block';
    }
});

// Llamar a las funciones al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    // console.log("Base URL:", apiBaseUrl); // Confirmar si apiBaseUrl está disponible
    // console.log("User ID:", userId);   // Confirmar si userId es válido
    loadUserInfo();
    loadVehicleInfo();
});
