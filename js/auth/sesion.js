function obtenerUsuarioActivo() {

    return JSON.parse(

        localStorage.getItem("usuarioActivo")

    );

}

const menuUsuario =
    document.getElementById("menuUsuario");

const botonCerrarSesion =
    document.getElementById("cerrarSesion");



function cerrarSesion() {

    localStorage.removeItem(
        "usuarioActivo"
    );

    window.location.href =
        "../html/index.html";

}

const loginLink =
    document.getElementById("loginLink");

const usuarioActivo =
    obtenerUsuarioActivo();

if (

    loginLink &&

    usuarioActivo

) {

    loginLink.textContent =
        `Hola, ${usuarioActivo.nombre}`;

    loginLink.removeAttribute(
        "href"
    );

    loginLink.addEventListener(
        "click",
        function () {

            menuUsuario.classList.toggle(
                "activo"
            );

        }
    );

    botonCerrarSesion.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();

            cerrarSesion();

        }
    );
}