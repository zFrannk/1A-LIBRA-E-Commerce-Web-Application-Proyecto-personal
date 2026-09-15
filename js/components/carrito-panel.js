// VARIABLES
const btnAbrir =
    document.getElementById("abrirCarrito");

const btnCerrar =
    document.getElementById("cerrarCarrito");

const panelCarrito =
    document.getElementById("panelCarrito");

const overlay =
    document.getElementById("overlayCarrito");

// FUNCIONES
function abrirCarrito() {
    renderizarPanelCarrito();

    panelCarrito.classList.add("activo");

    overlay.classList.add("activo");

}

function cerrarCarrito() {

    panelCarrito.classList.remove("activo");

    overlay.classList.remove("activo");

}


function renderizarPanelCarrito() {

    const carrito = obtenerCarrito();

    const lista =
        document.getElementById("listaCarritoPanel");

    const total =
        document.getElementById("totalPanel");

    lista.innerHTML = "";

    let precioTotal = 0;

    carrito.forEach(producto => {

        const subtotal =
            producto.precio * producto.cantidad;

        precioTotal += subtotal;

        lista.innerHTML += `

            <div class="producto-panel">

                <img
                    src="${producto.imagen}"
                    alt="${producto.nombre}"
                    class="imagen-panel"
                >

                <div class="info-panel">

                    <h3>${producto.nombre}</h3>

                    <p>$${formatearPrecio(producto.precio)}</p>

                    <div class="cantidad-panel">

                        <button
                            class="btn-restar"
                            data-id="${producto.id}"
                        >
                            -
                        </button>

                        <span>
                            ${producto.cantidad}
                        </span>

                        <button
                            class="btn-sumar"
                            data-id="${producto.id}"
                        >
                            +
                        </button>

                    </div>

                    <button
                        class="btn-eliminar"
                        data-id="${producto.id}"
                    >
                        Eliminar
                    </button>

            </div>

        `;

    });

    total.textContent =
        `Total: $${formatearPrecio(precioTotal)}`;

    document.querySelectorAll(".btn-sumar")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            aumentarCantidad(
                Number(boton.dataset.id)
            );

        });

    });

    document.querySelectorAll(".btn-restar")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            disminuirCantidad(
                Number(boton.dataset.id)
            );

        });

    });

    document.querySelectorAll(".btn-eliminar")
    .forEach(boton => {

        boton.addEventListener("click", () => {

            eliminarProducto(
                Number(boton.dataset.id)
            );

        });

    });

}

function aumentarCantidad(id) {

    const carrito = obtenerCarrito();

    const producto =
        carrito.find(item => item.id === id);

    if (producto) {

        producto.cantidad++;

    }

    guardarCarrito(carrito);
    renderizarPanelCarrito();
    actualizarContador();

}

function disminuirCantidad(id) {

    const carrito = obtenerCarrito();
    const producto =
        carrito.find(item => item.id === id);

    if (!producto) return;

    if (producto.cantidad > 1) {

        producto.cantidad--;

    }

    guardarCarrito(carrito);
    renderizarPanelCarrito();
    actualizarContador();

}

function eliminarProducto(id) {

    let carrito = obtenerCarrito();
    carrito = carrito.filter(
        producto => producto.id !== id
    );

    guardarCarrito(carrito);
    renderizarPanelCarrito();
    actualizarContador();
}

// EVENTOS
btnAbrir.addEventListener("click", e => {

    e.preventDefault();

    abrirCarrito();

});

btnCerrar.addEventListener("click", () => {

    cerrarCarrito();

});

overlay.addEventListener("click", () => {

    cerrarCarrito();

});
