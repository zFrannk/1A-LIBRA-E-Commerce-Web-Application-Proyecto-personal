// VARIABLES
const contenedorProductos =
    document.getElementById("productos");

// FUNCIONES

async function cargarProductos() {

    try {

        const respuesta =
            await fetch('http://localhost:3000/api/productos');

        const productos =
            await respuesta.json();

        mostrarProductos(productos);

    }

    catch (error) {

        console.error(
            "Error al cargar productos:",
            error
        );

    }

}

function mostrarProductos(productos) {

    if (!contenedorProductos) return;

    contenedorProductos.innerHTML = "";

    productos.forEach(producto => {

        const tarjeta =
            document.createElement("a");

        tarjeta.href =
            `producto.html?id=${producto.id}`;

        tarjeta.className =
            "producto-link";

        tarjeta.innerHTML = `

            <div class="producto">

                <img
                    src="http://localhost:3000/img/productos/${producto.imagen}"
                    alt="${producto.nombre}"
                >

                <h3>

                    ${producto.nombre}

                </h3>

                <p>

                    $${formatearPrecio(producto.precio)}

                </p>

                <button>

                    Comprar

                </button>

            </div>

        `;

        contenedorProductos.appendChild(
            tarjeta
        );

    });

}

// INICIO

cargarProductos();

actualizarContador();