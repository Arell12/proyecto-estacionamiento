import { storage, ref, uploadBytes, getDownloadURL } from "../firebaseConfig.js";

// Configuración inicial
const baseUrl = window.config.apiBaseUrl; // URL base definida en config.js

// Generar espacios de estacionamiento desde la API
const generateParkingSpaces = async () => {
    const grid = document.getElementById("parking-grid");
    grid.innerHTML = ""; // Limpia el contenido previo

    try {
        const response = await fetch(`${baseUrl}estacionamientos/`);
        const parkingSpaces = await response.json();

        parkingSpaces.forEach((space) => {
            const col = document.createElement("div");
            col.className = "col-6 col-md-3";

            let statusClass = "";
            let statusText = "";
            if (space.esta_ocupado) {
                statusClass = "bg-danger"; // Rojo para ocupado
                statusText = "Ocupado";
            } else if (space.es_reservado) {
                statusClass = "bg-primary"; // Azul para reservado
                statusText = "Reservado";
            } else {
                statusClass = "bg-success"; // Verde para disponible
                statusText = "Disponible";
            }

            col.innerHTML = `
                <div class="parking-space ${statusClass} text-white p-3 text-center rounded shadow-sm">
                    <div>${space.numero_estacionamiento} - ${statusText}</div>
                </div>
            `;
            grid.appendChild(col);
        });
    } catch (error) {
        console.error("Error al obtener los datos del estacionamiento:", error);
        const errorMessage = document.createElement("p");
        errorMessage.className = "text-danger";
        errorMessage.textContent = "Error al cargar los datos del estacionamiento. Inténtalo más tarde.";
        grid.appendChild(errorMessage);
    }
};

// Obtener y mostrar eventos especiales
const loadSpecialEvents = async () => {
    const eventsCardBody = document.querySelector("#parking-section .card-custom.bg-success .card-body");
    try {
        const response = await fetch(`${baseUrl}eventos-especiales/`);
        const events = await response.json();
        
        // Obtener fecha local en formato YYYY-MM-DD
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const todayLocal = `${year}-${month}-${day}`;

        
        
        const todaysEvents = events.filter((event) => event.fecha_evento === todayLocal);


        if (todaysEvents.length > 0) {
            eventsCardBody.innerHTML = todaysEvents
                .map(
                    (event) => `
                        <h5 class="card-title">${event.nombre_evento}</h5>
                        <p class="card-text">
                            ${event.descripcion_evento}<br>
                            Fecha: ${event.fecha_evento}<br>
                            Hora: ${event.hora_evento}
                        </p>
                    `
                )
                .join("");
        } else {
            eventsCardBody.innerHTML = `<p class="card-text">No hay eventos programados para hoy</p>`;
        }
    } catch (error) {
        eventsCardBody.innerHTML = `<p class="card-text text-danger">Error al cargar los eventos. Inténtalo más tarde.</p>`;
    }
};


// Obtener y mostrar horas pico
const loadPeakHours = async () => {
    const peakHoursCardBody = document.querySelector("#parking-section .card-custom.bg-info .card-body");

    try {
        const response = await fetch(`${baseUrl}horaspico/`);
        const peakHours = await response.json();

        if (peakHours.length > 0) {
            peakHoursCardBody.innerHTML = `
                <h5 class="card-title">Horas Pico</h5>
                <div class="peak-hours-container">
                    ${peakHours
                        .map(
                            (hour) => `
                            <div class="peak-hour-item">
                                <p class="card-text">
                                    Día: ${hour.dia}<br>
                                    Desde: ${hour.hora_inicio}<br>
                                    Hasta: ${hour.hora_fin}
                                </p>
                            </div>
                        `
                        )
                        .join("")}
                </div>
            `;
        } else {
            peakHoursCardBody.innerHTML = `<p class="card-text">No hay horas pico configuradas</p>`;
        }
    } catch (error) {
        
        peakHoursCardBody.innerHTML = `<p class="card-text text-danger">Error al cargar las horas pico. Inténtalo más tarde.</p>`;
    }
};

// Función para generar un nombre único para las imágenes
const generateUniqueFileName = (fileName) => {
    const timestamp = Date.now();
    return `${timestamp}-${fileName}`;
};

