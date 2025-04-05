const express = require('express');
const { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser,
  getUserStats,
  changeUserRole,
  resetUserPassword,
  getUserReclutas
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Proteger todas las rutas y restringir a admin
router.use(protect);
router.use(authorize('admin'));

router.route('/stats')
  .get(getUserStats);

router.route('/')
  .get(getUsers)
  .post(createUser);

router.route('/:id')
  .get(getUser)
  .put(updateUser)
  .delete(deleteUser);

router.route('/:id/role')
  .put(changeUserRole);

router.route('/:id/resetpassword')
  .put(resetUserPassword);

router.route('/:id/reclutas')
  .get(getUserReclutas);

module.exports = router;
