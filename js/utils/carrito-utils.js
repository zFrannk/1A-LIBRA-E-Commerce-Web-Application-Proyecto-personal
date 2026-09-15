function obtenerUsuarioActivo() {

    return JSON.parse(
        localStorage.getItem("usuarioActivo")
    );

}


function obtenerClaveCarrito() {

    const usuario =
        obtenerUsuarioActivo();

    if (!usuario) {

        return "carritoInvitado";

    }

    return `carrito_${usuario.email}`;

}


function obtenerCarrito() {

    const clave =
        obtenerClaveCarrito();

    return JSON.parse(
        localStorage.getItem(clave)
    ) || [];

}


function guardarCarrito(carrito) {

    const clave =
        obtenerClaveCarrito();

    localStorage.setItem(

        clave,

        JSON.stringify(carrito)

    );

}


function actualizarContador() {

    const contador =
        document.getElementById(
            "contadorCarrito"
        );

    if (!contador) return;

    const carrito =
        obtenerCarrito();

    let total = 0;

    carrito.forEach(producto => {

        total += producto.cantidad;

    });

    contador.textContent =
        total;

}


function formatearPrecio(precio) {

    return precio.toLocaleString(
        "es-AR"
    );

}