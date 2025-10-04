const express = require('express');
const { body, query } = require('express-validator');
const {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
} = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createUserValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('fullName')
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 5, max: 100 })
    .withMessage('Full name must be between 5 and 100 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  body('position')
    .notEmpty()
    .withMessage('Position is required'),
  body('location')
    .notEmpty()
    .withMessage('Location is required')
];

const updateUserValidation = [
  body('fullName')
    .optional()
    .isLength({ min: 5, max: 100 })
    .withMessage('Full name must be between 5 and 100 characters'),
  body('position')
    .optional()
    .notEmpty()
    .withMessage('Position cannot be empty'),
  body('location')
    .optional()
    .notEmpty()
    .withMessage('Location cannot be empty'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

const queryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// All routes require admin access
router.use(authenticateToken, requireAdmin);

// Routes
router.get('/', queryValidation, getAllUsers);
router.get('/stats', getUserStats);
router.get('/:id', getUser);
router.post('/', createUserValidation, createUser);
router.put('/:id', updateUserValidation, updateUser);
router.delete('/:id', deleteUser);
router.patch('/:id/toggle-status', toggleUserStatus);

module.exports = router;
