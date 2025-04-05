const mongoose = require('mongoose');

const ReclutaSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingresa el nombre del recluta'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa el email del recluta'],
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  telefono: {
    type: String,
    required: [true, 'Por favor ingresa el teléfono del recluta'],
    trim: true
  },
  estado: {
    type: String,
    enum: ['Activo', 'En proceso', 'Rechazado'],
    default: 'En proceso'
  },
  puesto: {
    type: String,
    trim: true
  },
  notas: {
    type: String
  },
  foto_url: {
    type: String,
    default: '/api/placeholder/40/40'
  },
  fecha_registro: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals para las entrevistas asociadas
ReclutaSchema.virtual('entrevistas', {
  ref: 'Entrevista',
  localField: '_id',
  foreignField: 'recluta',
  justOne: false
});

// Middleware para eliminar entrevistas asociadas al eliminar un recluta
ReclutaSchema.pre('remove', async function(next) {
  await this.model('Entrevista').deleteMany({ recluta: this._id });
  next();
});

module.exports = mongoose.model('Recluta', ReclutaSchema);
