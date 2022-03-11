const express = require('express');
const facturaController = require('../controllers/factura.controller')
const md_autenticacion = require('../middleware/autenticacion')

const api = express.Router();

api.get("/facturas",md_autenticacion.autenticacion,facturaController.visualizarFacturas)
api.get("/facturasPorId/:idFactura",md_autenticacion.autenticacion,facturaController.facturasPorId)

//rutas

module.exports =api;