# Sistema de Gestión de Reclutas - Backend

API RESTful para el Sistema de Gestión de Reclutas, que permite a los reclutadores administrar candidatos, programar entrevistas y realizar seguimiento del proceso de reclutamiento.

## Tecnologías utilizadas

- **Node.js** - Entorno de ejecución para JavaScript
- **Express** - Framework web para Node.js
- **MongoDB** - Base de datos NoSQL
- **Mongoose** - ODM para MongoDB
- **JWT** - JSON Web Tokens para autenticación
- **bcryptjs** - Para hash de contraseñas
- **Multer** - Para manejo de subida de archivos
- **Nodemailer** - Para envío de emails

## Requisitos previos

- Node.js (v14.x o superior)
- MongoDB (local o en la nube con MongoDB Atlas)
- npm (gestor de paquetes de Node)

## Instalación

1. Clona el repositorio:
```bash
git clone https://github.com/tu-usuario/sistema-gestion-reclutas-backend.git
cd sistema-gestion-reclutas-backend
```

2. Instala las dependencias:
```bash
npm install
```

3. Crea un archivo `.env` en la raíz del proyecto con la siguiente configuración:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/sistema_reclutas
JWT_SECRET=tu_secreto_jwt
JWT_EXPIRE=30d
EMAIL_SERVICE=gmail
EMAIL_USERNAME=tu_email@gmail.com
EMAIL_PASSWORD=tu_password
EMAIL_FROM=noreply@sistemagestionreclutas.com
BASE_URL=http://localhost:5000
```

4. (Opcional) Importa datos iniciales:
```bash
node seeder -i
```

## Ejecución

Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

Para iniciar el servidor en modo producción:
```bash
npm start
```

El servidor se iniciará en http://localhost:5000 (o el puerto configurado en las variables de entorno).

## Endpoints de la API

### Autenticación

- `POST /api/auth/register` - Registrar un nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/me` - Obtener usuario autenticado
- `PUT /api/auth/updatedetails` - Actualizar detalles del usuario
- `PUT /api/auth/updatepassword` - Actualizar contraseña
- `POST /api/auth/forgotpassword` - Solicitar recuperación de contraseña
- `PUT /api/auth/resetpassword/:resettoken` - Restablecer contraseña
- `PUT /api/auth/photo` - Subir foto de perfil

### Reclutas

- `GET /api/reclutas` - Obtener todos los reclutas
- `GET /api/reclutas/:id` - Obtener un recluta específico
- `POST /api/reclutas` - Crear un nuevo recluta
- `PUT /api/reclutas/:id` - Actualizar un recluta
- `DELETE /api/reclutas/:id` - Eliminar un recluta
- `PUT /api/reclutas/:id/photo` - Subir foto de un recluta

### Entrevistas

- `GET /api/entrevistas` - Obtener todas las entrevistas
- `GET /api/entrevistas/:id` - Obtener una entrevista específica
- `GET /api/reclutas/:reclutaId/entrevistas` - Entrevistas de un recluta
- `POST /api/reclutas/:reclutaId/entrevistas` - Crear entrevista para un recluta
- `PUT /api/entrevistas/:id` - Actualizar una entrevista
- `DELETE /api/entrevistas/:id` - Eliminar una entrevista
- `POST /api/entrevistas/:id/enviarrecordatorio` - Enviar recordatorio de entrevista

### Usuarios (Admin)

- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/:id` - Obtener un usuario específico
- `POST /api/users` - Crear un nuevo usuario
- `PUT /api/users/:id` - Actualizar un usuario
- `DELETE /api/users/:id` - Eliminar un usuario
- `GET /api/users/stats` - Obtener estadísticas de usuarios
- `PUT /api/users/:id/role` - Cambiar rol de usuario
- `PUT /api/users/:id/resetpassword` - Resetear contraseña de usuario
- `GET /api/users/:id/reclutas` - Obtener reclutas de un usuario

## Documentación

Para una documentación más detallada de la API, consulta la [documentación completa](docs/api.md).

## Integración con el Frontend

Este backend está diseñado para integrarse con la aplicación frontend del Sistema de Gestión de Reclutas. Para configurar el frontend, sigue las instrucciones en el repositorio correspondiente.

## Licencia

Este proyecto está bajo la Licencia MIT.
