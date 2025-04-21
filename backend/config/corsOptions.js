const allowedOrigins = [
  'http://localhost:5500', // Asegúrate que este puerto coincida
  'http://127.0.0.1:5500',
  process.env.FRONTEND_URL
];

module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'secret_key_para_desarrollo',
  jwtExpire: process.env.JWT_EXPIRE || '15m', // 15 minutos
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_key',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
  }
};