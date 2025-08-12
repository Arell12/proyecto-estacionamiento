// Configuración inicial: obtén la URL base desde config.js
const baseUrl = window.config.apiBaseUrl; // Define 'apiBaseUrl' en config.js

// Lógica del formulario de login
document.getElementById('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const numeroControl = document.getElementById('numeroControl').value;
    const contraseña = document.getElementById('contraseña').value;

    if (!numeroControl || !contraseña) {
        alert('Por favor, completa todos los campos.');
        return;
    }

    // Mostrar mensaje de carga
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('loadingMessage').style.display = 'block';

    try {
        // Enviar datos a la API
        const response = await fetch(`${baseUrl}login/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                numero_control: numeroControl,
                contrasena: contraseña
            })
        });

        const data = await response.json();

        if (response.ok) {
            // Validar rol de estudiante
            if (data.rol === 'Estudiante') {
                // Guardar id_usuario y otros datos en localStorage para futuras sesiones
                const userData = {
                    id_usuario: data.id_usuario,
                    numero_control: data.numero_control,
                    nombre: data.nombre,
                    rol: data.rol
                };
                localStorage.setItem('user', JSON.stringify(userData)); // Guardar datos

                alert(`¡Bienvenido, ${data.nombre}!`);
                window.location.href = 'estacionamiento.html'; // Redirigir a la página de estudiantes
            } else {
                alert('Acceso denegado. Solo los estudiantes pueden iniciar sesión.');
                resetForm();
            }
        } else {
            alert(data.error || 'Credenciales inválidas.');
            resetForm();
        }
    } catch (error) {
        alert('Error de conexión. Inténtalo más tarde.');
        resetForm();
    }
});

// Lógica para el botón "Recuperar Contraseña"
document.getElementById('recoverPassword').addEventListener('click', async () => {
    const email = document.getElementById('email').value; // Obtener el valor del campo de correo

    if (!email) {
        alert('Por favor, ingresa un correo electrónico válido.');
        return;
    }

    try {
        // Mostrar mensaje de carga (opcional: si tienes un spinner)
        const recoverButton = document.getElementById('recoverPassword');
        recoverButton.disabled = true; // Desactiva el botón para evitar múltiples clics
        recoverButton.textContent = "Enviando...";

        // Petición a la API
        const response = await fetch(`${baseUrl}recuperar-contrasena/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ correo_electronico: email })
        });

        const data = await response.json();

        if (response.ok) {
            // Éxito: mostrar mensaje al usuario
            alert(data.mensaje);
            // Cerrar el modal si es necesario
            const modalElement = document.getElementById('forgotPasswordModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();
        } else {
            // Manejo de errores
            alert(data.error || 'No se pudo procesar la solicitud. Inténtalo más tarde.');
        }
    } catch (error) {
        alert('Error de conexión. Por favor, inténtalo más tarde.');
    } finally {
        // Restaurar el estado del botón
        recoverButton.disabled = false;
        recoverButton.textContent = "Recuperar Contraseña";
    }
});

// Restablecer el formulario y ocultar el mensaje de carga
function resetForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('loadingMessage').style.display = 'none';
}
