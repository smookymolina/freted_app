const nodemailer = require('nodemailer');
const config = require('../config/config');

const sendEmail = async (options) => {
  // Crear transportador
  const transporter = nodemailer.createTransport({
    service: config.emailService,
    auth: {
      user: config.emailUsername,
      pass: config.emailPassword
    }
  });

  // Opciones del correo
  const mailOptions = {
    from: `${options.fromName || 'Sistema de Gestión de Reclutas'} <${config.emailFrom}>`,
    to: options.to,
    subject: options.subject,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);

  console.log(`Email enviado: ${info.messageId}`);
};

module.exports = sendEmail;
