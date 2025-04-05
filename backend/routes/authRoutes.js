const express = require('express');
const { 
  register, 
  login, 
  getMe, 
  forgotPassword, 
  resetPassword, 
  updateDetails, 
  updatePassword,
  logout,
  uploadProfilePhoto
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Rutas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);

// Rutas protegidas
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', protect, logout);
router.put('/photo', protect, upload.single('photo'), uploadProfilePhoto);

module.exports = router;
