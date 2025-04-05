const express = require('express');
const { 
  getEntrevistas, 
  getEntrevista, 
  createEntrevista, 
  updateEntrevista, 
  deleteEntrevista,
  enviarRecordatorio
} = require('../controllers/entrevistaController');

const { protect } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// Proteger todas las rutas
router.use(protect);

router.route('/')
  .get(getEntrevistas)
  .post(createEntrevista);

router.route('/:id')
  .get(getEntrevista)
  .put(updateEntrevista)
  .delete(deleteEntrevista);

router.route('/:id/enviarrecordatorio')
  .post(enviarRecordatorio);

module.exports = router;
