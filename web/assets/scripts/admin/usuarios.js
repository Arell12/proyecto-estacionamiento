const baseUrl = window.config.apiBaseUrl;

const userTableBody = document.querySelector("#userTable tbody");

// Form para crear usuario
const createUserForm = document.getElementById("createUserForm");
const createName = document.getElementById("createName");
const createLastName = document.getElementById("createLastName");
const createNumeroControl = document.getElementById("createNumeroControl");
const createEmail = document.getElementById("createEmail");
const createFechaNacimiento = document.getElementById("createFechaNacimiento");
const createTelefono = document.getElementById("createTelefono");
const createDiscapacidad = document.getElementById("createDiscapacidad");
const createUserRole = document.getElementById("createUserRole");

// Form para editar usuario
const editUserForm = document.getElementById("editUserForm");
const editUserId = document.getElementById("editUserId");
const editName = document.getElementById("editName");
const editLastName = document.getElementById("editLastName");
const editNumeroControl = document.getElementById("editNumeroControl");
const editEmail = document.getElementById("editEmail");
const editFechaNacimiento = document.getElementById("editFechaNacimiento");
const editTelefono = document.getElementById("editTelefono");
const editDiscapacidad = document.getElementById("editDiscapacidad");
const editUserRole = document.getElementById("editUserRole");

// Modales Bootstrap
const createUserModal = new bootstrap.Modal(document.getElementById("createUserModal"));
const editUserModal = new bootstrap.Modal(document.getElementById("editUserModal"));

let roles = [];

// Cargar roles desde la API
async function loadRoles() {
    try {
        const response = await fetch(`${baseUrl}roles/`);
        roles = await response.json();

        if (response.ok) {
            // Poblar combos de roles en los dos modales
            populateRoleSelect(createUserRole);
            populateRoleSelect(editUserRole);
        } else {
            alert('Error al cargar roles.');
        }
    } catch (error) {
        console.error('Error al cargar roles:', error);
        alert('Error al cargar roles.');
    }
}

function populateRoleSelect(selectElement) {
    selectElement.innerHTML = `<option value="">Selecciona un rol</option>`;
    roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id_rol;
        option.textContent = role.nombre_rol;
        selectElement.appendChild(option);
    });
}

