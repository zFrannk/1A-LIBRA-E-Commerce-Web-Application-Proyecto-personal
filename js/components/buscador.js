const inputBuscador = document.getElementById("buscador");
const resultadosBusqueda = document.getElementById("resultadosBusqueda");

let productos = [];

async function cargarProductosBuscador() {
    if (!inputBuscador) return;

    try {
        // Cambiamos el fetch del JSON estático por la API de Node.js
        const respuesta = await fetch("http://localhost:3000/api/productos");

        if (!respuesta.ok) {
            throw new Error("Error al obtener productos de la API");
        }

        productos = await respuesta.json();
        iniciarBuscador();

    } catch (error) {
        console.error("Error al cargar productos para el buscador:", error);
    }
}

function iniciarBuscador() {
    inputBuscador.addEventListener("input", buscarProductos);
    inputBuscador.addEventListener("focus", buscarProductos);
    document.addEventListener("click", cerrarBuscador);
    document.addEventListener("keydown", eventoTeclado);
}

function buscarProductos() {
    const texto = inputBuscador.value.trim().toLowerCase();

    resultadosBusqueda.innerHTML = "";

    if (texto === "") {
        resultadosBusqueda.style.display = "none";

        if (typeof mostrarProductos === "function" && document.getElementById("productos")) {
            mostrarProductos(productos);
        }
        return;
    }

    const coincidencias = productos.filter(producto =>
        producto.nombre.toLowerCase().startsWith(texto)
    );

    mostrarSugerencias(coincidencias);

    if (typeof mostrarProductos === "function" && document.getElementById("productos")) {
        mostrarProductos(coincidencias);
    }
}

function mostrarSugerencias(coincidencias) {
    resultadosBusqueda.innerHTML = "";
    resultadosBusqueda.style.display = "block";

    if (coincidencias.length === 0) {
        resultadosBusqueda.innerHTML = `
            <div class="resultado-vacio">
                No se encontraron productos
            </div>
        `;
        return;
    }

    coincidencias.slice(0, 5).forEach(producto => {
        const tarjeta = document.createElement("a");
        tarjeta.href = `producto.html?id=${producto.id}`;

        tarjeta.addEventListener("click", () => {
            resultadosBusqueda.style.display = "none";
            inputBuscador.value = "";
        });

        tarjeta.className = "resultado-busqueda";

        // Cambiamos 'producto.imagenes[0]' por la ruta con 'producto.imagen' de MySQL
        tarjeta.innerHTML = `
            <img
                src="../img/productos/${producto.imagen}"
                alt="${producto.nombre}"
            >
            <div class="resultado-info">
                <h4>
                    ${producto.nombre}
                </h4>
                <span>
                    $${formatearPrecio(producto.precio)}
                </span>
            </div>
        `;

        resultadosBusqueda.appendChild(tarjeta);
    });
}

function cerrarBuscador(evento) {
    if (!resultadosBusqueda) return;

    if (
        resultadosBusqueda.contains(evento.target) ||
        inputBuscador.contains(evento.target)
    ) {
        return;
    }

    resultadosBusqueda.style.display = "none";
}

function eventoTeclado(evento) {
    if (evento.key === "Escape") {
        resultadosBusqueda.style.display = "none";
    }
}

cargarProductosBuscador();