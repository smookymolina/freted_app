const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno - configuración robusta
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.warn('⚠️  Archivo .env no encontrado. Usando variables de entorno del sistema.');
}

// Verificación crítica de la URI de MongoDB
const DB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!DB_URI) {
  console.error('❌ ERROR: No se encontró la URI de MongoDB en las variables de entorno');
  console.error('Asegúrate de tener en tu .env:');
  console.error('MONGO_URI=mongodb://localhost:27017/nombre_db');
  process.exit(1);
}

// Cargar modelos
const User = require('./models/User');
const Recluta = require('./models/Recluta');
const Entrevista = require('./models/Entrevista');

// Configuración mejorada de conexión a MongoDB
const connectDB = async () => {
  try {
    console.log('🔌 Conectando a MongoDB...');
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB conectado correctamente');
  } catch (err) {
    console.error('❌ Error de conexión a MongoDB:', err.message);
    console.error('Verifica que:');
    console.error('1. MongoDB esté corriendo (ejecuta "mongod" o inicia el servicio)');
    console.error('2. La URI sea correcta:', DB_URI);
    process.exit(1);
  }
};

// Datos de muestra mejorados
const users = [
  {
    nombre: 'Admin Usuario',
    email: 'admin@example.com',
    password: 'password123',
    telefono: '555-1111',
    role: 'admin',
    createdAt: new Date()
  },
  {
    nombre: 'María García',
    email: 'maria@example.com',
    password: 'password123',
    telefono: '555-2222',
    role: 'reclutador',
    createdAt: new Date()
  },
  {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'password123',
    telefono: '555-3333',
    role: 'reclutador',
    createdAt: new Date()
  }
];

const reclutas = [
  {
    nombre: 'Ana García',
    email: 'ana.garcia@ejemplo.com',
    telefono: '555-1234',
    estado: 'Activo',
    puesto: 'Desarrollador Frontend',
    notas: 'Experiencia en React',
    skills: ['JavaScript', 'React', 'CSS'],
    createdAt: new Date()
  },
  {
    nombre: 'Carlos López',
    email: 'carlos.lopez@ejemplo.com',
    telefono: '555-5678',
    estado: 'En proceso',
    puesto: 'Diseñador UX/UI',
    notas: 'Portfolio destacado',
    skills: ['Figma', 'UI Design', 'Prototyping'],
    createdAt: new Date()
  }
];

// Función mejorada para importar datos
const importData = async () => {
  try {
    await connectDB(); // Conexión antes de operaciones

    // Limpiar datos existentes primero
    await Promise.all([
      Entrevista.deleteMany(),
      Recluta.deleteMany(),
      User.deleteMany()
    ]);

    // Crear usuarios
    const createdUsers = await User.insertMany(users);
    console.log(`📝 ${createdUsers.length} usuarios creados`);

    // Asignar reclutas a reclutadores
    const reclutadores = createdUsers.filter(u => u.role === 'reclutador');
    const reclutasConUsuario = reclutas.map((recluta, i) => ({
      ...recluta,
      user: reclutadores[i % reclutadores.length]._id
    }));

    const createdReclutas = await Recluta.insertMany(reclutasConUsuario);
    console.log(`📋 ${createdReclutas.length} reclutas creados`);

    // Crear entrevistas
    const entrevistas = [
      {
        fecha: new Date(Date.now() + 86400000), // Mañana
        hora: '10:00',
        recluta: createdReclutas[0]._id,
        user: reclutadores[0]._id,
        notas: 'Entrevista técnica'
      }
    ];

    await Entrevista.insertMany(entrevistas);
    console.log('✅ Datos importados exitosamente');
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error durante la importación:', err);
    process.exit(1);
  }
};

// Función para eliminar datos
const deleteData = async () => {
  try {
    await connectDB();
    
    const results = await Promise.all([
      Entrevista.deleteMany(),
      Recluta.deleteMany(),
      User.deleteMany()
    ]);
    
    const totalDeleted = results.reduce((sum, r) => sum + r.deletedCount, 0);
    console.log(`🧹 ${totalDeleted} documentos eliminados`);
    
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al eliminar datos:', err);
    process.exit(1);
  }
};

// Manejo de argumentos mejorado
const args = process.argv.slice(2);
if (args.includes('-i') || args.includes('--import')) {
  importData();
} else if (args.includes('-d') || args.includes('--delete')) {
  deleteData();
} else {
  console.log(`
Uso: node seeder.js [opción]

Opciones:
  -i, --import    Importar datos de prueba
  -d, --delete    Eliminar todos los datos
  `);
  process.exit(1);
}