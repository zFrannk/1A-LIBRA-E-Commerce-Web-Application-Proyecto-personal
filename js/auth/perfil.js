document.addEventListener("DOMContentLoaded", () => {
    // 1. Obtener la sesión guardada
    const usuarioActivo = JSON.parse(localStorage.getItem("usuarioActivo"));

    // 2. Si no hay usuario activo, redirigir al login
    if (!usuarioActivo) {
        window.location.href = "login.html";
        return;
    }

    // 3. Cargar los datos en el HTML
    const nombreUsuario = document.getElementById("nombreUsuario");
    const emailUsuario = document.getElementById("emailUsuario");
    const contenedorBtnAdmin = document.getElementById("contenedor-btn-admin");
    const btnCerrarSesion = document.getElementById("cerrarSesion");

    if (nombreUsuario) nombreUsuario.textContent = usuarioActivo.nombre || "—";
    if (emailUsuario) emailUsuario.textContent = usuarioActivo.email || "—";

    // 4. Si el rol es admin, inyectar el botón para ir al panel
    if (usuarioActivo.rol === "admin" && contenedorBtnAdmin) {
        contenedorBtnAdmin.innerHTML = `
            <a href="panel-admin.html" class="btn-admin" style="display: block; width: 95%; margin-top: 15px; margin-bottom: 10px; text-align: center; background: #ffffff; color: black; padding: 8px; border-radius: 5px; text-decoration: none; font-weight: bold;">
                ⚙️ Ir al Panel de Control
            </a>
        `;
    }

    // 5. Lógica para cerrar sesión
    if (btnCerrarSesion) {
        btnCerrarSesion.addEventListener("click", () => {
            localStorage.removeItem("usuarioActivo");
            window.location.href = "login.html";
        });
    }
});