const Facturas = require('../models/factura.model')


function visualizarFacturas(req,res){
    if(req.user.rol !== "administrador") return res.status(404).send({mensaje: "No posees los permisos necesarios"})
    Facturas.find({},(err, facturasEncontradas)=>{
        if (err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if(! facturasEncontradas) return res.status(404).send({ mensaje: "Error al momento de encontrar la factura"})

        return res.status(200).send({facturas: facturasEncontradas})
    })
}

/************************** para visualizar productos de una factura **********************************/ 

function facturasPorId(req,res){
    if(req.user.rol !== "administrador") return res.status(404).send({mensaje: "No posees los permisos necesarios"})
    var idFac = req.params.idFactura;
    Facturas.findOne({_id: idFac},(err, facturaEncontrada)=>{
        if(err) return res.status(500).send({ mensaje: "Error en la peticion"})
        if(!facturaEncontrada) return res.status(404).send({ mensaje: "Error al momento de encontrar la factura"})

        return res.status(200).send({facturas: facturaEncontrada.listaProductos})
    })
}

module.exports = {
    visualizarFacturas,
    facturasPorId
}