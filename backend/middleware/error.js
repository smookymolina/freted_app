const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log para desarrollo
  console.log(err);

  // Mongoose error - Bad ObjectId
  if (err.name === 'CastError') {
    const message = `Recurso no encontrado`;
    error = new ErrorResponse(message, 404);
  }

  // Mongoose error - Duplicate key
  if (err.code === 11000) {
    const message = 'El valor ingresado ya existe';
    error = new ErrorResponse(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(message, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Error del servidor'
  });
};

module.exports = errorHandler;
