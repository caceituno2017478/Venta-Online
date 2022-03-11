const Carrito = require("../models/carrito.model")
const Productos = require("../models/productos.model")
const Factura = require("../models/factura.model")
const fs = require("fs");
const PDFDocument = require("pdfkit");

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
                
                let subtotal= 0
                let subtotalGeneral=0 
                var cantidadTotal=0 
                let totalCarrito =0 
                let cantidadVerificacion = 0
                let verificacionStock =0;
                let varibleIngreso = false;


                for (let i = 0; i < carritoEncontrado.listaProductos.length; i++) {
                    if(carritoEncontrado.listaProductos[i].nombreProducto === parametros.nombreProducto)
                    verificacionStock += carritoEncontrado.listaProductos[i].cantidadProducto;
                }
                cantidadVerificacion = verificacionStock + Number(parametros.cantidadProducto);
                cantidadTotal = (productoEncontrado.stock-cantidadVerificacion)*-1;
                if(cantidadVerificacion > productoEncontrado.stock ){
                    if(productoEncontrado.stock <= 0){
                        return res.status(200).send({ mensaje: "Sea agotado este producto"})
                    }else{
                        return res.status(200).send({ mensaje: `Su orden se excede por ${cantidadTotal}`})
                    }
                }
                cantidadTotal =0;
                console.log(carritoEncontrado.listaProductos)

                for(var i = 0 ; i < carritoEncontrado.listaProductos.length ; i++){
                    console.log("")
                    console.log("carritoEncontrado.listaProductos[i].nombreProducto")
                    console.log(carritoEncontrado.listaProductos[i].nombreProducto)
                    console.log("carritoEncontrado.listaProductos[i].nombreProducto === parametros.nombreProducto")
                    console.log(carritoEncontrado.listaProductos[i].nombreProducto === parametros.nombreProducto)
                    if(carritoEncontrado.listaProductos[i].nombreProducto === parametros.nombreProducto){

                        if(productoEncontrado.stock < parametros.cantidadProducto){
                            return res.status(404).send
                            ({mensaje: `Solo se posee del producto ${productoEncontrado.nombre} la cantidad de producto ${productoEncontrado.stock}`})
                        }else{

                            varibleIngreso = true;
                            for(var j = 0; j < carritoEncontrado.listaProductos.length;j++){
                                if(carritoEncontrado.listaProductos[j].nombreProducto === parametros.nombreProducto)
                                cantidadTotal = cantidadTotal + carritoEncontrado.listaProductos[j].cantidadProducto;
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

                    generarFactura(facturaGuardar,res)

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

function generarFactura(facturaGuardar, res){
    // ruta
    var path = "./src/pdf/"+"factura-"+facturaGuardar.idUsuario+".pdf";
    
    createInvoice(facturaGuardar,path);
    return res.status(200).send({factura: "Factura generada"})
}

function createInvoice(factura, path) {
    let doc = new PDFDocument({ size: "A4", margin: 50 });
  
    generateHeader(doc);
    generateCustomerInformation(doc, factura);
    generateInvoiceTable(doc, factura);
    generateFooter(doc);
  
    doc.end();
    doc.pipe(fs.createWriteStream(path));
  }
  
  function generateHeader(doc) {
    doc
      .image("./src/picture/logo.png", 50, 45, { width: 50 })
      .fillColor("#444444")
      .fontSize(20)
      .text("Mall Online", 130, 57)
      .fontSize(10)
      .text(formatDate(new Date()), 200, 50, { align: "right" })
      .text("Cd. Guatemala", 200, 65, { align: "right" })
      .moveDown();
  }
  
  function generateCustomerInformation(doc, factura) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Nit", 50, 160)
      .text(factura.idUsuario, 100, 160);
  
    generateHr(doc, 185);
  
    const customerInformationTop = 200;
  
    doc
      .fontSize(10)
      .text("Empresa:", 50, customerInformationTop)
      .font("Helvetica")
      .text("Mall Online", 150, customerInformationTop)
      .font("Helvetica")
      .text("Direccion:", 50, customerInformationTop + 15)
      .text("18 av. 6 calle 9-66", 150, customerInformationTop + 15)
      .text("Web:", 50, customerInformationTop + 30)
      .text("mallonline.com",150,customerInformationTop + 30)
      .moveDown();
  
    generateHr(doc, 252);
  }
  
  function generateInvoiceTable(doc, factura) {
    let i;
    const invoiceTableTop = 330;
  
    doc.font("Helvetica-Bold");
    generateTableRow(
      doc,
      invoiceTableTop,
      "No.",
      "Producto",
      "Cantidad",
      "Precio Unitario",
      "Subtotal"
    );
    generateHr(doc, invoiceTableTop + 20);
    doc.font("Helvetica");
  
    for (i = 0; i < factura.listaProductos.length; i++) {
      const item = factura.listaProductos[i];
      const position = invoiceTableTop + (i + 1) * 30;
      generateTableRow(
        doc,
        position,
        i,
        item.nombreProducto,
        item.cantidadProducto,
        item.precioUnitario,
        item.subTotal
      );
  
      generateHr(doc, position + 20);
    }
  
    const subtotalPosition = invoiceTableTop + (i + 1) * 30;
    generateTableRow(
      doc,
      subtotalPosition,
      "",
      "",
      "Total",
      "",
      formatCurrency(factura.totalFactura)
    );
}
  
  function generateFooter(doc) {
    doc
    .fontSize(10)
    .text(
      "Carlos Josué Levy Aceituno Pocasangre - 2017478 - IN6BM1",
      50,
      780,
      { align: "center", width: 500 }
    );
  }
  
  function generateTableRow(
    doc,
    y,
    No,
    nombreProducto,
    cantidadProducto,
    precioUnitario,
    subtotal
  ) {
    doc
      .fontSize(10)
      .text(No, 80, y)
      .text(nombreProducto, 150, y)
      .text(cantidadProducto, 240, y, { width: 90, align: "right" })
      .text(precioUnitario, 370, y, { width: 90, align: "right" })
      .text(subtotal, 0, y, { align: "right" });
  }
  
  function generateHr(doc, y) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }
  
  function formatCurrency(cents) {
    return "Q" + cents.toFixed(2);
  }
  
  function formatDate(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
  
    return year + "/" + month + "/" + day;
  }


module.exports = {
    agregarProductosCarrito,
    eliminarCarritoProducto,
    pasarDatosFactura
}