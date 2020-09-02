require('./config/config');

const colors = require('colors');
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

//Habilitar la carpte public 
app.use(express.static(path.resolve(__dirname, '../public')));

//Congiguraci[on Global de Rutas
app.use(require('./routes/index'));


mongoose.connect(process.env.URLDB, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }, (err, res) => {
    if (err) throw err;
    console.log("Base de Datos ONLINE".green);
});


app.listen(process.env.PORT, () => {
    console.log("Escuchando el puerto 3000".blue);
});