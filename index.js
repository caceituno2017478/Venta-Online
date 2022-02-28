const mongoose = require('mongoose');
const app = require('./app');
const Usuario = require("./src/models/usuario.model")
const bcrypt = require("bcrypt-nodejs");

mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/ventaonline-carlosaceituno",{useNewUrlParser: true, useUnifiedTopology: true}).then(()=>{
    console.log("Se a connectado exitosamente")

    app.listen(3030,(req,res)=>{
        console.log("El servidor corre correctamente.")
        administrador()
    })
}).catch(err=>console.error(err));

function administrador(req, res) {

    let usuarioModel = new Usuario();
    let gmailUser = 'admin'
    let passwordUser = '123456';
    Usuario.findOne({ gmail: gmailUser }, (err, usuarioEncontrado) => {
        if (err) return res.status(500).send({ mensaje: `error ${err}` });
        if (usuarioEncontrado) {
            bcrypt.compare( passwordUser,usuarioEncontrado.password, (err, passwordDesincriptada) => {
                if (err) return res.status(500).send({ mensaje: `Error,nose a podido resolver la consulta administrador${err}` });
                if (passwordDesincriptada) {
                    console.log("Admin existente")
                } else {

                }
            })
        } else {
            usuarioModel.nombre = "Administrador General";
            usuarioModel.gmail = "admin";
            usuarioModel.rol = "administrador"
            bcrypt.hash(passwordUser, null, null, (err, constrasenaEncriptada) => {
                usuarioModel.password = constrasenaEncriptada;
                usuarioModel.save((err, usuarioGuardado) => {
                    if (err) return res.status(500).send({ mensaje: "Error en la peticion" });
                    if (!usuarioGuardado) return res.status(404).send({ mensaje: "Error al agregar usuario" })
                    console.log("admin creado")
                })
            })
            
        }
    })
}

