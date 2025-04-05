const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: './.env' });

// Conectar a la base de datos
connectDB();

// Inicializar app
const app = express();

// Middleware
app.use(express.json());
app.use(cors(require('./config/corsOptions')));

// Carpeta pública para archivos estáticos (imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reclutas', require('./routes/reclutaRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/entrevistas', require('./routes/entrevistaRoutes'));

// Manejador de errores
app.use(errorHandler);

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});

// Manejar errores no capturados
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Cerrar servidor y salir
  server.close(() => process.exit(1));
});
