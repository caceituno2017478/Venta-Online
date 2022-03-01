const mongoose = require('mongoose');

var Schema = mongoose.Schema;

var FacturaSchema = Schema({
    nit: String,
    idUsuario: {type: Schema.Types.ObjectId, ref: "usuarios"},
    listaProductos:[{
        nombreProducto:String,
        cantidadProducto: Number,
        precioUnitario:Number,
        subTotal:Number,
    }],
    totalFactura: Number
})

module.exports = mongoose.model("faturas",FacturaSchema)