const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const config = require('../config/config');

// Proteger rutas
exports.protect = async (req, res, next) => {
  let token;

  // 1. Obtener token de headers/cookies
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return next(new ErrorResponse('Acceso no autorizado', 401));
  }

  try {
    // 2. Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Obtener usuario
    req.user = await User.findById(decoded.id);
    next();
  } catch (err) {
    // Manejar errores específicos
    if (err.name === 'TokenExpiredError') {
      return next(new ErrorResponse('Token expirado', 401));
    }
    return next(new ErrorResponse('Token inválido', 401));
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
