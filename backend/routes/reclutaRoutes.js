const express = require('express');
const { 
  getReclutas, 
  getRecluta, 
  createRecluta, 
  updateRecluta, 
  deleteRecluta,
  uploadReclutaPhoto
} = require('../controllers/reclutaController');

const Recluta = require('../models/Recluta');

// Incluir otras rutas de recursos
const entrevistaRouter = require('./entrevistaRoutes');

const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Re-rutear a otras rutas de recursos
router.use('/:reclutaId/entrevistas', entrevistaRouter);

// Proteger todas las rutas
router.use(protect);

// Rutas
router.route('/')
  .get(getReclutas)
  .post(createRecluta);

router.route('/:id')
  .get(getRecluta)
  .put(updateRecluta)
  .delete(deleteRecluta);

router.route('/:id/photo')
  .put(upload.single('photo'), uploadReclutaPhoto);

module.exports = router;
