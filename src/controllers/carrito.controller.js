const Carrito = require("../models/carrito.model")
const Productos = require("../models/productos.model")
const Factura = require("../models/factura.model")

function agregarProductosCarrito(req, res){
    var parametros = req.body;
    if(req.user.rol === "cliente"){
        // verifica la ecistencia del carrito
        Carrito.findOne({idUsuario: req.user.sub},(err,carritoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!carritoEncontrado) return res.status(404).send({ mensaje: "El carrito no existe"})
            // verifica la existencia del carrito
            Productos.findOne({nombre: parametros.nombreProducto},(err,productoEncontrado)=>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if(productoEncontrado === null) return res.status(500).send({mensaje: "Ese producto no existe"})
                
                let subtotal= 0, subtotalGeneral=0 , cantidadTotal=0 ,totalCarrito =0 ,cantidadVerificacion = 0,
                verificacionStock =0;
                let varibleIngreso = false;


                for (let i = 0; i < carritoEncontrado.listaProductos.length; i++) {
                    if(carritoEncontrado.listaProductos[i].nombreProducto === parametros.nombreProducto)
                    verificacionStock += carritoEncontrado.listaProductos[i].cantidadProducto;
                }
                cantidadVerificacion = verificacionStock + Number(parametros.cantidadProducto);
                cantidadTotal = (productoEncontrado.stock-cantidadVerificacion)*-1;
                if(cantidadVerificacion > productoEncontrado.stock ){
                    if(productoEncontrado.stock === 0){
                        return res.status(200).send({ mensaje: "Sea agotado este producto"})
                    }else{
                        return res.status(200).send({ mensaje: `Su orden se excede por ${cantidadTotal}`})
                    }
                }

                for(var i = 0 ; i < carritoEncontrado.listaProductos.length ; i++){

                    if(carritoEncontrado.listaProductos[i].nombreProducto === parametros.nombreProducto){

                        if(productoEncontrado.stock < parametros.cantidadProducto){
                            return res.status(404).send
                            ({mensaje: `Solo se posee del producto ${productoEncontrado.nombre} la cantidad de producto ${productoEncontrado.stock}`})
                        }else{

                            varibleIngreso = true;
                            for(var j = 0; j < carritoEncontrado.listaProductos.length;j++){
                                if(carritoEncontrado.listaProductos[j].nombreProducto === parametros.nombreProducto)
                                cantidadTotal += carritoEncontrado.listaProductos[j].cantidadProducto;
                            }
                            cantidadTotal += Number(parametros.cantidadProducto);
                            subtotalGeneral = Number(productoEncontrado.precio) * cantidadTotal;
                            subtotal=Number(productoEncontrado.precio) * Number(parametros.cantidadProducto)

                            for(var i = 0; i < carritoEncontrado.listaProductos.length; i++){
                                totalCarrito += carritoEncontrado.listaProductos[i].subTotal
                            }

                            totalCarrito += subtotal;

                            Carrito.findOneAndUpdate({_id: carritoEncontrado._id,listaProductos:{$elemMatch:{idProducto: productoEncontrado._id}}},
                            {"listaProductos.$.cantidadProducto": cantidadTotal, "listaProductos.$.subTotal":subtotalGeneral,
                            $set: {total: totalCarrito}},{new: true},(err, productoGuardado) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                                    if(! productoGuardado) return res.status(404).
                                    send({ mensaje: "Se produjo un error al mommento de ingresar un producto"})
                                    return res.status(200).send({ Carrito: productoGuardado})
                            })
                        }


                    }
                }

                if(varibleIngreso === false){
                    if(parametros.nombreProducto && parametros.cantidadProducto){

                        if(productoEncontrado.stock < parametros.cantidadProducto){
                            return res.status(404).send
                            ({mensaje: `Solo se posee del producto ${productoEncontrado.nombre} la cantidad de producto ${productoEncontrado.stock}`})
                        }else{

                            // calcula el subtotal de listaProductos
                            subtotal = productoEncontrado.precio * parametros.cantidadProducto;
                            for(var i = 0; i < carritoEncontrado.listaProductos.length; i++){
                                totalCarrito += carritoEncontrado.listaProductos[i].subTotal
                            }

                            totalCarrito= totalCarrito + subtotal;

                            Carrito.findByIdAndUpdate(carritoEncontrado._id,{ $push: { listaProductos:{ nombreProducto: parametros.nombreProducto , 
                                cantidadProducto: parametros.cantidadProducto, precioUnitario: productoEncontrado.precio, subTotal: subtotal,
                                idProducto:productoEncontrado._id}},$set:{total: totalCarrito}},
                                {new :true},(err, productoGuardado)=>{
                                    if (err) return res.status(500).send({ mensaje: `Error en la peticion ${err}`})
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
    }else{
        return res.status(404).send({mensaje: "No posees los permisos necesarios"})
    }

}

function eliminarCarritoProducto(req,res){
    var idProductoCarrito = req.params.idProductoCarrito;
    if(req.user.rol === "cliente"){
        Carrito.findOne({idUsuario: req.user.sub},(err, carritoEncontrado)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion al momento de buscar el carrtio"})
            if(carritoEncontrado !== null){

                let totalProductoBorrar=0;
                let totalCorregido=0;

                for(var i = 0; i < carritoEncontrado.listaProductos.length; i++){
                    if(carritoEncontrado.listaProductos[i].idProducto === idProductoCarrito){
                        totalProductoBorrar += carritoEncontrado.listaProductos[i].subTotal;
                    }
                    totalCorregido += carritoEncontrado.listaProductos[i].subTotal;
                }
                
                totalCorregido -= totalProductoBorrar;

                Carrito.findOneAndUpdate({idUsuario: req.user.sub},{$set:{total: totalCorregido}},(err,productoCorregido)=>{
                    if(err) return res.status(500).send({ mensaje: `Error en la peticion de producto corregido ${err}`})
                    if(productoCorregido === null) return res.status(404).send({ mensaje: "Error al momento de corregir el total"})

                    for(var i=0; i<carritoEncontrado.listaProductos.length; i++){
                        if(carritoEncontrado.listaProductos[i].idProducto == idProductoCarrito){

                            Carrito.findOneAndUpdate({idUsuario: req.user.sub},{$pull:{ listaProductos: 
                                {idProducto: carritoEncontrado.listaProductos[i].idProducto}}}
                                ,(err,productoEliminado)=>{
                                    if (err) return res.status(500).send({ mensaje: `Error en la peticion ${err}`})
                                    if(productoEliminado === null) return res.status(404).send({ mensaje: "Error al momento de eliminar el producto"})

                                    return res.status(200).send({Carrito: carritoEncontrado})
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

            for(var i = 0; i < carritoEncontrado.listaProductos.length;i++){
                
            }

            var modeloFactura = Factura();

            modeloFactura.listaProductos = carritoEncontrado.listaProductos;
            modeloFactura.idUsuario = req.user.sub;
            modeloFactura.totalFactura = carritoEncontrado.total;
            modeloFactura.save((err, facturaGuardar) =>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if(!facturaGuardar) return res.status(404).send({mensaje: "Error al momento de guardar la factura"})

                restarInc(carritoEncontrado,res);
                Carrito.findOneAndUpdate({idUsuario: req.user.sub},{$set:{listaProductos:[],total:0}},
                    (err, valoresCero)=>{
                    if (err) return res.status(500).send({ mensaje: `Error en la peticion al momento de setear los valores a 0 ${err}`})
                    if (!valoresCero) return res.status(404).send({mensaje: `Error al momento de poner a cero los valores ${valoresCero}`})

                    return res.status(200).send({factura: "fatura genera con exito"})
                })
            })

        })
    }else{
        return res.status(404).send({mensaje : " no posees los permisos necesarios"})
    }

}

function restarInc(carritoEncontrado,res){
    for(var i = 0; i< carritoEncontrado.listaProductos.length ; i++){

        Productos.findOneAndUpdate({nombre: carritoEncontrado.listaProductos[i].nombreProducto},
            {$inc: {  stock: carritoEncontrado.listaProductos[i].cantidadProducto * -1, 
            vendido: carritoEncontrado.listaProductos[i].cantidadProducto}},
            (err,productoDisminucion)=>{
                if (err) return res.status(500).send({ mensaje: `Error en la peticion al disminuir ${err}`})
                if(!productoDisminucion) return res.status(404)
                .send({mensaje: "Error al momento de encontrar el producto a disminuir"})      
        })
    }
}


module.exports = {
    agregarProductosCarrito,
    eliminarCarritoProducto,
    pasarDatosFactura
}