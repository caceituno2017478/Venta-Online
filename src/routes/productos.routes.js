const express = require('express');
const productosController = require('../controllers/producto.controller')
const md_autenticacion = require('../middleware/autenticacion')

const api = express.Router();

//rutas
api.post("/agregarProductos",md_autenticacion.autenticacion,productosController.agregarProducto)
api.put("/editarProducto/:idProducto",md_autenticacion.autenticacion,productosController.editarProducto)
api.delete("/eliminarProducto/:idProducto",md_autenticacion.autenticacion,productosController.eliminarProducto)
api.post("/buscarProductosNombre",md_autenticacion.autenticacion,productosController.buscarProductoPorNombre)
api.post("/buscarCategoriaNombre",md_autenticacion.autenticacion,productosController.buscarCategoriaPorNombre)
api.get("/productosAgotados",md_autenticacion.autenticacion,productosController.productosAgotados)
api.get("/productoMasVendido",md_autenticacion.autenticacion,productosController.productoMasVendido)
module.exports =api;