const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const config = require('../config/config');

// Proteger rutas
exports.protect = async (req, res, next) => {
  let token;

  // Verificar si hay token en los headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    // Obtener token del header
    token = req.headers.authorization.split(' ')[1];
  }

  // Verificar si token existe
  if (!token) {
    return next(new ErrorResponse('No autorizado para acceder a esta ruta', 401));
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, config.jwtSecret);

    // Obtener usuario
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return next(new ErrorResponse('Usuario no encontrado', 401));
    }
    
    next();
  } catch (err) {
    return next(new ErrorResponse('No autorizado para acceder a esta ruta', 401));
  }
};

// Restricción de acceso por rol
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(`El rol ${req.user.role} no está autorizado para acceder a esta ruta`, 403)
      );
    }
    next();
  };
};
