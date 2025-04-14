const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config({ path: './.env' });

// Cargar modelos
const User = require('./models/User');
const Recluta = require('./models/Recluta');
const Entrevista = require('./models/Entrevista');

// Conectar a DB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Datos de muestra
const users = [
  {
    nombre: 'Admin Usuario',
    email: 'admin@example.com',
    password: 'password123',
    telefono: '555-1111',
    role: 'admin'
  },
  {
    nombre: 'María García',
    email: 'maria@example.com',
    password: 'password123',
    telefono: '555-2222',
    role: 'reclutador'
  },
  {
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    password: 'password123',
    telefono: '555-3333',
    role: 'reclutador'
  }
];

const reclutas = [
  {
    nombre: 'Ana García',
    email: 'ana.garcia@ejemplo.com',
    telefono: '555-1234',
    estado: 'Activo',
    puesto: 'Desarrollador Frontend',
    notas: 'Experiencia de 3 años en React y Angular. Disponible para incorporación inmediata.'
  },
  {
    nombre: 'Carlos López',
    email: 'carlos.lopez@ejemplo.com',
    telefono: '555-5678',
    estado: 'En proceso',
    puesto: 'Diseñador UX/UI',
    notas: 'Portfolio impresionante. Pendiente segunda entrevista con el equipo de diseño.'
  },
  {
    nombre: 'María Rodríguez',
    email: 'maria.rodriguez@ejemplo.com',
    telefono: '555-9012',
    estado: 'Activo',
    puesto: 'Desarrollador Backend',
    notas: 'Experiencia con Node.js y bases de datos SQL/NoSQL. Disponible a partir del 15 de mayo.'
  },
  {
    nombre: 'Javier Martínez',
    email: 'javier.martinez@ejemplo.com',
    telefono: '555-3456',
    estado: 'En proceso',
    puesto: 'DevOps Engineer',
    notas: 'Conocimientos avanzados en AWS y Docker. Pendiente prueba técnica.'
  }
];

// Importar datos
const importData = async () => {
  try {
    // Crear usuarios
    const createdUsers = await User.create(users);
    console.log(`${createdUsers.length} usuarios importados`);

    // Asignar reclutas a usuarios reclutadores
    const reclutadoresIds = createdUsers
      .filter(user => user.role === 'reclutador')
      .map(user => user._id);

    const reclutasWithUser = reclutas.map((recluta, index) => ({
      ...recluta,
      user: reclutadoresIds[index % reclutadoresIds.length]
    }));

    // Crear reclutas
    const createdReclutas = await Recluta.create(reclutasWithUser);
    console.log(`${createdReclutas.length} reclutas importados`);

    // Crear algunas entrevistas
    const entrevistas = [
      {
        fecha: new Date(Date.now() + 24 * 60 * 60 * 1000), // mañana
        hora: '10:00',
        duracion: 60,
        tipo: 'presencial',
        ubicacion: 'Oficina central',
        notas: 'Preparar preguntas técnicas',
        recluta: createdReclutas[0]._id,
        user: reclutadoresIds[0]
      },
      {
        fecha: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // en 3 días
        hora: '14:30',
        duracion: 90,
        tipo: 'virtual',
        ubicacion: 'Zoom',
        notas: 'Revisar portfolio',
        recluta: createdReclutas[1]._id,
        user: reclutadoresIds[0]
      }
    ];

    await Entrevista.create(entrevistas);
    console.log(`${entrevistas.length} entrevistas importadas`);

    console.log('Datos importados correctamente');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Eliminar datos
const deleteData = async () => {
  try {
    await Entrevista.deleteMany();
    await Recluta.deleteMany();
    await User.deleteMany();

    console.log('Datos eliminados correctamente');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

// Procesar comando
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Por favor usa -i (importar) o -d (eliminar)');
  process.exit();
}
