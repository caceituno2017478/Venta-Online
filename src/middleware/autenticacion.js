const jwt= require('jwt-simple');
const moment = require('moment');
const secret = 'clave-secreta-empresa';

exports.autenticacion = function(req,res,next){
    if(!req.headers.authorization){
        return res.status(404).send({mensaje: 'La peticion no tiene la caberecera autorizada'});
    }

    var token= req.headers.authorization.replace(/[""]+/g, '');
    try{
        var payload = jwt.decode(token,secret);
        if(payload.exp <= moment().unix()){
            return res.status(404).send({mensaje: 'El token a expirado'})
        }
    }catch(err){
        return res.status(500).send({mensaje: 'El token no es valido'})
    }
    req.user = payload;
    next();
}