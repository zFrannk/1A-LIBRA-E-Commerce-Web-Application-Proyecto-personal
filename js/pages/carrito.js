// VARIABLES
let carrito = [];

const contadorCarrito =
    document.getElementById("contadorCarrito");

const listaCarrito =
    document.getElementById("listaCarrito");

const totalTexto =
    document.getElementById("total");



// FUNCIONES
function crearProductoHTML(producto) {

    const subtotal =
        producto.precio * producto.cantidad;

    return `

        <div class="producto-carrito">

            <img
                src="${producto.imagen}"
                alt="${producto.nombre}"
                class="imagen-carrito"
            >

            <div class="info-carrito">

                <h3>
                    ${producto.nombre}
                </h3>

                <p>
                    Categoría: ${producto.categoria}
                </p>

                <p>
                    Precio unitario: $${formatearPrecio(producto.precio)}
                </p>

                <div class="cantidad-selector">

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

                <p>
                    Subtotal: $${formatearPrecio(subtotal)}
                </p>

                <button
                    class="btn-eliminar"
                    data-id="${producto.id}"
                >
                    Eliminar
                </button>

            </div>

        </div>

    `;

}



function agregarEventosBotones() {

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


function renderizarCarrito() {

    carrito = obtenerCarrito();

    if (carrito.length === 0) {

        carritoVacio.classList.remove("oculto");
        resumenCarrito.classList.add("oculto");
        listaCarrito.classList.add("oculto");

        return;

    }

    carritoVacio.classList.add("oculto");
    resumenCarrito.classList.remove("oculto");
    listaCarrito.classList.remove("oculto");

    listaCarrito.innerHTML = "";

    let total = 0;

    carrito.forEach(producto => {

        total += producto.precio * producto.cantidad;

        listaCarrito.innerHTML +=
            crearProductoHTML(producto);

    });

    totalTexto.textContent =
        `Total: $${formatearPrecio(total)}`;

    agregarEventosBotones();

}

function aumentarCantidad(id) {

    carrito = obtenerCarrito();

    const producto = carrito.find(
        item => item.id === id
    );

    if (!producto) return;

    producto.cantidad++;

    guardarCarrito(carrito);

    renderizarCarrito();

    actualizarContador();

        mostrarToast(
    "✓ Producto agregado con éxito"
    );


}

function disminuirCantidad(id) {

    carrito = obtenerCarrito();

    const producto = carrito.find(
        item => item.id === id
    );

    if (!producto) return;

    if (producto.cantidad > 1) {

        producto.cantidad--;

    }

    guardarCarrito(carrito);

    renderizarCarrito();

    actualizarContador();

}

function eliminarProducto(id) {

    carrito = obtenerCarrito();

    carrito = carrito.filter(
        item => item.id !== id
    );

    guardarCarrito(carrito);

    renderizarCarrito();

    actualizarContador();

    mostrarToast(
    "✓ Producto eliminado correctamente"
    );


}



// INICIO
actualizarContador();
renderizarCarrito();

