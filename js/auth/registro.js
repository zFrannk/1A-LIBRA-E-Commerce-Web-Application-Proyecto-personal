// ========================================
// ELEMENTOS DEL DOM
// ========================================
const formulario = document.getElementById("formRegistro");
const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
const inputConfirmar = document.getElementById("confirmarPassword");
const mensajeFormulario = document.getElementById("mensajeFormulario");

// ========================================
// MOSTRAR MENSAJES DE ESTADO
// ========================================
function mostrarMensaje(mensaje, tipo) {
    if (typeof mostrarToast === "function") {
        mostrarToast(mensaje, tipo === "success" ? "success" : "error");
    }

    if (mensajeFormulario) {
        mensajeFormulario.textContent = mensaje;
        mensajeFormulario.className = tipo;
    }
}

// ========================================
// PROCESAR REGISTRO DE USUARIOS
// ========================================
if (formulario) {
    formulario.addEventListener("submit", registrarUsuario);
}

async function registrarUsuario(evento) {
    evento.preventDefault();

    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    const confirmarPassword = inputConfirmar.value;

    if (!nombre || !email || !password || !confirmarPassword) {
        mostrarMensaje("Por favor, completá todos los campos.", "warning");
        return;
    }

    if (password !== confirmarPassword) {
        mostrarMensaje("Las contraseñas no coinciden.", "error");
        return;
    }

    try {
        // Envío directo al endpoint de Node.js
        const respuesta = await fetch("http://localhost:3000/api/registro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nombre, email, password })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok) {
            mostrarMensaje(datos.error || "No se pudo realizar el registro.", "error");
            return;
        }

        mostrarMensaje("✓ Usuario registrado correctamente.", "success");
        formulario.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        mostrarMensaje("No se pudo conectar con el servidor.", "error");
    }
}