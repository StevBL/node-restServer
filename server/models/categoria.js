const mongoose = require('mongoose');
//const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

let categoriaSchema = new Schema({
    descripcion: {
        type: String,unique: true,required: [true, 'La descripción es necesaria']
    },
    usuario: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario',
        required: [true, 'El Usuario es necesario']
    }
});

//categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico.' });

module.exports = mongoose.model('Categoria', categoriaSchema);