require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function fixAdmin() {
  try {
    // 1. Conectar a la DB
    await mongoose.connect(process.env.MONGO_URI);

    // 2. Buscar y actualizar el admin existente
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const admin = await User.findOneAndUpdate(
      { email: "admin@example.com" }, // Filtro
      { 
        $set: { 
          password: hashedPassword, // Actualiza solo la contraseña
          nombre: "Admin Usuario",
          role: "admin"
        } 
      },
      { new: true } // Devuelve el documento actualizado
    );

    if (!admin) {
      throw new Error('No se encontró el usuario admin');
    }

    console.log('✅ Admin actualizado correctamente:', admin);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

fixAdmin();