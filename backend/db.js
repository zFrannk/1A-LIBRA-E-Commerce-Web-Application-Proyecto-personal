const mysql = require("mysql2");

const conexion = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "372626franUvU.",

    database: "tienda_1a_libra"

});


conexion.connect(error => {

    if (error) {

        console.error(
            "Error al conectar con MySQL:",
            error.message
        );

        return;
    }

    console.log(
        "Conectado correctamente a MySQL"
    );

});


module.exports = conexion;