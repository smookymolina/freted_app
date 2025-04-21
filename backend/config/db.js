const mongoose = require('mongoose');
const colors = require('colors');

const connectDB = async () => {
  try {
    // Verificación explícita de la variable de entorno
    if (!process.env.MONGO_URI) {
      throw new Error('❌ MONGO_URI no está definida en .env'.red);
    }

    console.log('Intentando conectar a MongoDB con URI:'.yellow, process.env.MONGO_URI);

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 segundos de timeout
    });

    console.log(`✅ MongoDB Conectado: ${conn.connection.host}`.cyan.underline);
  } catch (error) {
    console.error(`❌ Error de conexión: ${error.message}`.red);
    process.exit(1); // Salir con código de error
  }
};

module.exports = connectDB;