const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ProductosSchema = Schema({
    nombre:String,
    decripcion: String,
    stock:String,
    precio: String,
    categorias: [{
        nombreCategoria:String,
        idCategoria:{type: Schema.Types.ObjectId, ref: "categorias"}
    }]
})

module.exports = mongoose.model("productos",ProductosSchema)