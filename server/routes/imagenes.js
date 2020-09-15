const express = require('express');
const { verificarTokenIMG } = require('../middlewares/autentificacion');
const app = express();
const path = require('path');
const fs = require('fs');

//obtener img

app.get('/imagen/:tipo/:img', verificarTokenIMG, (req,res) => {

    let tipo = req.params.tipo;
    let img = req.params.img;

    let pathImg = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    let noImgpath = path.resolve(__dirname, `../assets/404.png`);

    fs.existsSync(pathImg) ? res.sendFile(pathImg) : res.sendFile(noImgpath)

});


module.exports = app;