const crypto = require('crypto');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const config = require('../config/config');

// @desc    Registrar usuario
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { nombre, email, password, telefono, role } = req.body;

    // Crear usuario
    const user = await User.create({
      nombre,
      email,
      password,
      telefono,
      role
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Login usuario
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validar email y password
    if (!email || !password) {
      return next(new ErrorResponse('Por favor proporciona un email y contraseña', 400));
    }

    // Verificar usuario
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    // Verificar contraseña
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Credenciales inválidas', 401));
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Obtener usuario autenticado
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      nombre: req.body.nombre,
      email: req.body.email,
      telefono: req.body.telefono
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Actualizar contraseña
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Verificar contraseña actual
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return next(new ErrorResponse('Contraseña actual incorrecta', 401));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Solicitar reset de contraseña
// @route   POST /api/auth/forgotpassword
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return next(new ErrorResponse('No hay usuario con ese email', 404));
    }

    // Generar token de reseteo
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Establecer token y expiración
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutos

    await user.save({ validateBeforeSave: false });

    // Crear URL de reset
    const resetUrl = `${config.baseUrl}/reset-password/${resetToken}`;

    // Crear contenido del email
    const html = `
      <h1>Has solicitado un reset de contraseña</h1>
      <p>Por favor haz clic en el siguiente enlace para resetear tu contraseña:</p>
      <a href="${resetUrl}" target="_blank">Resetear Contraseña</a>
      <p>Este enlace expirará en 10 minutos.</p>
      <p>Si no solicitaste un reset de contraseña, por favor ignora este correo.</p>
    `;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Reset de contraseña - Sistema de Gestión de Reclutas',
        html
      });

      res.status(200).json({
        success: true,
        message: 'Email enviado'
      });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save({ validateBeforeSave: false });

      return next(new ErrorResponse('Error al enviar el email', 500));
    }
  } catch (err) {
    next(err);
  }
};

// @desc    Resetear contraseña
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    // Obtener token hasheado
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.resettoken)
      .digest('hex');

    // Encontrar usuario con token válido
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return next(new ErrorResponse('Token inválido', 400));
    }

    // Establecer nueva contraseña
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    next(err);
  }
};

// @desc    Logout / limpiar cookie
// @route   GET /api/auth/logout
// @access  Private
exports.logout = async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {}
  });
};

// @desc    Subir foto de perfil
// @route   PUT /api/auth/photo
// @access  Private
exports.uploadProfilePhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new ErrorResponse('Por favor sube un archivo', 400));
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileUrl: `/uploads/${req.file.filename}` },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// Función para enviar respuesta con token
const sendTokenResponse = (user, statusCode, res) => {
  // Crear token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + parseInt(config.jwtExpire) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  // Habilitar HTTPS en producción
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  // Excluir la contraseña
  user.password = undefined;

  res
    .status(statusCode)
    .json({
      success: true,
      token,
      data: user
    });
};
