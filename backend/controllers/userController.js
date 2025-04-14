const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

// @desc    Obtener todos los usuarios
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find();

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Obtener un usuario
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Crear usuario
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    res.status(201).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Actualizar usuario
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Eliminar usuario
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }

    await user.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Obtener estadísticas de usuarios
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res, next) => {
  try {
    // Total de usuarios
    const totalUsers = await User.countDocuments();
    
    // Total por rol
    const roleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Usuarios recién registrados (último mes)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: lastMonth }
    });
    
    res.status(200).json({
      success: true,
      data: {
        total: totalUsers,
        roles: roleCounts,
        newUsers
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cambiar rol de usuario
// @route   PUT /api/users/:id/role
// @access  Private/Admin
exports.changeUserRole = async (req, res, next) => {
  try {
    if (!req.body.role) {
      return next(new ErrorResponse('Por favor proporciona un rol', 400));
    }
    
    // Verificar que el rol sea válido
    if (!['reclutador', 'admin'].includes(req.body.role)) {
      return next(new ErrorResponse('Rol inválido', 400));
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Resetear contraseña de usuario (para admin)
// @route   PUT /api/users/:id/resetpassword
// @access  Private/Admin
exports.resetUserPassword = async (req, res, next) => {
  try {
    if (!req.body.password) {
      return next(new ErrorResponse('Por favor proporciona una nueva contraseña', 400));
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
    user.password = req.body.password;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Contraseña reseteada correctamente'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Obtener reclutas por usuario
// @route   GET /api/users/:id/reclutas
// @access  Private/Admin
exports.getUserReclutas = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return next(new ErrorResponse(`Usuario no encontrado con id ${req.params.id}`, 404));
    }
    
    const Recluta = require('../models/Recluta');
    const reclutas = await Recluta.find({ user: req.params.id });
    
    res.status(200).json({
      success: true,
      count: reclutas.length,
      data: reclutas
    });
  } catch (err) {
    next(err);
  }
};