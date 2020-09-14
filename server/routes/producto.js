const express = require('express');
const { verificarToken } = require('../middlewares/autentificacion');
const _ = require('underscore');

let app = express();
let Producto = require('../models/producto');

//========================================
//SERVICIOS DEL SERVER REST => PRODUCTOS
//========================================

// Buscar Productos
app.get('/productos/buscar/:termino', verificarToken, (req, res) => {

    let termino = req.params.termino;

    //expresiones regulares
    let regex = new RegExp(termino, 'i');

    Producto.find({ nombre : regex })
        .populate('categoria', 'descripcion')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!productos) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            res.json({
                ok: true,
                productos
            });
        });
});

//Obtiene todas los productos paginadas
app.get('/productos', verificarToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    let productosDispo = {
        disponible: true
    };

    Producto.find(productosDispo)
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .sort('nombre')
        .exec((err, productos) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            Producto.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    registros: conteo,
                    productos
                });
            });
        });
});

//Obtiene productos por id
app.get('/producto/:id', verificarToken, (req, res) => {

    let id = req.params.id;

    let productosDispo = {
        disponible: true
    };

    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, producto) => {

            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }

            if (!producto) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Producto no encontrado'
                    }
                });
            }

            Producto.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    registros: conteo,
                    producto
                });
            });
        });
});

//Inserta productos
app.post('/producto', [verificarToken], function(req, res) {

    let body = req.body;
    let usuarioSesion = req.usuario._id;

    if (!usuarioSesion) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se pudo obtener el identificador del usuario para la insersion.'
            }
        });
    }

    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: usuarioSesion
    });

    producto.save((err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });
});

//modifica productos
app.put('/producto/:id', [verificarToken], function(req, res) {

    let id = req.params.id;

    let usuarioSesion = req.usuario._id;

    if (!usuarioSesion) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se pudo obtener el identificador del usuario para la insersion.'
            }
        });
    }

    //Define los argumentos que deseo de body, para que actualize todo.
    let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria']);

    Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (err, productoDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!productoDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            producto: productoDB
        });

    });

});

//elimina por estado productos
app.delete('/producto/:id', [verificarToken], function(req, res) {

    let id = req.params.id;

    let cambiarEstado = {
        disponible: false
    };

    //Borrado por estado
    Producto.findByIdAndUpdate(id, cambiarEstado, { new: true }, (err, productoBorrado) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!productoBorrado) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado'
                }
            });
        }

        res.json({
            ok: true,
            usuario: productoBorrado,
            mensaje: 'Producto Borrado'
        });

    });
});

module.exports = app;