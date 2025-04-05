const ErrorResponse = require('../utils/errorResponse');
const Entrevista = require('../models/Entrevista');
const Recluta = require('../models/Recluta');
const sendEmail = require('../utils/sendEmail');

// @desc    Obtener todas las entrevistas
// @route   GET /api/entrevistas
// @route   GET /api/reclutas/:reclutaId/entrevistas
// @access  Private
exports.getEntrevistas = async (req, res, next) => {
  try {
    let query;

    if (req.params.reclutaId) {
      // Obtener entrevistas para un recluta específico
      query = Entrevista.find({ recluta: req.params.reclutaId });
    } else {
      // Obtener todas las entrevistas
      query = Entrevista.find();
    }

    // Restringir a entrevistas del usuario actual (excepto admins)
    if (req.user.role !== 'admin') {
      query = query.find({ user: req.user.id });
    }

    // Poblar con referencias
    query = query.populate({
      path: 'recluta',
      select: 'nombre email puesto foto_url estado'
    }).populate({
      path: 'user',
      select: 'nombre email'
    });

    // Ejecutar consulta
    const entrevistas = await query;

    res.status(200).json({
      success: true,
      count: entrevistas.length,
      data: entrevistas
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Obtener una entrevista
// @route   GET /api/entrevistas/:id
// @access  Private
exports.getEntrevista = async (req, res, next) => {
  try {
    const entrevista = await Entrevista.findById(req.params.id)
      .populate({
        path: 'recluta',
        select: 'nombre email puesto foto_url estado'
      })
      .populate({
        path: 'user',
        select: 'nombre email'
      });

    if (!entrevista) {
      return next(new ErrorResponse(`Entrevista no encontrada con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es el creador de la entrevista
    if (entrevista.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para acceder a esta entrevista`, 401));
    }

    res.status(200).json({
      success: true,
      data: entrevista
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Crear nueva entrevista
// @route   POST /api/reclutas/:reclutaId/entrevistas
// @access  Private
exports.createEntrevista = async (req, res, next) => {
  try {
    req.body.recluta = req.params.reclutaId;
    req.body.user = req.user.id;

    const recluta = await Recluta.findById(req.params.reclutaId);

    if (!recluta) {
      return next(new ErrorResponse(`Recluta no encontrado con id ${req.params.reclutaId}`, 404));
    }

    // Asegurarse que el usuario es dueño del recluta
    if (recluta.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para agregar entrevista a este recluta`, 401));
    }

    const entrevista = await Entrevista.create(req.body);

    // Enviar email de confirmación si se solicitó
    if (req.body.enviar_email) {
      await enviarEmailEntrevista(entrevista, recluta);
    }

    res.status(201).json({
      success: true,
      data: entrevista
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Actualizar entrevista
// @route   PUT /api/entrevistas/:id
// @access  Private
exports.updateEntrevista = async (req, res, next) => {
  try {
    let entrevista = await Entrevista.findById(req.params.id);

    if (!entrevista) {
      return next(new ErrorResponse(`Entrevista no encontrada con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es el creador de la entrevista
    if (entrevista.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para actualizar esta entrevista`, 401));
    }

    entrevista = await Entrevista.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: entrevista
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Eliminar entrevista
// @route   DELETE /api/entrevistas/:id
// @access  Private
exports.deleteEntrevista = async (req, res, next) => {
  try {
    const entrevista = await Entrevista.findById(req.params.id);

    if (!entrevista) {
      return next(new ErrorResponse(`Entrevista no encontrada con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es el creador de la entrevista
    if (entrevista.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para eliminar esta entrevista`, 401));
    }

    await entrevista.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enviar recordatorio de entrevista
// @route   POST /api/entrevistas/:id/enviarrecordatorio
// @access  Private
exports.enviarRecordatorio = async (req, res, next) => {
  try {
    const entrevista = await Entrevista.findById(req.params.id);

    if (!entrevista) {
      return next(new ErrorResponse(`Entrevista no encontrada con id ${req.params.id}`, 404));
    }

    // Asegurarse que el usuario es el creador de la entrevista
    if (entrevista.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return next(new ErrorResponse(`Usuario ${req.user.id} no autorizado para enviar recordatorio`, 401));
    }

    const recluta = await Recluta.findById(entrevista.recluta);

    if (!recluta) {
      return next(new ErrorResponse(`Recluta no encontrado`, 404));
    }

    // Enviar email recordatorio
    await enviarEmailEntrevista(entrevista, recluta, true);

    res.status(200).json({
      success: true,
      data: {
        mensaje: 'Recordatorio enviado correctamente'
      }
    });
  } catch (err) {
    next(err);
  }
};

// Función para enviar email de entrevista
const enviarEmailEntrevista = async (entrevista, recluta, esRecordatorio = false) => {
  // Formatear fecha y hora
  const fecha = new Date(entrevista.fecha).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  const asunto = esRecordatorio
    ? `Recordatorio: Entrevista - Sistema de Gestión de Reclutas`
    : `Invitación a Entrevista - Sistema de Gestión de Reclutas`;
  
  const intro = esRecordatorio
    ? `<p>Le recordamos que tiene una entrevista programada para el puesto de <strong>${recluta.puesto || 'No especificado'}</strong>.</p>`
    : `<p>Nos complace invitarle a una entrevista para el puesto de <strong>${recluta.puesto || 'No especificado'}</strong>.</p>`;

  // Crear contenido del email
  const html = `
    <h1>Estimado/a ${recluta.nombre}</h1>
    ${intro}
    <h2>Detalles de la entrevista:</h2>
    <ul>
      <li><strong>Fecha:</strong> ${fecha}</li>
      <li><strong>Hora:</strong> ${entrevista.hora}</li>
      <li><strong>Duración:</strong> ${entrevista.duracion} minutos</li>
      <li><strong>Tipo:</strong> ${entrevista.tipo.charAt(0).toUpperCase() + entrevista.tipo.slice(1)}</li>
      ${entrevista.ubicacion ? `<li><strong>Ubicación:</strong> ${entrevista.ubicacion}</li>` : ''}
    </ul>
    ${entrevista.notas ? `<p><strong>Notas adicionales:</strong> ${entrevista.notas}</p>` : ''}
    <p>Por favor, confirme su asistencia respondiendo a este correo electrónico.</p>
    <p>Saludos cordiales,<br>Sistema de Gestión de Reclutas</p>
  `;

  await sendEmail({
    to: recluta.email,
    subject: asunto,
    html
  });

  // Actualizar campo enviado_email
  await Entrevista.findByIdAndUpdate(entrevista._id, {
    enviado_email: true
  });
};
