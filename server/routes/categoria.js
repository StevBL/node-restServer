const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const app = express();
const Categoria = require('../models/categoria');
const { verificarToken, verificarAdmin_role } = require('../middlewares/autentificacion');


//========================================
//SERVICIOS DEL SERVER REST => CATEGORIAS
//========================================

//Obtiene todas las categorias paginadas
app.get('/categorias', verificarToken, (req, res) => {

    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Categoria.find()
        .skip(desde)
        .limit(limite)
        .exec((err, categorias) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            Categoria.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    registros: conteo,
                    categorias
                });
            });
        });
});

//Obtiene categorias por id
app.get('/categoria/:id', verificarToken, (req, res) => {

    let id = req.params.id;

    Categoria.findById(id)
        .exec((err, categoria) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }

            if (!categoria) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Categoria no encontrada'
                    }
                });
            }

            Categoria.countDocuments((err, conteo) => {

                res.json({
                    ok: true,
                    registros: conteo,
                    categoria
                });
            });
        });
});

//Inserta categorias
app.post('/categoria', [verificarToken, verificarAdmin_role], function(req, res) {

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

    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: usuarioSesion
    });

    categoria.save((err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (categoriaDB) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });
});

//modifica categorias
app.put('/categoria/:id', [verificarToken, verificarAdmin_role], function(req, res) {

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
    let body = _.pick(req.body, ['descripcion']);

    let categ = {
        body,
        usuarioSesion
    }

    Categoria.findByIdAndUpdate(id, categ, { new: true, runValidators: true }, (err, categoriaDB) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaDB
        });

    });

});

//elimina categorias
app.delete('/categoria/:id', [verificarToken, verificarAdmin_role], function(req, res) {

    let id = req.params.id;

    //Borrado Fisico
    Categoria.findByIdAndRemove(id, (err, categoriaBorrada) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }

        if (!categoriaBorrada) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }

        res.json({
            ok: true,
            categoria: categoriaBorrada
        });

    });
});

module.exports = app;