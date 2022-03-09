const express = require('express');
const carritoController = require('../controllers/carrito.controller')
const md_autenticacion = require('../middleware/autenticacion')

const api = express.Router();

//rutas
/* para agregar datos a al carrito en productos*/
api.post("/agregarProductoCarrito",md_autenticacion.autenticacion,carritoController.agregarProductosCarrito)
/* para eliminar datos a al carrito en productos*/
api.delete("/eliminarProductoCarrito/:idProductoCarrito",md_autenticacion.autenticacion,carritoController.eliminarCarritoProducto)
/* para pasar lo datoa factura*/
api.get("/pasarDatosFactura",md_autenticacion.autenticacion,carritoController.pasarDatosFactura)

module.exports =api;