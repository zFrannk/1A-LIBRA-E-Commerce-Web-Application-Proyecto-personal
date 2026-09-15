// ========================================
// VARIABLES DEL DOM
// ========================================
const resumenCheckout = document.getElementById("resumenCheckout");
const totalCheckout = document.getElementById("totalCheckout");
const btnConfirmarCompra = document.getElementById("btnConfirmarCompra");

const inputNombre = document.getElementById("nombre");
const inputEmail = document.getElementById("email");
const inputTelefono = document.getElementById("telefono");
const inputDireccion = document.getElementById("direccion");
const inputCiudad = document.getElementById("ciudad");
const inputCodigoPostal = document.getElementById("codigoPostal");

// ========================================
// 1. RENDERIZAR RESUMEN DEL CHECKOUT
// ========================================
function renderizarCheckout() {
    if (!resumenCheckout) return;

    const carrito = obtenerCarrito();
    resumenCheckout.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        resumenCheckout.innerHTML = `<p class="checkout-vacio">No hay productos en el carrito.</p>`;
        if (totalCheckout) totalCheckout.textContent = "$0";
        return;
    }

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        resumenCheckout.innerHTML += `
            <div class="producto-checkout">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-checkout">
                <div class="info-checkout">
                    <h3>${producto.nombre}</h3>
                    <p>Cantidad: ${producto.cantidad}</p>
                    <p>$${formatearPrecio(producto.precio)}</p>
                </div>
                <strong class="subtotal-checkout">$${formatearPrecio(subtotal)}</strong>
            </div>
        `;
    });

    if (totalCheckout) {
        totalCheckout.textContent = `$${formatearPrecio(total)}`;
    }
}

// ========================================
// 2. VALIDAR FORMULARIO DE ENVÍO
// ========================================
function validarDatosCheckout() {
    if (!inputNombre || !inputEmail || !inputTelefono || !inputDireccion || !inputCiudad || !inputCodigoPostal) {
        return true; // Si la vista no usa este formulario de envío, permite avanzar
    }

    const nombre = inputNombre.value.trim();
    const email = inputEmail.value.trim();
    const telefono = inputTelefono.value.trim();
    const direccion = inputDireccion.value.trim();
    const ciudad = inputCiudad.value.trim();
    const codigoPostal = inputCodigoPostal.value.trim();

    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal) {
        mostrarMensajeCheckout("Completa todos los campos de envío.", "warning");
        return false;
    }

    if (!email.includes("@")) {
        mostrarMensajeCheckout("Ingresa un correo electrónico válido.", "error");
        return false;
    }

    return true;
}

// ========================================
// 3. MENSAJES DE ESTADO
// ========================================
function mostrarMensajeCheckout(mensaje, tipo) {
    let mensajeCheckout = document.getElementById("mensajeCheckout");

    if (!mensajeCheckout && btnConfirmarCompra) {
        mensajeCheckout = document.createElement("div");
        mensajeCheckout.id = "mensajeCheckout";
        btnConfirmarCompra.parentNode.insertBefore(mensajeCheckout, btnConfirmarCompra);
    }

    if (mensajeCheckout) {
        mensajeCheckout.textContent = mensaje;
        mensajeCheckout.className = `mensaje-checkout ${tipo}`;
    }
}

// ========================================
// 4. AUTOCOMPLETAR DATOS DE USUARIO LOGUEADO
// ========================================
function autocompletarDatosUsuario() {
    const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo'));
    if (usuarioGuardado) {
        if (inputNombre && usuarioGuardado.nombre) inputNombre.value = usuarioGuardado.nombre;
        if (inputEmail && usuarioGuardado.email) inputEmail.value = usuarioGuardado.email;
    }
}

// ========================================
// 5. REDIRIGIR A LA PANTALLA DE PAGO SELECCIONADA
// ========================================
if (btnConfirmarCompra) {
    btnConfirmarCompra.addEventListener("click", () => {
        if (!validarDatosCheckout()) return;

        // Deriva al cliente a la pantalla de selección de método (pagos.html / pagos.js)
        window.location.href = "pagos.html";
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================
actualizarContador();
renderizarCheckout();
autocompletarDatosUsuario();