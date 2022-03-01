const Usuarios = require("../models/usuario.model")
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt")

// Login
function login(req, res) {
    var parametros = req.body;

    Usuarios.findOne({ gmail: parametros.gmail }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error,nose a podido resolver la consulta" });
        if (usuarioEncontrado !== null) {
            bcrypt.compare(parametros.password, usuarioEncontrado.password, (err, vertifiacionPassword) => {
                if (vertifiacionPassword!== null) {

                    if (parametros.obtenerToken === 'true') {
                        return res.status(200).send({token: jwt.crearToken(usuarioEncontrado)})

                    } else {
                        usuarioEncontrado.password = undefined;
                        return res.status(200).send({ usuario: usuarioEncontrado });
                    }
                } else {
                    return res.status(500).send({ mensaje: "La contraseña es incorrecta" });
                }
            })
        } else{
            return res.status(200).send({mensaje: "Los datos ingresado no son correctos"})
        }
    } )

}

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

                return res.status(200).send({ usuario: usuarioGuardado })
            });
        })

    }
    }else{
    return res.status(404).send({mensaje: "No has llenado todos los campos"})
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

function editarUsuarios(req,res) {
    var parametros = req.body;
    var idUser = req.user.sub;

    Usuarios.findById(idUser,(err,usuariosEncontrado) => {
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if (!usuariosEncontrado) return res.status(500).send({ mensaje: "El usuario ingresado no existe"})
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

// hacer una revision -- si se debe agregar un default o nel
// function eliminarUsuarios(req, res) {
//     var idUser = req.params.idUsuario;
//     registrar();
//     Usuarios.findById(idUser,(err,usuariosEncontrado) => {
//         if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
//         if (!usuariosEncontrado) return res.status(500).send({ mensaje: "El usuario ingresado no existe"})
//         if(usuariosEncontrado.rol === "cliente"){
//            Usuarios.findByIdAndDelete(idUser,(err,usuariosEliminados) => {
//             if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
//             if (!usuariosEliminados) return res.status(500).send({ mensaje: "Error al eliminar un usuario"})
//             return res.status(200).send({mensaje: ""})
//            })
//         }else{
//             return res.status(500).send({ mensaje: "Este de usuario no se pueden editar"})
//         }
        
//     })
// }

// registrar
function registrar(){
    Usuarios.findOne({ gmail: "default@gmail.com" }, (err, usuariosDefault) => {
        if(err) return res.status(500).send({ mensaje:"Error en la peticion existe default"})
        if(usuariosDefault === null){
            var usuariosModel = new Usuarios();
            usuariosModel.nombre = "default";
            usuariosModel.apellido = "default"
            usuariosModel.gmail = "default@gmail.com";
            usuariosModel.rol = "cliente"
            bcrypt.hash("123456", null, null ,(err, passwordEncrypt)=>{
                usuariosModel.password = passwordEncrypt;
                usuariosModel.save((err,usuarioGuardado)=>{
                
                })
            })
        }
    })
}



module.exports = {
    login,
    agregarUsuario,
    editarUsuarios
}