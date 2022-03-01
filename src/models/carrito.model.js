const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var CarritoSchema = Schema({
    idUsuario: {type: Schema.Types.ObjectId, ref: "usuarios"},
    listaProductos:[{
        nombreProducto:String,
        cantidadProducto: Number,
        precioUnitario:Number,
        subTotal:Number,
    }]
})

module.exports = mongoose.model("carrito",CarritoSchema)