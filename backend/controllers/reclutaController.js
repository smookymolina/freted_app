const ErrorResponse = require('../utils/errorResponse');
const Recluta = require('../models/Recluta');

// @desc    Obtener todos los reclutas
// @route   GET /api/reclutas
// @access  Private
exports.getReclutas = async (req, res, next) => {
  try {
    let query;

    // Copiar req.query
    const reqQuery = { ...req.query };

    // Campos a excluir
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Eliminar campos excluidos de reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Crear string de consulta
    let queryStr = JSON.stringify(reqQuery);

    // Crear operadores ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Restringir a reclutas del usuario actual (excepto admins)
    if (req.user.role !== 'admin') {
      queryStr = JSON.parse(queryStr);
      queryStr.user = req.user.id;
      query = Recluta.find(queryStr);
    } else {
      query = Recluta.find(JSON.parse(queryStr));
    }

    // Seleccionar campos
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Ordenamiento
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-fecha_registro');
    }

    // Paginación
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Recluta.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Poblar con referencia a usuario
    query = query.populate({
      path: 'user',
      select: 'nombre email'
    });

    // Ejecutar consulta
    const reclutas = await query;

    // Objeto de paginación
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: reclutas.length,
      pagination,
      data: reclutas
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Obtener un recluta
// @route   GET /api/reclutas/:id
// @access  Private
exports.getRecluta = async (req, res, next) => {
  try {
    const recluta = await Recluta.findById(req.params.id).populate({
      path: 'entrevistas',
      select: 'fecha hora tipo'
    });

    if (!recluta) {
      return next(new ErrorResponse(`Recluta no encontrado con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es dueño del recluta
    if (recluta.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para acceder a este recluta`, 401));
    }

    res.status(200).json({
      success: true,
      data: recluta
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Crear nuevo recluta
// @route   POST /api/reclutas
// @access  Private
exports.createRecluta = async (req, res, next) => {
  try {
    // Agregar usuario al body
    req.body.user = req.user.id;

    const recluta = await Recluta.create(req.body);

    res.status(201).json({
      success: true,
      data: recluta
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Actualizar recluta
// @route   PUT /api/reclutas/:id
// @access  Private
exports.updateRecluta = async (req, res, next) => {
  try {
    let recluta = await Recluta.findById(req.params.id);

    if (!recluta) {
      return next(new ErrorResponse(`Recluta no encontrado con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es dueño del recluta
    if (recluta.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para actualizar este recluta`, 401));
    }

    recluta = await Recluta.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: recluta
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Eliminar recluta
// @route   DELETE /api/reclutas/:id
// @access  Private
exports.deleteRecluta = async (req, res, next) => {
  try {
    const recluta = await Recluta.findById(req.params.id);

    if (!recluta) {
      return next(new ErrorResponse(`Recluta no encontrado con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es dueño del recluta
    if (recluta.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para eliminar este recluta`, 401));
    }

    await recluta.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Subir foto de recluta
// @route   PUT /api/reclutas/:id/photo
// @access  Private
exports.uploadReclutaPhoto = async (req, res, next) => {
  try {
    const recluta = await Recluta.findById(req.params.id);

    if (!recluta) {
      return next(new ErrorResponse(`Recluta no encontrado con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es dueño del recluta
    if (recluta.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para actualizar este recluta`, 401));
    }

    if (!req.file) {
      return next(new ErrorResponse('Por favor sube un archivo', 400));
    }

    await Recluta.findByIdAndUpdate(req.params.id, {
      foto_url: `/uploads/${req.file.filename}`
    });

    res.status(200).json({
      success: true,
      data: {
        foto_url: `/uploads/${req.file.filename}`
      }
    });
  } catch (err) {
    next(err);
  }
};
