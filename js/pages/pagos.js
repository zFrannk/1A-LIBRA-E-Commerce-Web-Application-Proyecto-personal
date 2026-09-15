// ========================================
// VARIABLES DEL DOM
// ========================================
const resumenPago = document.getElementById("resumenPago");
const totalPago = document.getElementById("totalPago");
const btnContinuarPago = document.getElementById("btnContinuarPago");
const mensajePago = document.getElementById("mensajePago");

const formularioTarjeta = document.getElementById("formularioTarjeta");
const numeroTarjeta = document.getElementById("numeroTarjeta");
const nombreTitular = document.getElementById("nombreTitular");
const vencimiento = document.getElementById("vencimiento");
const cvv = document.getElementById("cvv");
const marcaTarjeta = document.getElementById("marcaTarjeta");

// Inicializar SDK de Mercado Pago (Reemplazar con tu Public Key real)
const mp = new MercadoPago('APP_USR-5cf55932-8c14-4234-ac41-57aa336fe20c');

// ========================================
// 1. RENDERIZAR RESUMEN DE COMPRA
// ========================================
function renderizarResumenPago() {
    if (!resumenPago) return;

    const carrito = obtenerCarrito();
    resumenPago.innerHTML = "";
    let total = 0;

    if (carrito.length === 0) {
        resumenPago.innerHTML = `<p>No hay productos en el carrito.</p>`;
        if (totalPago) totalPago.textContent = "$0";
        return;
    }

    carrito.forEach(producto => {
        const subtotal = producto.precio * producto.cantidad;
        total += subtotal;

        resumenPago.innerHTML += `
            <div class="resumen-producto-pago">
                <img 
                    src="${producto.imagen}" 
                    alt="${producto.nombre}" 
                    class="imagen-pago"
                >
                <div class="info-producto-pago">
                    <h3>${producto.nombre}</h3>
                    <p>Cantidad: ${producto.cantidad}</p>
                </div>
                <strong class="subtotal-pago">
                    $${formatearPrecio(subtotal)}
                </strong>
            </div>
        `;
    });

    if (totalPago) {
        totalPago.textContent = `$${formatearPrecio(total)}`;
    }
}

// ========================================
// 2. MOSTRAR / OCULTAR FORMULARIO DE TARJETA
// ========================================
document.querySelectorAll('input[name="metodoPago"]').forEach(radio => {
    radio.addEventListener("change", () => {
        if (mensajePago) {
            mensajePago.textContent = "";
            mensajePago.className = "mensaje-pago";
        }

        if (formularioTarjeta) {
            if (radio.value === "tarjeta" && radio.checked) {
                formularioTarjeta.classList.remove("oculto");
            } else {
                formularioTarjeta.classList.add("oculto");
            }
        }
    });
});

// ========================================
// 3. FORMATO Y DETECCIÓN DE TARJETA (UI)
// ========================================
if (numeroTarjeta) {
    numeroTarjeta.addEventListener("input", () => {
        let numero = numeroTarjeta.value.replace(/\D/g, "");

        if (marcaTarjeta) {
            if (numero.startsWith("4")) {
                marcaTarjeta.textContent = "VISA";
            } else if (/^5[1-5]/.test(numero)) {
                marcaTarjeta.textContent = "MASTERCARD";
            } else if (/^3[47]/.test(numero)) {
                marcaTarjeta.textContent = "AMEX";
            } else {
                marcaTarjeta.textContent = "";
            }
        }

        numero = numero.substring(0, 16);
        let numeroFormateado = numero.match(/.{1,4}/g);
        numeroTarjeta.value = numeroFormateado ? numeroFormateado.join(" ") : "";
    });
}

if (vencimiento) {
    vencimiento.addEventListener("input", () => {
        let valor = vencimiento.value.replace(/\D/g, "").substring(0, 4);
        if (valor.length >= 3) {
            valor = valor.substring(0, 2) + "/" + valor.substring(2);
        }
        vencimiento.value = valor;
    });
}

// ========================================
// 4. FUNCIONES AUXILIARES DE MENSAJE
// ========================================
function mostrarMensajePago(mensaje, tipo) {
    if (mensajePago) {
        mensajePago.textContent = mensaje;
        mensajePago.className = `mensaje-pago ${tipo}`;
    }
}

