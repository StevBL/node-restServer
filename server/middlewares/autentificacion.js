const jwt = require('jsonwebtoken');

//==================================
// VERIFICAR TOKEN
//==================================
let verificarToken = (req, res, next) => {

    let token = req.get('token'); // Obtener de los header el token gracias al get

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;

        //Posterior a ejecutar este middleware con la funcion next le decimos que prosiga el resto de la funcion donde verificarToken fue llamado
        next();

    });

};

//==================================
// VERIFICAR ADMIN ROL
//==================================
let verificarAdmin_role = (req, res, next) => {

    let usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();

    } else {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No es usuario administrador.'
            }
        });
    }

};

//==================================
// VERIFICAR TOKEN IMG
//==================================
let verificarTokenIMG = (req, res, next) => {

    let token = req.query.token; // obtiene el token de la URL

    jwt.verify(token, process.env.SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.usuario;

        //Posterior a ejecutar este middleware con la funcion next le decimos que prosiga el resto de la funcion donde verificarToken fue llamado
        next();

    });

};


module.exports = {
    verificarToken,
    verificarAdmin_role,
    verificarTokenIMG
}