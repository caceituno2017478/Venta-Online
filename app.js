const express = require('express');
const cors = require('cors');
var app = express();

// aqui se importan las rutas

const carritoRutas=require('./src/routes/carrito.routes');
const categoriaRutas = require('./src/routes/categoria.routes');
const facturaRutas= require('./src/routes/factura.routes')
const productoRutas = require('./src/routes/productos.routes');
const usuarioRutas = require('./src/routes/usuarios.routes')

//middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//cabecera
app.use(cors());

// carga de rutas las
// colocar una, y la ruta

/* colocar la ruta llamandola por la variable*/
app.use('/api',carritoRutas,categoriaRutas,facturaRutas,productoRutas,usuarioRutas);

module.exports = app;