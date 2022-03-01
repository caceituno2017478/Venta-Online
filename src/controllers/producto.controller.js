const Productos = require('../models/productos.model')
const Categoria = require('../models/categoria.model')

function agregarProducto(req,res) {

    if(req.user.rol === "administrador"){
        var parametros = req.body;
        var modeloProducto = Productos();
        if(parametros.nombre && parametros.descripcion && parametros.stock && parametros.precio){
            var totalStock;
    Productos.findOne({nombre: parametros.nombre},(err, productoEncontrado) =>{
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        console.log(productoEncontrado)
        if(productoEncontrado === null){
            console.log("ingreso incesario2")
                modeloProducto.nombre = parametros.nombre;
                modeloProducto.descripcion = parametros.descripcion;
                modeloProducto.stock = parametros.stock;
                modeloProducto.precio = parametros.precio;
                modeloProducto.vendido = 0;
                Categoria.findOne({nombre: parametros.categoria}, (err, categoriaEncontrada)=>{
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(categoriaEncontrada !== null ) {
                        modeloProducto.nombreCategoria =  parametros.categoria;
                        modeloProducto.save((err, productoGuardado) => {
                            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                            if(!productoGuardado) return res.status(404)
                            .send({ mensaje: "Error al momento de guardar el producto"})
                            return res.status(200).send({ producto: productoGuardado})
                        })
                    }else{
                        return res.status(404).send({mensaje: "Debe crear primero la categoria"})
                    }
                })
        }else{
            
            /* agregar mas productos en stock*/ 
            totalStock =Number(parametros.stock) + productoEncontrado.stock;
            console.log(parametros.stock)
            Productos.findByIdAndUpdate(productoEncontrado._id,{stock: totalStock},{new : true},
                (err, agregarProductos)=>{
                    if (err) return res.status(500).send({ mensaje: `Error en la peticion ${err}`})
                    if (!agregarProductos) return res.status(500)
                    .send({ mensaje: "Error al momento de agregar productos"})
                    return res.status(200).send({ producto: agregarProductos})
            })
        }
    })
        }else{
            return res.status(404).send({mensaje: "No has llenado todos los campos"})
        }
    }else{
        return res.status(404).send({mensaje: "No posees los permisos necesarios"})
    } 
}


function editarProducto(req,res) {
    if(req.user.rol === "administrador"){
        var idProd = req.params.idProducto;
        var parametros = req.body;
        Productos.findById(idProd,(err, productoEncontradoId)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(productoEncontradoId=== null) return res.status(404)
            .send({ mensaje:"El producto no existe"})

            if(parametros.vendido){
                return res.status(404).send({mensaje:"no posees los permisos para editar ese campo"})
            }else{
                Productos.findByIdAndUpdate(idProd, parametros, {new: true},(err,productoModificado)=>{
                    if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(!productoModificado) return res.status(404)
                    .send({ mensaje: "Error al momento de modificar"})
                    return res.status(200).send({productos: productoModificado})
                })
            }
        })
    }else{
        return res.status(404)
    .send({mensaje: "No posees los permisos necesarios"})
    }
}

/* tomar en cuenta que se debe de eliminar tambien en el carrito de compras*/

function eliminarProducto(req,res){
    if(req.user.rol === "administrador") {
        var idProd = req.params.idProducto;
        Productos.findById(idProd,(err,productoEncontrado)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(productoEncontrado=== null) return res.status(404)
            .send({ mensaje:"El producto no existe"})

            Productos.findByIdAndDelete(idProd,(err,productoEliminado)=>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if(!productoEliminado) return res.status(404)
                .send({ mensaje:"Error al eiminar el producto"})

                return res.status(200).send({ productos : productoEliminado})
            })
        }) 
    }else{
        return res.status(404)
    .send({mensaje: "No posees los permisos necesarios"})
    } 
}

module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto
}