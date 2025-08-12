import { storage, ref, uploadBytes, getDownloadURL } from '../../scripts/firebaseConfig.js';

// Referencias al DOM
const photoUploadInput = document.getElementById('photo-upload');
const profileImage = document.getElementById('profile-image');
const userId = JSON.parse(localStorage.getItem('user'))?.id_usuario; // Obtener el ID del usuario

// Función para subir la imagen a Firebase
async function uploadPhoto(file) {
    try {
        if (!file) throw new Error("No se seleccionó ningún archivo.");

        // Crear un nombre único para la imagen
        const uniqueFileName = `img_perfiles/${userId}_${Date.now()}_${file.name}`;
        const imageRef = ref(storage, uniqueFileName);

        // Subir el archivo a Firebase Storage
        await uploadBytes(imageRef, file);
        console.log("Imagen subida con éxito a Firebase.");

        // Obtener la URL de descarga
        const downloadURL = await getDownloadURL(imageRef);
        console.log("URL de descarga:", downloadURL);

        // Actualizar la foto de perfil en la API
        await updateProfilePhoto(downloadURL);

        // Actualizar la imagen en el DOM
        profileImage.src = downloadURL;
        alert("Foto de perfil actualizada con éxito.");
    } catch (error) {
        console.error("Error al subir la foto:", error);
        alert("Error al subir la foto. Por favor, inténtalo de nuevo.");
    }
}

// Función para actualizar la foto de perfil en la API
async function updateProfilePhoto(photoURL) {
    try {
        // Obtener los datos actuales del usuario
        const userResponse = await fetch(`${window.config.apiBaseUrl}usuarios/${userId}/`);
        if (!userResponse.ok) throw new Error(`Error al obtener datos del usuario: ${userResponse.statusText}`);
        const userData = await userResponse.json();

        // Actualizar solo la foto de perfil
        userData.foto_perfil = photoURL;

        // Enviar los datos actualizados al servidor
        const response = await fetch(`${window.config.apiBaseUrl}usuarios/${userId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) throw new Error(`Error al actualizar la foto en la API: ${response.statusText}`);
        console.log("Foto de perfil actualizada en la API.");
    } catch (error) {
        console.error("Error al actualizar la foto en la API:", error);
        throw error;
    }
}

// Escuchar el evento de cambio en el input de archivo
photoUploadInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    uploadPhoto(file);
});
