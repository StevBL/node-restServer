const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIEN_ID);


const app = express();

const Usuario = require('../models/usuario');
const usuario = require('../models/usuario');



app.post('/login', (req, res) => {

    let body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }

        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                err: {
                    menssage: '(Usuario) o contraseña incorrectos'
                }
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                err: {
                    menssage: 'Usuario o (contraseña) incorrectos'
                }
            });
        }

        let token = jwt.sign({
            usuario: usuarioDB
        }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // Seg * Min * Hor * Dias = 30 dias

        res.json({
            ok: true,
            usuario: usuarioDB,
            token
        });

    });


});

//Configuraciones de Google
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIEN_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    }

}

app.post('/google', async(req, res) => {

    let token = req.body.idtoken;

    //valida token
    let googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                err: e
            });
        });

    //verifica si el correo ya existe en DB
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //si existe
        if (usuarioDB) {
            //no se registro por google
            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Debe de usar su autentificación normal'
                    }
                })
            } else {
                //se registro por google
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });
            }
        } else {
            //Si el usuario no existe en DB
            let usuario = new Usuario();

            //alista la info y guarda al usuario en DB
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            usuario.save((err, usuarioDB) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                //si se crea el usuario bien mediante google, se genera y se devuelve el token personalizado
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });

                res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                });


            });
        }
    });

});
module.exports = app;