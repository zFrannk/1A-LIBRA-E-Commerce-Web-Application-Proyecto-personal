// Verificación de seguridad al entrar al panel
const usuarioSesion = JSON.parse(localStorage.getItem("usuarioActivo"));

if (!usuarioSesion || usuarioSesion.rol !== "admin") {
    alert("Acceso denegado. Se requieren permisos de administrador.");
    window.location.href = "index.html"; // Redirige al inicio
}

const formProducto = document.getElementById("formProducto");
const tabla = document.getElementById("tablaProductos");
let editandoId = null; // Guardará el ID del producto que se está editando

// Cargar productos en la tabla apenas inicia la página
document.addEventListener("DOMContentLoaded", cargarProductosTabla);

// ==========================================
// 1. CARGAR Y RENDERIZAR PRODUCTOS
// ==========================================
async function cargarProductosTabla() {
    if (!tabla) return;

    try {
        const res = await fetch("http://localhost:3000/api/productos");
        const productos = await res.json();

        tabla.innerHTML = ""; // Limpiar contenido previo

        productos.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <img src="http://localhost:3000/img/productos/${p.imagen}" alt="${p.nombre}" width="50" height="50" style="border-radius:6px; object-fit:cover;">
                </td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.categoria}</td>
                <td>$${p.precio}</td>
                <td>${p.stock}</td>
                <td>
                    <button class="btn-editar" onclick="prepararEdicion(${p.id}, '${p.nombre}', '${p.descripcion || ''}', ${p.precio}, ${p.stock}, '${p.categoria}')">✏️ Editar</button>
                    <button class="btn-eliminar" onclick="eliminarProducto(${p.id})">🗑️ Eliminar</button>
                </td>
            `;
            tabla.appendChild(tr);
        });
    } catch (error) {
        console.error("Error al cargar la tabla:", error);
    }
}

// ==========================================
// 2. CREAR O EDITAR PRODUCTO (SUBMIT)
// ==========================================
if (formProducto) {
    formProducto.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("nombre", document.getElementById("nombre").value);
        formData.append("descripcion", document.getElementById("descripcion").value);
        formData.append("precio", document.getElementById("precio").value);
        formData.append("stock", document.getElementById("stock").value);
        formData.append("categoria", document.getElementById("categoria").value);

        const inputImagen = document.getElementById("imagen");
        if (inputImagen && inputImagen.files.length > 0) {
            formData.append("imagen", inputImagen.files[0]);
        }

        // Si editandoId tiene un ID asignado usamos PUT, de lo contrario POST
        const url = editandoId 
            ? `http://localhost:3000/api/productos/${editandoId}`
            : "http://localhost:3000/api/productos";
            
        const metodo = editandoId ? "PUT" : "POST";

        try {
            const respuesta = await fetch(url, {
                method: metodo,
                body: formData
            });

            const resultado = await respuesta.json();

            if (respuesta.ok) {
                alert(editandoId ? "✓ Producto actualizado correctamente." : "✓ Producto guardado con éxito.");
                formProducto.reset();
                resetearFormularioEdicion();
                cargarProductosTabla(); // Recargar la tabla
            } else {
                alert(`Error: ${resultado.error}`);
            }

        } catch (error) {
            console.error("Error al procesar la solicitud:", error);
            alert("No se pudo conectar con el servidor.");
        }
    });
}

// ==========================================
// 3. PREPARAR FORMULARIO PARA EDICIÓN
// ==========================================
window.prepararEdicion = function(id, nombre, descripcion, precio, stock, categoria) {
    editandoId = id;
    document.getElementById("nombre").value = nombre;
    document.getElementById("descripcion").value = descripcion;
    document.getElementById("precio").value = precio;
    document.getElementById("stock").value = stock;
    document.getElementById("categoria").value = categoria;

    // Al editar, la imagen deja de ser obligatoria
    document.getElementById("imagen").removeAttribute("required");

    // Modificar el botón a estado de edición
    const btnSubmit = formProducto.querySelector("button[type='submit']");
    btnSubmit.textContent = "Actualizar Producto";
    btnSubmit.style.backgroundColor = "#eab308";
};

// Restablecer el formulario al estado original de "Crear"
function resetearFormularioEdicion() {
    editandoId = null;
    document.getElementById("imagen").setAttribute("required", "true");
    const btnSubmit = formProducto.querySelector("button[type='submit']");
    btnSubmit.textContent = "Guardar Producto";
    btnSubmit.style.backgroundColor = "#2563eb";
}

// ==========================================
// 4. ELIMINAR PRODUCTO
// ==========================================
window.eliminarProducto = async function(id) {
    if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
        try {
            const res = await fetch(`http://localhost:3000/api/productos/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Producto eliminado.");
                cargarProductosTabla();
            } else {
                alert("No se pudo eliminar el producto.");
            }
        } catch (error) {
            console.error("Error al eliminar:", error);
            alert("Error al intentar conectar con el servidor.");
        }
    }
};