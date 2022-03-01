const express = require('express');
const productosController = require('../controllers/producto.controller')
const md_autenticacion = require('../middleware/autenticacion')

const api = express.Router();

//rutas
api.post("/agregarProductos",md_autenticacion.autenticacion,productosController.agregarProducto)
api.put("/editarProducto/:idProducto",md_autenticacion.autenticacion,productosController.editarProducto)
api.delete("/eliminarProducto/:idProducto",md_autenticacion.autenticacion,productosController.eliminarProducto)

module.exports =api;