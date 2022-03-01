const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombre:String,
    decripcion: String,
    stock:Number,
    precio: Number,
    nombreCategoria: String,
    vendido: Number
})

module.exports = mongoose.model("productos",ProductosSchema)