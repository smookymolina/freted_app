module.exports = {
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'secretkey2025',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  
  // Email
  emailService: process.env.EMAIL_SERVICE || 'gmail',
  emailUsername: process.env.EMAIL_USERNAME,
  emailPassword: process.env.EMAIL_PASSWORD,
  emailFrom: process.env.EMAIL_FROM || 'noreply@sistemagestionreclutas.com',
  
  // Servidor
  baseUrl: process.env.BASE_URL || 'http://localhost:5500'
};
