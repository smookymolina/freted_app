const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const UserSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Por favor ingresa tu nombre'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Por favor ingresa tu email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor ingresa un email válido'
    ]
  },
  password: {
    type: String,
    required: [true, 'Por favor ingresa una contraseña'],
    minlength: 6,
    select: false
  },
  telefono: {
    type: String,
    trim: true
  },
  profileUrl: {
    type: String,
    default: '/api/placeholder/100/100'
  },
  role: {
    type: String,
    enum: ['reclutador', 'admin'],
    default: 'reclutador'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encriptar contraseña antes de guardar
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Generar JWT
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,  // ¡Usa la variable de entorno!
    { expiresIn: process.env.JWT_EXPIRE }  // Ej: '1h'
  );
};

// Comparar contraseña ingresada con la almacenada
UserSchema.methods.matchPassword = async function(enteredPassword) {
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    console.error('Error comparando contraseñas:', err);
    throw new Error('Error al verificar contraseña');
  }
};

module.exports = mongoose.model('User', UserSchema);
