const express = require('express');
const categoriaController = require('../controllers/categorias.controller')
const md_autenticacion = require('../middleware/autenticacion')

const api = express.Router();

//rutas
api.post("/agregarCategoria",md_autenticacion.autenticacion, categoriaController.agregarCategoria)
api.put("/editarCategoria/:idCategoria",md_autenticacion.autenticacion, categoriaController.editarCategoria)
api.delete("/eliminarCategoria/:idCategoria",md_autenticacion.autenticacion, categoriaController.eliminarCategoria)
api.get("/listarCategorias",md_autenticacion.autenticacion, categoriaController.obtenerCategoria)

module.exports =api;