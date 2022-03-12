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
        if(productoEncontrado === null){
                modeloProducto.nombre = parametros.nombre;
                modeloProducto.descripcion = parametros.descripcion;
                modeloProducto.stock = parametros.stock;
                modeloProducto.precio = parametros.precio;
                if(parametros.vendido === undefined){
                    modeloProducto.vendido = 0;
                    Categoria.findOne({nombre: parametros.nombreCategoria}, (err, categoriaEncontrada)=>{
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
                        if(categoriaEncontrada !== null ) {
                            modeloProducto.nombreCategoria =  parametros.nombreCategoria;
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
                    return res.status(404).send({mensaje: "No posees lo permisos para para manipular ese campo"})
                }
        }else{
            
            /* agregar mas productos en stock*/ 
            if(productoEncontrado.nombre === parametros.nombre && 
                productoEncontrado.nombreCategoria === parametros.nombreCategoria){ 
                   
                totalStock =Number(parametros.stock) + productoEncontrado.stock;
                Productos.findByIdAndUpdate(productoEncontrado._id,{stock: totalStock},{new : true},
                    (err, agregarProductos)=>{
                        if (err) return res.status(500).send({ mensaje: `Error en la peticion ${err}`})
                        if (!agregarProductos) return res.status(500)
                        .send({ mensaje: "Error al momento de agregar productos"})
                        return res.status(200).send({ producto: agregarProductos})
                })    

            }else{
                return res.status(404).send({mensaje: "El producto que desea agregar ya existe"})
            }
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

function buscarProductoPorNombre(req,res){
    if(req.user.rol === "cliente"){
        var parametros = req.body;
        Productos.findOne({nombre: parametros.nombre},(err,productoEncontrados)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!productoEncontrados) return res.status(404).send({ mensaje: "Error al momento de buscar los productos"})

            return res.status(200).send({Producto: productoEncontrados})
        })
    }else{
        return res.status(404).send({mensaje: "No posees lo permisos necesarios"})
    }
}

function buscarCategoriaPorNombre(req,res){
    if(req.user.rol === "cliente"){
        var parametros = req.body;
        Productos.find({nombreCategoria: parametros.nombreCategoria},(err,categoriaEncontradas)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(categoriaEncontradas.length === 0) return res.status(404).send({ mensaje: "Esa categoria no a sido asignada"})

            return res.status(200).send({Producto: categoriaEncontradas})
        })
    }else{
        return res.status(404).send({mensaje: "No posees lo permisos necesarios"})
    }
}

function productosAgotados(req,res){
    if(req.user.rol === "administrador" || req.user.rol === "cliente"){
        Productos.find({stock: 0},(err,productosEncontrados)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(productosEncontrados.length === 0) return res.status(404).send({ mensaje: "En este momento no hay productos agotados"})
            
            return res.status(404).send({productos: productosEncontrados})
        })
    }else{
        return res.status(404).send({mensaje: "No posees lo permisos necesarios"})
    }
}

function productoMasVendido(req,res){
    if(req.user.rol === "administrador" || req.user.rol === "cliente"){
        Productos.find({},(err, producto)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!producto) return res.status(404).send({ mensaje: "Error al momento de encontrar el producto"})
    
            return res.status(200).send({ producto : producto.sort((a,b)=>{
                if(a.vendido < b.vendido){
                    return 1;
                }
                if(a.vendido > b.vendido){
                    return -1;
                }
                if(a.nombre.toLowerCase() > b.nombre.toLowerCase()){
                    return 1;
                }
                if(a.nombre.toLowerCase() < b.nombre.toLowerCase()){
                    return -1;
                }
                return 0;
            })})
        })
    }else{
        return res.status(404).send({mensaje: "No posees lo permisos necesarios"})
    }
}

function visualizarProductos(req,res){
    if(req.user.rol === "administrador"){
        Productos.find({},(err,productos)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(productos.length === 0) return res.status(404).send({ mensaje: "No hay productos disponibles"})
            return res.status(200).send({productos: productos})
        })
    }else{
        return res.status(404).send({mensaje: "No posees lo permisos necesarios"})
    }
}

module.exports = {
    agregarProducto,
    editarProducto,
    eliminarProducto,
    buscarProductoPorNombre,
    buscarCategoriaPorNombre,
    productosAgotados,
    productoMasVendido,
    visualizarProductos
}