// ========================================
// 5. PROCESAR ACCIÓN SEGÚN EL MÉTODO
// ========================================
if (btnContinuarPago) {
    btnContinuarPago.addEventListener("click", async () => {
        const metodoSeleccionado = document.querySelector('input[name="metodoPago"]:checked');

        if (!metodoSeleccionado) {
            mostrarMensajePago("Seleccioná un método de pago.", "error");
            return;
        }

        // OPCIÓN A: MERCADO PAGO (Billetera / Checkout Pro)
        if (metodoSeleccionado.value === "mercadopago") {
            btnContinuarPago.disabled = true;
            mostrarMensajePago("Redirigiendo a Mercado Pago...", "info");

            const carritoRaw = obtenerCarrito();
            const carritoMapeado = carritoRaw.map(item => ({
                id: item.id,
                nombre: item.nombre || item.titulo || "Producto 1A LIBRA",
                precio: Number(item.precio),
                cantidad: Number(item.cantidad),
                variante_id: item.variante_id || null
            }));

            const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo')) || null;
            const usuarioId = usuarioGuardado ? usuarioGuardado.id : null;

            try {
                const respuesta = await fetch('http://localhost:3000/api/checkout/crear-preferencia', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        usuario_id: usuarioId,
                        items: carritoMapeado
                    })
                });

                const data = await respuesta.json();

                if (data.init_point) {
                    window.location.href = data.init_point;
                } else {
                    mostrarMensajePago("Error al conectar con Mercado Pago.", "error");
                    btnContinuarPago.disabled = false;
                }
            } catch (error) {
                console.error("Error al procesar la preferencia:", error);
                mostrarMensajePago("No se pudo conectar con el servidor.", "error");
                btnContinuarPago.disabled = false;
            }
            return;
        }

        // OPCIÓN B: TARJETA DIRECTA EN LA WEB (Checkout API)
        if (metodoSeleccionado.value === "tarjeta") {
            const num = numeroTarjeta ? numeroTarjeta.value.replace(/\D/g, "") : "";
            const nom = nombreTitular ? nombreTitular.value.trim() : "";
            const fec = vencimiento ? vencimiento.value : "";
            const cod = cvv ? cvv.value : "";
            const dniInput = document.getElementById("documentoTitular");
            const dni = dniInput ? dniInput.value.trim() : "";

            if (num.length < 13 || !nom || !/^\d{2}\/\d{2}$/.test(fec) || !/^\d{3,4}$/.test(cod)) {
                mostrarMensajePago("Por favor, completa correctamente los datos de la tarjeta.", "error");
                return;
            }

            btnContinuarPago.disabled = true;
            mostrarMensajePago("Procesando pago con tarjeta...", "info");

            try {
                const [mes, anio] = fec.split("/");
                const cardToken = await mp.createCardToken({
                    cardNumber: num,
                    cardholderName: nom,
                    expirationMonth: mes,
                    expirationYear: "20" + anio,
                    securityCode: cod,
                    identificationType: "DNI",
                    identificationNumber: dni || "11111111"
                });

                const carritoRaw = obtenerCarrito();
                const totalCalculado = carritoRaw.reduce((acc, i) => acc + (i.precio * i.cantidad), 0);
                const usuarioGuardado = JSON.parse(localStorage.getItem('usuarioActivo')) || {};

                const resPago = await fetch("http://localhost:3000/api/checkout/procesar-pago-tarjeta", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        token: cardToken.id,
                        issuer_id: cardToken.issuer_id || null,
                        payment_method_id: cardToken.payment_method_id || "visa",
                        transaction_amount: totalCalculado,
                        installments: 1,
                        payer: {
                            email: usuarioGuardado.email || "cliente@tienda.com",
                            identification: {
                                type: "DNI",
                                number: dni || "11111111"
                            }
                        }
                    })
                });

                const dataPago = await resPago.json();

                if (dataPago.status === "approved") {
                    window.location.href = "pago-exitoso.html";
                } else {
                    mostrarMensajePago("El pago fue rechazado. Revisa los datos ingresados.", "error");
                    btnContinuarPago.disabled = false;
                }

            } catch (errToken) {
                console.error("Error al tokenizar la tarjeta:", errToken);
                mostrarMensajePago("No se pudo validar la tarjeta. Revisa los datos.", "error");
                btnContinuarPago.disabled = false;
            }
        }
    });
}

// ========================================
// INICIALIZACIÓN
// ========================================
actualizarContador();
renderizarResumenPago();