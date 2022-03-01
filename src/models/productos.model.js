const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombre:String,
    decripcion: String,
    stock:Number,
    precio: Number,
    categorias: [{
        nombreCategoria:String,
        idCategoria:{type: Schema.Types.ObjectId, ref: "categorias"}
    }],
    vendido: Number
})

module.exports = mongoose.model("productos",ProductosSchema)