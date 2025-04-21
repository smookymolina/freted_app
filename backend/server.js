const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Cargar variables de entorno PRIMERO y verificar
dotenv.config({ path: path.resolve(__dirname, '.env') });

// DEBUG: Verificar variables cargadas
console.log('[DEBUG] MONGO_URI:', process.env.MONGO_URI);
console.log('[DEBUG] NODE_ENV:', process.env.NODE_ENV);

// Verificar variable crítica antes de continuar
if (!process.env.MONGO_URI) {
  console.error('❌ ERROR: MONGO_URI no está definida en .env');
  console.error('Asegúrate de que tu archivo .env contenga:');
  console.error('MONGO_URI=mongodb://localhost:27017/nombre_db');
  process.exit(1);
}

// Inicializar app
const app = express();

// Conectar a DB (esto debe venir después de la verificación)
const connectDB = require('./config/db');
connectDB();

// ... (el resto de tu middleware y rutas permanece igual)
app.use(express.json());
app.use(cors(require('./config/corsOptions')));
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/reclutas', require('./routes/reclutaRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/entrevistas', require('./routes/entrevistaRoutes'));

// Manejador de errores
app.use(require('./middleware/error'));

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'index.html'));
  });
}

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en modo ${process.env.NODE_ENV || 'development'} en puerto ${PORT}`.yellow.bold);
});

// Manejar errores no capturados
process.on('unhandledRejection', (err) => {
  console.log(`❌ Error no capturado: ${err.message}`.red);
  server.close(() => process.exit(1));
});