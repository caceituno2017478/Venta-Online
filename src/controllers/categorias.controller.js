const res = require('express/lib/response');
const Categorias = require('../models/categoria.model')

function agregarCategoria(req,res){
    var parametros = req.body;
    var modelCategoria = new Categorias();

    if(parametros.nombre || parametros.descripcion){
        verificacionesCategoriaNombre(parametros);
        modelCategoria.nombre = parametros.nombre;
        modelCategoria.descripcion = parametros.descripcion;
        modelCategoria.save((err,usuarioGuardado)=>{
            if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
            if(!usuarioGuardado) return res.status(404).send({ mensaje:"Error al agregar el usuario"})

            return res.status(200).send({ categoria: usuarioGuardado })
        })
    }else{
        return res.status(404).send({message : "No has llenado todos los campos"})
    }
}

function editarCategoria(req,res){
    var parametros = req.body;
    var idCat = req.params.idCategoria;

    verificacionesCategoriaNombre(parametros);
    Categorias.findByIdAndUpdate(idCat, parametros, {new: parametros}, (err, categoriaEditada)=>{
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if(!categoriaEditada) return res.status(404).send({ mensaje:"Error al editar la categoria"})
        return res.status(200).send({ categoria: categoriaEditada})
    })
}


// revisar se debe agregar la categoria por default
function eliminarCategoria(req, res) {
    var idCat = req.params.idCategoria;
    registrar();
    Categorias.findById(idCat,(err, productoEncontradoId) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if(!productoEncontradoId) return res.status(404).send({mensaje: "categoria no exite"})

        Productos.updateMany({listaProductos:{ nombreProducto: categoriaEncontradoId.nombre}},
            {listaProductos:{ nombreProducto: categoriaDefault.nombre, 
                idCategoria: categoriaDefault._id}},(err, prooductoModificadoDefault)=>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                    if(!prooductoModificadoDefault) return res.status(500)
                    .send({ mensaje: "Error al editar producto eliminado"})

                    Categorias.findByIdAndDelete(idCat,(err,categoriaEliminada) => {
                        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                        if(categoriaEliminada === null)
                            return res.status(404).send({ mensaje: "Error al eliminar la categoria"})
                    
                        return res.status(200).send({categoria : categoriaEliminada})
                    })

                })
    })
    
}

function verificacionesCategoriaNombre(parametros){
    Categorias.find({nombre: parametros.nombre},(err, categoriaEncontrado) =>{
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if(categoriaEncontrado !== null){
            return res.status( 200).send({mensaje: "Categoria ya existe"})
        }
    })
}

function registrar(){
    Categorias.findOne({ nombre: "default" }, (err, busquedaDefault) => {
        if(err) return res.status(500).send({ mensaje:"Error en la peticion existe default"})
        if(busquedaDefault === null){
            var categoriaModel = new Usuarios();
            categoriaModel.nombre = "default";
            categoriaModel.description = "Default"
            categoriaModel.save((err, categoriaDefault) => {

            })
        }
    })
}

module.exports = {
    agregarCategoria,
    editarCategoria,
    eliminarCategoria
}