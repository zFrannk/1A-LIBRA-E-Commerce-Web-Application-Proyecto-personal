const express = require("express");
const cors = require("cors");
const path = require("path");
const conexion = require("./db");
const multer = require("multer");
const bcrypt = require("bcrypt");
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");

const app = express();
const PORT = 3000;

// Configurar cliente de Mercado Pago (reemplazar con tu Access Token de prueba)
const client = new MercadoPagoConfig({ 
    accessToken: 'APP_USR-1985538156330820-090718-7a729629dafc6bcf485a1ed56aa82375-3670747457' 
});

// Configuración de fotos en img/productos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../img/productos"));
    },
    filename: (req, file, cb) => {
        const nombreUnico = Date.now() + "-" + file.originalname;
        cb(null, nombreUnico);
    }
});

const upload = multer({ storage: storage });

// ================================
// MIDDLEWARES
// ================================
app.use(cors());
app.use(express.json());
app.use('/img', express.static(path.join(__dirname, '../img')));

// ================================
// RUTAS DE PRUEBA
// ================================
app.get("/", (req, res) => {
    res.json({ mensaje: "Backend de 1A LIBRA funcionando" });
});

app.get("/db-test", (req, res) => {
    conexion.query("SELECT 1 AS conectado", (error, resultados) => {
        if (error) {
            console.error(error);
            return res.status(500).json({ error: "Error al consultar MySQL" });
        }
        res.json({
            mensaje: "Node.js está conectado con MySQL",
            resultado: resultados
        });
    });
});

// ================================
// PRODUCTOS
// ================================
app.get("/api/productos", (req, res) => {
    const query = "SELECT * FROM productos WHERE activo = TRUE";
    conexion.query(query, (error, resultados) => {
        if (error) {
            console.error("Error al obtener productos:", error);
            return res.status(500).json({ error: "Error al obtener productos." });
        }
        res.json(resultados);
    });
});

app.get("/api/productos/:id", (req, res) => {
    const { id } = req.params;
    const query = "SELECT * FROM productos WHERE id = ? AND activo = TRUE";
    conexion.query(query, [id], (error, resultados) => {
        if (error) return res.status(500).json({ error: "Error en el servidor" });
        if (resultados.length === 0) return res.status(404).json({ error: "Producto no encontrado" });
        res.json(resultados[0]);
    });
});

app.post("/api/productos", upload.single("imagen"), (req, res) => {
    const { nombre, descripcion, precio, stock, categoria } = req.body;
    const imagen = req.file ? req.file.filename : "default.jpg";

    if (!nombre || !precio) {
        return res.status(400).json({ error: "Nombre y precio son obligatorios." });
    }

    const query = `INSERT INTO productos (nombre, descripcion, precio, stock, categoria, imagen) VALUES (?, ?, ?, ?, ?, ?)`;
    const valores = [nombre, descripcion || "", precio, stock || 0, categoria || "General", imagen];

    conexion.query(query, valores, (error, resultado) => {
        if (error) return res.status(500).json({ error: "Error al guardar producto." });
        res.status(201).json({ mensaje: "Producto creado con éxito", id: resultado.insertId });
    });
});