// Subir una imagen a Firebase y obtener la URL
const uploadImageToFirebase = async (file) => {
    try {
        const uniqueFileName = generateUniqueFileName(file.name);
        const storageRef = ref(storage, `img_reportes/${uniqueFileName}`);
        const snapshot = await uploadBytes(storageRef, file);
        return await getDownloadURL(snapshot.ref);
    } catch (error) {
        
        throw new Error("No se pudo subir la imagen.");
    }
};

// Obtener el `id_estacionamiento` correspondiente al `numero_estacionamiento`
const getParkingIdByNumber = async (numeroEstacionamiento) => {
    try {
        const response = await fetch(`${baseUrl}estacionamientos/`);
        if (!response.ok) {
            throw new Error("Error al consultar los estacionamientos.");
        }

        const parkingSpaces = await response.json();
        const estacionamiento = parkingSpaces.find(
            (space) => space.numero_estacionamiento === parseInt(numeroEstacionamiento, 10)
        );

        return estacionamiento ? estacionamiento.id_estacionamiento : null;
    } catch (error) {
        console.error("Error al obtener el ID del estacionamiento:", error);
        throw new Error("No se pudo obtener el estacionamiento.");
    }
};

// Manejar el formulario del reporte
const handleReportForm = () => {
    const reportForm = document.getElementById("reportForm");

    // Asegúrate de que el evento solo se registre una vez
    if (!reportForm.dataset.listener) {
        reportForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const parkingNumber = document.getElementById("parking-number").value;
            const problemDescription = document.getElementById("problem-description").value;
            const photo = document.getElementById("upload-photo").files[0];

            const userData = JSON.parse(localStorage.getItem("user"));
            const userId = userData?.id_usuario;

            if (!userId) {
                alert("Error: Usuario no autenticado. Por favor, inicia sesión nuevamente.");
                return;
            }

            if (!parkingNumber || !problemDescription) {
                alert("Por favor, completa todos los campos obligatorios.");
                return;
            }

            try {
                const parkingId = await getParkingIdByNumber(parkingNumber);
                if (!parkingId) {
                    alert("El estacionamiento no existe. Por favor, verifica el número ingresado.");
                    return;
                }

                let photoURL = null;
                if (photo) {
                    photoURL = await uploadImageToFirebase(photo);
                }

                const reportData = {
                    id_usuario_reporta: userId,
                    id_estacionamiento: parkingId,
                    id_tipo_incidencia: 6, // Ajusta según sea necesario
                    id_usuario_resuelve: 9, // Usuario default
                    descripcion_problema: problemDescription,
                    fotografia: photoURL,
                    fecha_creacion: new Date().toISOString(),
                };

                // console.log("Datos enviados:", reportData);

                const response = await fetch(`${baseUrl}reportes/`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(reportData),
                });

                if (response.ok) {
                    const reportModal = bootstrap.Modal.getInstance(document.getElementById("reportModal"));
                    reportModal.hide();

                    const confirmationModal = new bootstrap.Modal(document.getElementById("confirmationModal"));
                    confirmationModal.show();

                    reportForm.reset();
                } else {
                    const errorData = await response.json();
                    console.error("Error al enviar el reporte (API):", errorData);
                    alert(errorData.error || "Error al enviar el reporte. Revisa los datos enviados.");
                }
            } catch (error) {
                console.error("Error general al enviar el reporte:", error);
                alert("Hubo un error al enviar el reporte. Inténtalo nuevamente más tarde.");
            }
        });

        reportForm.dataset.listener = "true";
    }
};


// Alternar entre secciones
const setupSectionSwitching = () => {
    const navLinks = document.querySelectorAll("[data-section]");
    const sections = document.querySelectorAll(".section");

    navLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();

            sections.forEach((section) => section.classList.remove("active"));
            document.getElementById(link.dataset.section).classList.add("active");

            navLinks.forEach((nav) => nav.classList.remove("active"));
            link.classList.add("active");
        });
    });
};

// Inicializar la página
document.addEventListener("DOMContentLoaded", () => {
    generateParkingSpaces(); // Generar espacios dinámicamente
    loadSpecialEvents(); // Cargar eventos especiales
    loadPeakHours(); // Cargar horas pico
    setupSectionSwitching(); // Configurar navegación
    handleReportForm(); // Manejar formularios
});
