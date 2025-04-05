const mongoose = require('mongoose');

const EntrevistaSchema = new mongoose.Schema({
  fecha: {
    type: Date,
    required: [true, 'Por favor selecciona una fecha para la entrevista']
  },
  hora: {
    type: String,
    required: [true, 'Por favor selecciona una hora para la entrevista']
  },
  duracion: {
    type: Number,
    default: 60,
    enum: [30, 60, 90, 120]
  },
  tipo: {
    type: String,
    enum: ['presencial', 'virtual', 'telefonica'],
    default: 'presencial'
  },
  ubicacion: {
    type: String
  },
  notas: {
    type: String
  },
  recluta: {
    type: mongoose.Schema.ObjectId,
    ref: 'Recluta',
    required: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  enviado_email: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Entrevista', EntrevistaSchema);