app.put("/api/productos/:id", upload.single("imagen"), (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, categoria } = req.body;

    let query = "";
    let valores = [];

    if (req.file) {
        query = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?, imagen = ? WHERE id = ?`;
        valores = [nombre, descripcion, precio, stock, categoria, req.file.filename, id];
    } else {
        query = `UPDATE productos SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ? WHERE id = ?`;
        valores = [nombre, descripcion, precio, stock, categoria, id];
    }

    conexion.query(query, valores, (error) => {
        if (error) return res.status(500).json({ error: "Error al actualizar producto." });
        res.json({ mensaje: "Producto actualizado con éxito." });
    });
});

app.delete("/api/productos/:id", (req, res) => {
    const { id } = req.params;
    conexion.query("DELETE FROM productos WHERE id = ?", [id], (error) => {
        if (error) return res.status(500).json({ error: "No se pudo eliminar el producto." });
        res.json({ mensaje: "Producto eliminado correctamente." });
    });
});

// ================================
// AUTENTICACIÓN (REGISTRO Y LOGIN)
// ================================
app.post("/api/registro", async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    conexion.query("SELECT id FROM usuarios WHERE email = ?", [email], async (error, resultados) => {
        if (error) return res.status(500).json({ error: "Error en el servidor." });
        if (resultados.length > 0) return res.status(400).json({ error: "El correo ya está registrado." });

        const passwordHash = await bcrypt.hash(password, 10);
        const queryInsert = "INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES (?, ?, ?, 'cliente')";

        conexion.query(queryInsert, [nombre, email, passwordHash], (errInsert, result) => {
            if (errInsert) return res.status(500).json({ error: "No se pudo crear la cuenta." });
            
            console.log("🟢 Usuario registrado con éxito:", email);
            res.status(201).json({
                mensaje: "Registro exitoso.",
                usuario: { id: result.insertId, nombre, email, rol: "cliente" }
            });
        });
    });
});

app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Por favor completa todos los campos." });
    }

    conexion.query("SELECT * FROM usuarios WHERE email = ?", [email], async (error, resultados) => {
        if (error) return res.status(500).json({ error: "Error interno en la base de datos." });
        if (resultados.length === 0) return res.status(401).json({ error: "Credenciales inválidas." });

        const usuario = resultados[0];
        const coincide = await bcrypt.compare(password, usuario.password_hash);

        if (!coincide) {
            return res.status(401).json({ error: "Contraseña incorrecta." });
        }

        delete usuario.password_hash;
        console.log("🟢 Login exitoso para:", usuario.email);

        res.json({
            mensaje: "Login exitoso",
            usuario: usuario
        });
    });
});

// ================================
// MERCADO PAGO Y CHECKOUT
// ================================
app.post("/api/checkout/crear-preferencia", (req, res) => {
    const { usuario_id, items } = req.body;

    if (!items || items.length === 0) {
        return res.status(400).json({ error: "El carrito está vacío." });
    }

    const total = items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    // 1. Guardar el pedido
    const queryPedido = "INSERT INTO pedidos (usuario_id, total, estado) VALUES (?, ?, 'pendiente')";
    conexion.query(queryPedido, [usuario_id || null, total], async (err, resultPedido) => {
        if (err) {
            console.error("Error al crear pedido:", err);
            return res.status(500).json({ error: "Error al procesar la orden." });
        }

        const pedidoId = resultPedido.insertId;

        // 2. Guardar los detalles del pedido
        const valoresDetalle = items.map(item => [pedidoId, item.id, item.variante_id || null, item.cantidad, item.precio]);
        const queryDetalle = "INSERT INTO detalle_pedidos (pedido_id, producto_id, variante_id, cantidad, precio_unitario) VALUES ?";
        
        conexion.query(queryDetalle, [valoresDetalle], async (errDetalle) => {
            if (errDetalle) {
                console.error("Error al guardar detalle del pedido:", errDetalle);
                return res.status(500).json({ error: "Error al guardar el detalle del pedido." });
            }

            try {
                // 3. Crear Preferencia en Mercado Pago
                const preferenceItems = items.map(item => ({
                    id: String(item.id),
                    title: item.nombre,
                    unit_price: Number(item.precio),
                    quantity: Number(item.cantidad),
                    currency_id: "ARS"
                }));

                const preference = new Preference(client);
                const response = await preference.create({
                    body: {
                        items: preferenceItems,
                        external_reference: String(pedidoId),
                        back_urls: {
                            success: "http://localhost:3000/pagos.html",
                            failure: "http://localhost:3000/pagos.html",
                            pending: "http://localhost:3000/pagos.html"
                        },
                    }
                });

                // 4. Guardar MP Preference ID
                conexion.query("UPDATE pedidos SET mp_preference_id = ? WHERE id = ?", [response.id, pedidoId], () => {
                    res.json({ init_point: response.init_point });
                });

            } catch (errorMP) {
                console.error("Error al generar preferencia en MP:", errorMP);
                res.status(500).json({ error: "No se pudo conectar con Mercado Pago." });
            }
        });
    });
});

// Webhook de confirmación de pago
app.post("/api/checkout/webhook", async (req, res) => {
    const { type, data } = req.body;

    if (type === "payment") {
        try {
            const payment = new Payment(client);
            const pagoInfo = await payment.get({ id: data.id });

            if (pagoInfo.status === "approved") {
                const pedidoId = pagoInfo.external_reference;

                // 1. Marcar pedido como 'aprobado'
                conexion.query("UPDATE pedidos SET estado = 'aprobado' WHERE id = ?", [pedidoId], (err) => {
                    if (err) console.error("Error al actualizar estado del pedido:", err);

                    // 2. Traer items para descontar stock
                    conexion.query("SELECT producto_id, variante_id, cantidad FROM detalle_pedidos WHERE pedido_id = ?", [pedidoId], (errItems, items) => {
                        if (!errItems && items) {
                            items.forEach(item => {
                                if (item.variante_id) {
                                    conexion.query("UPDATE producto_variantes SET stock = stock - ? WHERE id = ?", [item.cantidad, item.variante_id]);
                                } else {
                                    conexion.query("UPDATE productos SET stock = stock - ? WHERE id = ?", [item.cantidad, item.producto_id]);
                                }
                            });
                        }
                    });
                });
            }
        } catch (error) {
            console.error("Error procesando Webhook:", error);
        }
    }

    res.sendStatus(200);
});

// ================================
// MERCADO PAGO - PAGO DIRECTO CON TARJETA (Checkout API)
// ================================
app.post("/api/checkout/procesar-pago-tarjeta", async (req, res) => {
    const { token, issuer_id, payment_method_id, transaction_amount, installments, payer } = req.body;

    try {
        const payment = new Payment(client);
        const respuestaPago = await payment.create({
            body: {
                token,
                issuer_id,
                payment_method_id,
                transaction_amount: Number(transaction_amount),
                installments: Number(installments),
                payer: {
                    email: payer.email,
                    identification: {
                        type: payer.identification.type || "DNI",
                        number: payer.identification.number
                    }
                }
            }
        });

        if (respuestaPago.status === "approved") {
            res.json({ status: "approved", id: respuestaPago.id });
        } else {
            res.status(400).json({ 
                status: respuestaPago.status, 
                detail: respuestaPago.status_detail,
                error: "El pago no pudo ser procesado." 
            });
        }

    } catch (error) {
        console.error("Error al procesar el pago con tarjeta:", error);
        res.status(500).json({ error: "Ocurrió un error al procesar el pago con la tarjeta." });
    }
});

// ================================
// INICIAR SERVIDOR (SIEMPRE AL FINAL)
// ================================
app.listen(PORT, () => {
    console.log(`Servidor funcionando en http://localhost:${PORT}`);
});