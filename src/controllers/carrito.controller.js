const Carrito = require("../models/carrito.model")
const Productos = require("../models/productos.model")
const Factura = require("../models/factura.model")

// revisar la suma del total en el carrito 
function agregarProductosCarrito(req, res){
    var parametros = req.body;
    if(req.user.rol === "cliente"){

        Carrito.findOne({idUsuario: req.user.sub},(err,carritoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!carritoEncontrado) return res.status(404).send({ mensaje: "El carrito no existe"})

            Productos.findOne({nombre: parametros.nombreProducto},(err,productoEncontrado)=>{
                console.log(productoEncontrado)
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if(productoEncontrado === null) return res.status(500).send({mensaje: "Ese producto no existe"})
                
                let total= 0;
                let cantidadTotal=0;
                let cantidad=0;
                let varibleIngreso = false;
                let totalCarrito =0;

                Carrito.findOne({_id: carritoEncontrado._id,listadoProducto: {$elemMatch: {idProducto: productoEncontrado._id, 
                    nombre: parametros.nombreProducto}}},(err,productoVerificado)=>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(productoVerificado === null) return res.status(500).send({mensaje: "Error al momento de verificar el producto"})
                    console.log(productoVerificado.listaProductos)
                        console.log("llegada al for")
                    for(var e = 0; e < productoVerificado.listaProductos.length ;e++){
                        console.log("ingreso al for")
                        console.log(e)
                        console.log(productoVerificado.listaProductos[e].nombreProducto === parametros.nombreProducto)
                        if(productoVerificado.listaProductos[e].nombreProducto === parametros.nombreProducto){
                            varibleIngreso = true;
                            console.log("ingreso segundo if")
                            Carrito.findOne({_id: carritoEncontrado._id,listaProductos:{$elemMatch:{idProducto: productoEncontrado._id, 
                                nombreProducto: parametros.nombreProducto}}},(err, productoCarrito) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                                    if (!productoCarrito) return res.status(500).send({mensaje: "Error al momento de encontrar el producto"})
                                    for (var i=0 ;i< productoCarrito.listaProductos.length ; i++){
                                        if(productoCarrito.listaProductos[i].nombreProducto === parametros.nombreProducto){
                                            cantidad = productoCarrito.listaProductos[i].cantidadProducto;
                                        }
                                    }
                                    console.log("cantidad"+cantidad)
                                    cantidadTotal = cantidad + Number(parametros.cantidadProducto);
                                    total = (cantidad + Number(parametros.cantidadProducto))* Number(productoEncontrado.precio);

                                    for(var i = 0; i < carritoEncontrado.listaProductos.length; i++){
                                        if(req.user.sub === carritoEncontrado.idUsuario){
                                            totalCarrito += carritoEncontrado.listaProductos[i].subtotal
                                        }
                                    }
        
                                    if(totalCarrito !==0) totalCarrito + total;

                                    if(productoEncontrado.stock < parametros.cantidadProducto){
                                        return res.status(404).send
                                        ({mensaje: `Solo se posee del producto ${productoEncontrado.nombre} la cantidad de producto ${productoEncontrado.stock}`})
                                    }else{
                                        Carrito.findOneAndUpdate({_id: carritoEncontrado._id,listaProductos:{$elemMatch:{idProducto: productoEncontrado._id}}},
                                        {"listaProductos.$.cantidadProducto": cantidadTotal, "listaProductos.$.subTotal":total,
                                        "listaProductos.$.totalCarrito": totalCarrito},
                                        {new: true},(err, productoGuardado) => {
                                                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                                                if(! productoGuardado) return res.status(404).
                                                send({ mensaje: "Se produjo un error al mommento de ingresar un producto"})
                                                console.log(productoGuardado)
                                                return res.status(200).send({ Carrito: productoGuardado})
                                        })
                                    }
                            }) 
                        }
                    }

                    if(varibleIngreso === false){
                        if(parametros.nombreProducto && parametros.cantidadProducto){
                            console.log("ingreso primer if")
                            total = productoEncontrado.precio * parametros.cantidadProducto;
                            console.log("ingreso")

                            for(var i = 0; i < carritoEncontrado.listaProductos.length; i++){
                                if(req.user.sub === carritoEncontrado.idUsuario){
                                    totalCarrito += carritoEncontrado.listaProductos[i].subtotal
                                }
                            }
                            
                            console.log(totalCarrito)

                            if(totalCarrito === 0) totalCarrito + total;

                            if(productoEncontrado.stock < parametros.cantidadProducto){
                                return res.status(404).send
                                ({mensaje: `Solo se posee del producto ${productoEncontrado.nombre} la cantidad de producto ${productoEncontrado.stock}`})
                            }else{

                                
                                Carrito.findByIdAndUpdate(carritoEncontrado._id,{ $push: { listaProductos:{ nombreProducto: parametros.nombreProducto , 
                                    cantidadProducto: parametros.cantidadProducto, precioUnitario: productoEncontrado.precio, subtotal: total,
                                    totalCarrito: totalCarrito, idProducto:productoEncontrado._id}}},
                                    {new :true},(err, productoGuardado)=>{
                                        console.log(productoGuardado)
                                        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                                        if(! productoGuardado) return res.status(404).
                                        send({ mensaje: "Se produjo un error al mommento de ingresar un producto"})
                                        return res.status(200).send({ Carrito: productoGuardado})
                                })
                            }
                        }else{
                            return res.status(404).send({message: "No has llenado todos los campos"})
                        }
                    }
        
                })
        
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
                Carrito.findOne({_id:carritoEncontrado._id,listaProductos:{$elemMatch:{_id:idProductoCarrito}}}
                    ,(err, productoEliminar)=>{
                    if (err) return res.status(500).send({ mensaje: `Error en la peticion${err}`})
                    if(!productoEliminar) return res.status(500).send({mensaje: `Error al eliminar el producto${err}`})

                    console.log(productoEliminar)

                    for(var i=0; i<productoEliminar.listaProductos.length; i++){

                        console.log("coincidencia entre")
                        console.log(productoEliminar.listaProductos[i]._id)
                        console.log(idProductoCarrito)
                        console.log(productoEliminar.listaProductos[i]._id == idProductoCarrito)

                        if(productoEliminar.listaProductos[i]._id == idProductoCarrito){
                            Carrito.findOneAndUpdate({idUsuario: req.user.sub},{$pull:{ listaProductos: 
                                {_id: productoEliminar.listaProductos[i]._id}}}
                                ,(err,productoEliminado)=>{

                                    console.log("productoEliminado")
                                    console.log(productoEliminado)

                                    if (err) return res.status(500).send({ mensaje: `Error en la peticion ${err}`})
                                    if(productoEliminado === null) return res.status(404).send({ mensaje: "Error al momento de eliminar el producto"})
        
                                    return res.status(200).send({Carrito: productoEliminar})
                            })
                        }
                    }
                    
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
                
                for(var i = 0; i< carritoEncontrado.listaProductos.length ; i++){
                    Productos.findOne({nombre: carritoEncontrado.listaProductos[i].nombreProducto},
                        {$inc: {  cantidad: carritoEncontrado.listaProductos[i].cantidadProducto * -1}},
                        (err,productoDisminucion)=>{
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                            if(!productoDisminucion) return res.status(404)
                            .send({mensaje: "Error al momento de encontrar el producto a disminuir"})
                        })
                }

                Carrito.findById(req.user.sub,{$set:{ listaProductos:[], totalCarrito : 0}},(err, valoresCero)=>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if (!valoresCero) return res.status(404).send({mensaje: "Error al momento de poner a cero los valores"})

                    //return res.status(200).send({mensaje: valoresCero})
                })

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