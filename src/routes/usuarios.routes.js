const express = require('express');
const usuariosController = require('../controllers/usuario.controller')
const md_autenticacion = require('../middleware/autenticacion')

const api = express.Router();

//rutas
api.post("/login",usuariosController.login)
api.post("/agregarUsuarios",usuariosController.agregarUsuario)
api.put("/editarUsuarios",md_autenticacion.autenticacion,usuariosController.editarUsuarios)

module.exports =api;