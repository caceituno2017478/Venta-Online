const express = require('express');
const cors = require('cors');
var app = express();

// aqui se importan las rutas
// ejemplo
//const ejemploRutas = require('./src/routers/ejemplo.routes');

/* indicar las rutas*/

//middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//cabecera
app.use(cors());

// carga de rutas las
// colocar una, y la ruta

/* colocar la ruta llamandola por la variable*/
app.use('/api');

module.exports = app;