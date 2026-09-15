// ========================================
// ELEMENTOS DEL DOM
// ========================================
const formulario = document.getElementById("formLogin");
const inputEmail = document.getElementById("email");
const inputPassword = document.getElementById("password");
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
// PROCESAR INICIO DE SESIÓN
// ========================================
if (formulario) {
    formulario.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const email = inputEmail.value.trim();
        const password = inputPassword.value.trim();

        if (!email || !password) {
            mostrarMensaje("Por favor, completá todos los campos.", "error");
            return;
        }

        try {
            // Petición al backend configurado en server.js
            const respuesta = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            const datos = await respuesta.json();

            if (!respuesta.ok) {
                mostrarMensaje(datos.error || "Credenciales incorrectas.", "error");
                return;
            }

            // Guardamos el objeto activo devuelto por MySQL (que incluye id, nombre, email y rol)
            localStorage.setItem("usuarioActivo", JSON.stringify(datos.usuario));

            mostrarMensaje("✓ Inicio de sesión correcto.", "success");
            formulario.reset();

            // Redirección dinámica según el rol
            setTimeout(() => {
                if (datos.usuario.rol === "admin") {
                    window.location.href = "panel-admin.html";
                } else {
                    window.location.href = "index.html";
                }
            }, 1200);

        } catch (error) {
            console.error("Error en la autenticación:", error);
            mostrarMensaje("No se pudo conectar con el servidor.", "error");
        }
    });
}