// Cargar usuarios desde la API
async function loadUsuarios() {
    try {
        const response = await fetch(`${baseUrl}usuarios/`);
        const usuarios = await response.json();

        if (response.ok) {
            userTableBody.innerHTML = "";
            usuarios.forEach((usuario, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td>${usuario.nombre}</td>
                    <td>${usuario.apellidos}</td>
                    <td>${usuario.correo_electronico}</td>
                    <td>${usuario.rol ? usuario.rol.nombre_rol : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="openEditModal(${usuario.id_usuario}, '${escapeJSON(usuario)}')"><i class="bi bi-pencil"></i> Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUsuario(${usuario.id_usuario})"><i class="bi bi-trash"></i> Eliminar</button>
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        } else {
            alert('Error al cargar usuarios.');
        }
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        alert('Error al obtener usuarios.');
    }
}

// Función para "escapar" los datos del usuario y poder pasarlos como string en el onclick
function escapeJSON(usuarioObj) {
    return JSON.stringify(usuarioObj)
        .replace(/"/g, '&quot;'); // Reemplazamos comillas dobles por entidades HTML
}

// Abrir modal de edición con datos del usuario
function openEditModal(id_usuario, usuarioStr) {
    const usuario = JSON.parse(usuarioStr.replace(/&quot;/g, '"'));

    editUserId.value = usuario.id_usuario;
    editName.value = usuario.nombre;
    editLastName.value = usuario.apellidos;
    editNumeroControl.value = usuario.numero_control;
    editEmail.value = usuario.correo_electronico;
    editFechaNacimiento.value = usuario.fecha_nacimiento;
    editTelefono.value = usuario.telefono;
    editDiscapacidad.checked = usuario.capacidades_diferentes;

    // Seleccionar el rol correcto en el combobox
    if (usuario.id_rol) {
        editUserRole.value = usuario.id_rol;
    } else {
        editUserRole.value = "";
    }

    editUserModal.show();
}

// Crear nuevo usuario (POST)
createUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const bodyData = {
        numero_control: createNumeroControl.value.trim(),
        nombre: createName.value.trim(),
        apellidos: createLastName.value.trim(),
        correo_electronico: createEmail.value.trim(),
        fecha_nacimiento: createFechaNacimiento.value,
        telefono: createTelefono.value.trim(),
        foto_perfil: "https://firebasestorage.googleapis.com/v0/b/parking-f86b3.firebasestorage.app/o/img_perfiles%2Fdefault.webp?alt=media&token=3c9cecf3-08de-4221-a2e4-a40885d5466e", // Foto por defecto
        capacidades_diferentes: createDiscapacidad.checked,
        id_rol: parseInt(createUserRole.value)
    };

    try {
        const response = await fetch(`${baseUrl}usuarios/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            alert('Usuario registrado con éxito.');

            // Obtener el usuario recién creado buscando por numero_control
            const nuevoNumeroControl = bodyData.numero_control;
            const nuevoUsuario = await findUsuarioByNumeroControl(nuevoNumeroControl);
            if (nuevoUsuario) {
                // Crear credencial en la api credenciales/
                // Usaremos el numero_control como contraseña
                await crearCredencial(nuevoUsuario.id_usuario, nuevoNumeroControl);
            }

            createUserForm.reset();
            createUserModal.hide();
            loadUsuarios();
        } else {
            alert('Error al registrar usuario.');
        }
    } catch (error) {
        alert('Error al registrar usuario.');
    }
});

// Función para encontrar usuario por numero_control
async function findUsuarioByNumeroControl(numero_control) {
    try {
        const response = await fetch(`${baseUrl}usuarios/`);
        const usuarios = await response.json();
        if (response.ok) {
            return usuarios.find(u => u.numero_control === numero_control);
        } else {
            console.error('Error al buscar usuario por número de control');
            return null;
        }
    } catch (error) {
        console.error('Error al buscar usuario:', error);
        return null;
    }
}

// Crear credencial de usuario (POST a credenciales/)
async function crearCredencial(id_usuario, contrasena) {
    const bodyData = {
        id_usuario,
        contrasena
    };

    try {
        const response = await fetch(`${baseUrl}credenciales/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            console.log('Credencial creada con éxito.');
        } else {
            console.error('Error al crear credencial.');
        }
    } catch (error) {
        console.error('Error al crear credencial:', error);
    }
}

// Editar usuario (PUT)
editUserForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id_usuario = editUserId.value;

    const bodyData = {
        numero_control: editNumeroControl.value.trim(),
        nombre: editName.value.trim(),
        apellidos: editLastName.value.trim(),
        correo_electronico: editEmail.value.trim(),
        fecha_nacimiento: editFechaNacimiento.value,
        telefono: editTelefono.value.trim(),
        foto_perfil: "https://firebasestorage.googleapis.com/v0/b/parking-f86b3.firebasestorage.app/o/img_perfiles%2Fdefault.webp?alt=media&token=3c9cecf3-08de-4221-a2e4-a40885d5466e", 
        capacidades_diferentes: editDiscapacidad.checked,
        id_rol: parseInt(editUserRole.value)
    };

    try {
        const response = await fetch(`${baseUrl}usuarios/${id_usuario}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            alert('Usuario actualizado con éxito.');
            editUserForm.reset();
            editUserModal.hide();
            loadUsuarios();
        } else {
            alert('Error al actualizar usuario.');
        }
    } catch (error) {
        alert('Error al actualizar usuario.');
    }
}); // Añadido este corchete de cierre

// Eliminar usuario (DELETE)
async function deleteUsuario(id_usuario) {
    const confirmDelete = confirm('¿Está seguro de eliminar este usuario?');
    if (!confirmDelete) return;

    try {
        // 1. Eliminar credencial del usuario si existe
        // Intentamos eliminar credencial. Si no existe, la respuesta podría ser 404
        // No generamos error si es así, simplemente continuamos.
        await fetch(`${baseUrl}credenciales/${id_usuario}/`, {
            method: 'DELETE'
        }).catch(e => console.warn("No se pudo eliminar credencial (posiblemente no existe):", e));

        // 2. Eliminar reportes relacionados con el usuario (opcionales)
        const responseReportes = await fetch(`${baseUrl}reportes/`);
        if (responseReportes.ok) {
            const reportes = await responseReportes.json();
            const reportesUsuario = reportes.filter(r => r.id_usuario_reporta === id_usuario || r.id_usuario_resuelve === id_usuario);
            // Si no hay reportes asociados, este ciclo no se ejecuta
            for (const reporte of reportesUsuario) {
                await fetch(`${baseUrl}reportes/${reporte.id_reporte}/`, {
                    method: 'DELETE'
                }).catch(e => console.warn(`No se pudo eliminar el reporte ${reporte.id_reporte}:`, e));
            }
        } else {
            console.warn("No se pudo acceder a la lista de reportes, se omite este paso.");
        }

        // 3. Buscar registro en usuario-automovil relacionado al usuario (opcional)
        const responseUsuarioAutomovil = await fetch(`${baseUrl}usuario-automovil/`);
        if (responseUsuarioAutomovil.ok) {
            const usuarioAutomovilList = await responseUsuarioAutomovil.json();
            const usuarioAutomovil = usuarioAutomovilList.find(ua => ua.id_usuario === id_usuario);

            if (usuarioAutomovil) {
                const idUsuarioAutomovil = usuarioAutomovil.id_usuario_automovil;

                // 4. Eliminar historial asociado al id_usuario_automovil (opcional)
                const responseHistorial = await fetch(`${baseUrl}historial/`);
                if (responseHistorial.ok) {
                    const historialList = await responseHistorial.json();
                    const historialUsuario = historialList.filter(h => h.id_usuario_automovil === idUsuarioAutomovil);

                    // Si no hay historial asociado, este ciclo no se ejecuta
                    for (const hist of historialUsuario) {
                        await fetch(`${baseUrl}historial/${hist.id_historial}/`, {
                            method: 'DELETE'
                        }).catch(e => console.warn(`No se pudo eliminar el historial ${hist.id_historial}:`, e));
                    }
                } else {
                    console.warn("No se pudo acceder a la lista de historial, se omite este paso.");
                }

                // Eliminar usuario-automovil
                await fetch(`${baseUrl}usuario-automovil/${idUsuarioAutomovil}/`, {
                    method: 'DELETE'
                }).catch(e => console.warn(`No se pudo eliminar usuario-automovil ${idUsuarioAutomovil}:`, e));
            } else {
                console.log("No se encontró un auto asociado a este usuario, se omite la eliminación de historial y usuario-automovil.");
            }
        } else {
            console.warn("No se pudo acceder a la lista de usuario-automovil, se omite este paso.");
        }

        // 5. Finalmente, eliminar el usuario
        const response = await fetch(`${baseUrl}usuarios/${id_usuario}/`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Usuario eliminado con éxito.');
            loadUsuarios();
        } else {
            alert('Error al eliminar usuario.');
        }
    } catch (error) {
        console.error("Error al eliminar usuario y sus dependencias:", error);
        alert('Error al eliminar usuario.');
    }
}



// Al cargar la página, obtener roles y luego usuarios
document.addEventListener("DOMContentLoaded", async () => {
    await loadRoles();
    loadUsuarios();
});
