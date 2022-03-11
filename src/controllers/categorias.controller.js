const Categorias = require('../models/categoria.model')
const Productos = require('../models/productos.model')

function agregarCategoria(req,res){
    if(req.user.rol === "administrador"){
        var parametros = req.body;
        var modelCategoria = new Categorias();
        if(parametros.nombre || parametros.descripcion){
            Categorias.findOne({nombre: parametros.nombre},(err, categoriaEncontrado) =>{
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                
                if(categoriaEncontrado === null){
                    modelCategoria.nombre = parametros.nombre;
                    modelCategoria.descripcion = parametros.descripcion;
                    modelCategoria.save((err,usuarioGuardado)=>{
                        if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                        if(!usuarioGuardado) return res.status(404).send({ mensaje:"Error al agregar el usuario"})
                        console.log("al momento de agregar")
                        return res.status(200).send({ categoria: usuarioGuardado })
                    })
                }else{
                    return res.status( 200).send({mensaje: "Categoria ya existe"})
                }
            }) 
        }else{
            return res.status(404).send({message : "No has llenado todos los campos"})
        }
    }else{
        return res.status(404).send({ mensaje: "No posees los permisos necesarios"})
    }
}

function editarCategoria(req,res){
    if(req.user.rol === "administrador"){
        var parametros = req.body;
        var idCat = req.params.idCategoria;

        if(parametros.nombre) return res.status(200).send({ mensaje: "Este tipo de datos no se pueden modificar"})

        Categorias.findOne({nombre: parametros.nombre},(err,verfificacionCategoria)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(verfificacionCategoria=== null){
                Categorias.findByIdAndUpdate(idCat, parametros, {new: parametros}, (err, categoriaEditada)=>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(!categoriaEditada) return res.status(404).send({ mensaje:"Error al editar la categoria"})
                    return res.status(200).send({ categoria: categoriaEditada})
                })
            } else{
                return res.status(200).send({ mensaje: "Esta categoria ya existe"})
            }
        })

    }else{
        return res.status(404).send({ mensaje: "No posees los permisos necesarios"})
    }
}


// revisar se debe agregar la categoria por default
function eliminarCategoria(req, res) {
    if(req.user.rol === "administrador"){
        var idCat = req.params.idCategoria;
        Categorias.findOne({ nombre: "default" }, (err, busquedaDefault) => {
            if(err) return res.status(500).send({ mensaje:"Error en la peticion existe default"})
            if(busquedaDefault === null) return res.status(404).send({ mensaje: "Error al encontrar la categoria default"})
                Categorias.findById(idCat,(err, categoriaEncontradoId) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(!categoriaEncontradoId) return res.status(404).send({mensaje: "categoria no exite"})
                
                    Productos.updateMany({nombreCategoria: categoriaEncontradoId.nombre},
                        {$set:{nombreCategoria: busquedaDefault.nombre}},
                        (err, productoModificadoDefault)=>{
                                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                
                                Categorias.findByIdAndDelete(idCat,(err,categoriaEliminada) => {
                                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                                    if(categoriaEliminada === null)
                                        return res.status(404).send({ mensaje: "Error al eliminar la categoria"})
                                
                                    return res.status(200).send({categoria : categoriaEliminada})
                                })
                
                    })
                })
        })
    }else{
        return res.status(404).send({Mesaje: "No posees los permisos necesarios"})
    }   
}

function obtenerCategoria(req,res){
    if(req.user.rol === "administrador"){
        Categorias.find((err,categoriaEncontrada)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(! categoriaEncontrada) return res.status(404).send({ mensaje:"Error al momento de listar"})
            return res.status(200).send({categorias:categoriaEncontrada})
        })
    }else{
        return res.status(404).send({Mesaje: "No posees los permisos necesarios"})
    }
}

module.exports = {
    agregarCategoria,
    editarCategoria,
    eliminarCategoria,
    obtenerCategoria
}