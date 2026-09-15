// VARIABLES
const parametros = new URLSearchParams(window.location.search);
const idProducto = Number(parametros.get("id"));

let productoActual;
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
let cantidad = 1;

const imagenPrincipal = document.getElementById("imagenPrincipal");
const contadorCarrito = document.getElementById("contadorCarrito");
const cantidadTexto = document.getElementById("cantidad");
const btnMas = document.getElementById("btnMas");
const btnMenos = document.getElementById("btnMenos");
const btnComprar = document.getElementById("btnComprar");

// FUNCIONES
async function cargarProducto() {
    try {
        // Pedimos el producto directamente a la API de Node.js/MySQL
        const respuesta = await fetch(`http://localhost:3000/api/productos/${idProducto}`);
        
        if (!respuesta.ok) {
            throw new Error("Producto no encontrado");
        }

        productoActual = await respuesta.json();

        // Cargamos los datos del producto en el HTML
        document.getElementById("categoriaProducto").textContent = productoActual.categoria;
        document.getElementById("nombreProducto").textContent = productoActual.nombre;
        document.getElementById("precioProducto").textContent = `$${formatearPrecio(productoActual.precio)}`;
        document.getElementById("descripcionProducto").textContent = productoActual.descripcion;

        // Construimos la ruta local de la imagen traída desde MySQL
        const rutaImagen = `../img/productos/${productoActual.imagen}`;
        imagenPrincipal.src = rutaImagen;

        // Cargamos la miniatura correspondiente
        cargarMiniaturas(rutaImagen);

    } catch (error) {
        console.error("Error al obtener el producto desde la API:", error);
    }
}

function cargarMiniaturas(rutaImagen) {
    const contenedorMiniaturas = document.getElementById("miniaturas");
    if (!contenedorMiniaturas) return;

    contenedorMiniaturas.innerHTML = "";

    // Creamos la miniatura con la imagen actual de la base de datos
    const miniatura = document.createElement("img");
    miniatura.src = rutaImagen;
    miniatura.classList.add("miniatura");

    miniatura.addEventListener("click", () => {
        imagenPrincipal.src = rutaImagen;
    });

    contenedorMiniaturas.appendChild(miniatura);
}

// EVENTOS
btnMas.addEventListener("click", () => {
    cantidad++;
    cantidadTexto.textContent = cantidad;
});

btnMenos.addEventListener("click", () => {
    if (cantidad > 1) {
        cantidad--;
        cantidadTexto.textContent = cantidad;
    }
});

btnComprar.addEventListener("click", () => {
    if (!productoActual) return;

    carrito = obtenerCarrito();

    const producto = {
        id: productoActual.id,
        nombre: productoActual.nombre,
        precio: Number(productoActual.precio),
        imagen: `../img/productos/${productoActual.imagen}`,
        categoria: productoActual.categoria,
        descripcion: productoActual.descripcion,
        color: null,
        talle: null,
        cantidad: cantidad
    };

    const productoExistente = carrito.find(item => item.id === producto.id);

    if (productoExistente) {
        productoExistente.cantidad += cantidad;
    } else {
        carrito.push(producto);
    }

    guardarCarrito(carrito);
    actualizarContador();
    mostrarToast("✓ Producto agregado con éxito");
});

// INICIO
cargarProducto();
actualizarContador();