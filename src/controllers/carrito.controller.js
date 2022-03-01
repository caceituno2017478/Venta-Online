const Carrito = require("../models/carrito.model")
const Productos = require("../models/productos.model")
const Factura = require("../models/factura.model")


function agregarProductosCarrito(req, res){
    var idUsuarioCarrito = req.user.sub;
    var parametros = req.body;

    if(req.user.rol === "cliente"){

        Productos.findOne({nombre: parametros.nombreProducto},(err,productoEncontrado)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!productoEncontrado) return res.status(500).send({mensaje: "Error al momento de ingresar un producto"})
    
            let total ;
    
            Carrito.findOne({listaProductos:{nombreProducto: parametros.nombreProducto}},(err,productoVerificado)=>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if(productoVerificado === null){
    
                    total = productoEncontrado.precio * parametros.cantidadProducto;
    
                    Carrito.findByIdAndUpdate(idUsuarioCarrito,{ $push: { listaProductos:{ nombreProducto: parametros.nombreProducto , 
                        cantidadProducto: parametros.cantidadProducto, precioUnitario: productoEncontrado.precio, subtotal: total}}},
                        (err, productoGuardado)=>{
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                            if(! productoGuardado) return res.status(404).
                            send({ mensaje: "Se produjo un error al mommento de ingresar un producto"})
                            return res.status(200).send({ Carrito: productoGuardado})
                    })
    
                }else{
    
                    total = (productoVerificado.cantidadProducto + parametros.cantidadProducto)* productoEncontrado.precio;
    
                    Carrito.findByIdAndUpdate(idUsuarioCarrito,{ $push: { listaProductos:{cantidadProducto: parametros.cantidadProducto, subtotal: total}}},
                        (err, productoGuardado)=>{
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                            if(! productoGuardado) return res.status(404).
                            send({ mensaje: "Se produjo un error al mommento de ingresar un producto"})
                            return res.status(200).send({ Carrito: productoGuardado})
                    })
                }
    
            })
    
            
        })

    }else{
        return res.status(404).send({mensaje: "No posees los permisos necesarios"})
    }

}

function eliminarCarritoProducto(req,res){
    var idProductoCarrito = req.params.idProductoCarrito;
    if(req.user.rol === "cliente"){
        Carrito.findOne({idUsuario: req.user.sub},(err, carritoEncontrado)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(carritoEncontrado !== null){
                Carrito.findByIdAndDelete({listadoPorducto:{_id: idProductoCarrito}},(err, productoEliminar)=>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(!productoEliminar) return res.status(500).send({mensaje: "Error al eliminar el producto"})

                    return res.status(200).send({carrito: productoEliminar})
                })
            }else{
                return res.status(404).send({mensaje: "Error al encontrar el carrito"})
            }
        })
    }else{
        return res.status(404).send({mensaje: "No posees los permisos necesarios"})
    }

}

function pasarDatosFactura(req,res){
    
    if(req.user.rol === "cliente"){
        Carrito.findOne({idUsuario: req.user.sub},(err, carritoEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!carritoEncontrado) return res.status(404).send({mensaje: "Carrito no encontrado"})

            var modeloFactura = Factura();

            modeloFactura.listaProductos = carritoEncontrado.listaProductos;
            modeloFactura.idUsuario = req.user.sub;
            modeloFactura.save((err, facturaGuardar) =>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if(!facturaGuardar) return res.status(404).send({mensaje: "Error al momento de guardar la factura"})
                
                return res.status(200).send({factura: "fatura genera con exito \n" +facturaGuardar})
            })

        })
    }else{
        return res.status(404).send({mensaje : " no posees los permisos necesarios"})
    }

}


module.exports = {
    agregarProductosCarrito,
    eliminarCarritoProducto,
    pasarDatosFactura
}