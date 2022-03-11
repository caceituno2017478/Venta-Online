const Usuarios = require("../models/usuario.model")
const Carrito = require("../models/carrito.model")
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt")
const Facturas = require("../models/factura.model")

// Login
function login(req, res) {
    var parametros = req.body;
    Usuarios.findOne({ gmail: parametros.gmail }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error,nose a podido resolver la consulta" });
        if (usuarioEncontrado !== null) {
            bcrypt.compare(parametros.password, usuarioEncontrado.password, (err, vertifiacionPassword) => {
                if (vertifiacionPassword!== null) {

                    Facturas.find({idUsuario: usuarioEncontrado._id},(err, facturasUsuario)=>{
                        if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
                        if(! facturasUsuario) return res.status(404).send({ mensaje: "Error al momento de buscar las facturas"})
                        
                        if (parametros.obtenerToken === 'true') {

                            return res.status(200).send({token: jwt.crearToken(usuarioEncontrado), facturas: facturasUsuario})
    
                        } else {
                            usuarioEncontrado.password = undefined;
                            return res.status(200).send({ usuario: usuarioEncontrado });
                        }
                    })

                } else {
                    return res.status(500).send({ mensaje: "La contraseña es incorrecta" });
                }
            })
        } else{
            return res.status(200).send({mensaje: "Los datos ingresado no son correctos"})
        }
    } )

}

/****************************************** agregar usuario *************************************************************/ 

function agregarUsuario(req,res){
    var parametros = req.body;
    var modeloUsuarios = Usuarios();

    if(parametros.gmail && parametros.password && parametros.nombre && parametros.apellido){
    if(verificacionesUsuariosGmail(parametros)=== true){
        return res.status(500).send({mensaje: "Usuario a agregar existe"})
    }else{
        modeloUsuarios.nombre = parametros.nombre;
        modeloUsuarios.apellido = parametros.apellido;
        modeloUsuarios.gmail = parametros.gmail;
        modeloUsuarios.password = parametros.password;
        modeloUsuarios.rol = "cliente";
        bcrypt.hash(parametros.password , null, null ,(err, passwordEncrypt)=>{
            modeloUsuarios.password = passwordEncrypt;

            modeloUsuarios.save((err,usuarioGuardado)=>{
                if(err) return res.status(500).send({ mensaje:"Error en la peticion"})
                if(!usuarioGuardado) return res.status(404).send({ mensaje:"Error al agregar el usuario"})

                agregarCarrito(usuarioGuardado)

                return res.status(200).send({ usuario: usuarioGuardado })
            });
        })

    }
    }else{
    return res.status(404).send({mensaje: "No has llenado todos los campos"})
    }
   
}

function agregarCarrito(usuarioGuardado) {
    
    var modeloCarrito = Carrito();

    if(usuarioGuardado.rol === "cliente"){
        modeloCarrito.idUsuario = usuarioGuardado._id;
        modeloCarrito.total = 0; 
        modeloCarrito.save((err, carritoGuardado)=>{
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!carritoGuardado) return res.status(404).send({ mensaje: "Error al crear un carrito"})
            
            console.log("carrito guardado"+carritoGuardado)
        })
    }else{
        return res.status(404).send({mesaje: "No posees los permisos necesarios"})
    }
}

function verificacionesUsuariosGmail(parametros){
    Usuarios.find({gmail: parametros.gmail},(err, usuarioEncontrado) =>{
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if (!usuarioEncontrado) return res.status(500)
        .send({ mensaje: "El usuario ingresado no existe"})
        return true;
    })
}


/****************************************** editar usuario *************************************************************/ 

function editarUsuarios(req,res) {
    var parametros = req.body;
    var idUser = req.user.sub;

    Usuarios.findById(idUser,(err,usuariosEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if (!usuariosEncontrado) return res.status(500).send({ mensaje: "El usuario ingresado no existe"})
        console.log(usuariosEncontrado.rol)
        if(usuariosEncontrado.rol === "cliente"){
            if(parametros.password || parametros.gmail){
                return res.status(404).send({ mensaje: "Este tipo de datos no se pueden modificar"})
            }else{
                Usuarios.findByIdAndUpdate(idUser,parametros,{new: true},(err, usuarioModificado)=>{
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion al momento de modificar"})
                    if (!usuarioModificado) return res.status(500)
                    .send({ mensaje: "Error al momento de modificar el usuario"})
                    return res.status(200).send({ usuarios: usuarioModificado})
                })
            }
        }else{
            return res.status(500).send({ mensaje: "Este tipo de usuario no se pueden editar"})
        }
        
    })
}

/****************************************** eliminar usuario *************************************************************/ 

// hacer una revision -- si se debe agregar un default o nel
function eliminarUsuarios(req, res) {
    var idUser = req.user.sub;
    if(req.user.rol === "cliente"){

        Usuarios.findById(idUser,(err,usuariosEncontrado) => {
            if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if (!usuariosEncontrado) return res.status(500).send({ mensaje: "El usuario ingresado no existe"})
            if(usuariosEncontrado.rol === "cliente"){
               Usuarios.findByIdAndDelete(idUser,(err,usuariosEliminados) => {
                if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
                if (!usuariosEliminados) return res.status(500).send({ mensaje: "Error al eliminar un usuario"})
                eliminarCarrito(usuariosEliminados);
                return res.status(200).send({usuario: usuariosEliminados})
               })
            }else{
                return res.status(500).send({ mensaje: "Este de usuario no se pueden editar"})
            }
            
        })
        
    }else{
        return res.status(404).send({ mensaje: "No posees lo permisos necesarios"})
    }
}

function eliminarCarrito(usuariosEliminados){
    if(usuariosEliminados.rol === "cliente"){
        Carrito.findOne({idUsuario: usuariosEliminados._id},(err,carritoEncontrado)=>{
            if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
            if(!carritoEncontrado) return res.status(500).send({ mensaje: "Error al encontrar el carrito"})

            Carrito.findByIdAndDelete(carritoEncontrado._id,(err, carritoBorrado)=>{
                if(err) return res.status(err).send({ mensaje: "Error en la peticion"})
                if(!carritoBorrado) return res.status(404).send({ mesaje: "Error al eliminar el carrito"})
                //return res.status(200).send({ carrito: carritoBorrado})
                console.log("carrito "+carritoBorrado)
            })
        })
    }else{
        return res.status(404).send({mesaje: "No posees los permisos necesarios"}) 
    }
}



module.exports = {
    login,
    agregarUsuario,
    editarUsuarios,
    eliminarUsuarios
}