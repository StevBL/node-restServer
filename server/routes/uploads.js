const express = require('express');
const { verificarToken } = require('../middlewares/autentificacion');
const fileUpload = require('express-fileupload');
const app = express();

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

const fs = require('fs');
const path = require('path');

// carga lo que viene del req y lo trasnforma a un file
app.use( fileUpload({ useTempFiles: true }) );


app.put('/upload/:tipo/:id', verificarToken, function(req, res) {

    let tipo = req.params.tipo
    let id = req.params.id;

    // si no hay archivos o vienen vacios
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400)
                .json({
                    ok: false,
                    err: {
                        message: 'No se ha seleccionado ningun archivo'
                    }
                });
    }

    // validar tipo req
    let tiposVal = ['productos', 'usuarios'];
    if(tiposVal.indexOf(tipo) < 0) {
        return res.status(400)
                .json({
                    ok: false,
                    err: {
                        tipo,
                        message: 'Los tipos permitidos son: ' + tiposVal.join(', ')
                    }
                });
    }
  
    // si viene un archivo toma el archivo que tiene en el atributo .file y lo guarda en samplefile
    let file = req.files.file;

    // validar extension
    let extensionesVal = ['png', 'jpg', 'gift', 'jpeg'];
    let arrNomArch = file.name.split('.');
    let extArch = arrNomArch[arrNomArch.length -1];

    if(extensionesVal.indexOf(extArch) < 0){
        return res.status(400)
                .json({
                    ok: false,
                    err: {
                        ext: extArch,
                        message: `Las extensiones validas son: ${extensionesVal.join(', ')}`
                    }
                });
    }

    // cambiar nombre al archivo = id-milisegundos.ext
    let nombreFile = `${id}-${new Date().getMilliseconds()}.${extArch}`
  
    // mv() coloca el archivo en la direccion que yo le indique en el servidor
    file.mv(`uploads/${tipo}/${nombreFile}`, (err) => {
        if (err){
            return res.status(500)
                .json({
                    ok: false,
                    err
                });
        }

        tipo === 'usuarios' ? imagenUsr(id, res, nombreFile) : imagenProd(id, res, nombreFile);

    });
});

function imagenUsr(id, res, nombreFile) {

    Usuario.findById(id,(err, usuarioDB) => {
        if (err){
            borrarArchivo(nombreFile, 'usuarios');
            return res.status(500).json({
                    ok: false,
                    err
                });
        }
        if (!usuarioDB){
            borrarArchivo(nombreFile, 'usuarios');
            return res.status(400)
                .json({
                    ok: false,
                    err : {
                        message: 'Usuario no existe'
                    }
                });
        }

        borrarArchivo(usuarioDB.img, 'usuarios');
        
        usuarioDB.img = nombreFile;

        usuarioDB.save((err, usuarioGuardado) =>{
            res.json({
                ok: true,
                usuario: usuarioDB,
                img: nombreFile
            });
        });


    });

}

function imagenProd(id, res, nombreFile){
    Producto.findById(id,(err, prodDB) => {
        if (err){
            borrarArchivo(nombreFile, 'productos');
            return res.status(500).json({
                    ok: false,
                    err
                });
        }
        if (!prodDB){
            borrarArchivo(nombreFile, 'productos');
            return res.status(400)
                .json({
                    ok: false,
                    err : {
                        message: 'Producto no existe'
                    }
                });
        }

        borrarArchivo(prodDB.img, 'productos');
        prodDB.img = nombreFile;

        prodDB.save((err, prodGuardado) =>{
            res.json({
                ok: true,
                producto: prodDB,
                img: nombreFile
            });
        });


    });
}

function borrarArchivo(nombreImg, tipo){
    // obtiene la direccion relativa de la imagen de un usuario, la img de DB. accediendo a ella a partir de la carpeta routes.
    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImg}`);

    //si se busca la imagen en el path obtenido y si existe es porque ese usuario ya tiene imagen, entonces va a borrar la img que existe.
    if( fs.existsSync(pathImg)){
        fs.unlinkSync(pathImg);
    }
}

module.exports = app;