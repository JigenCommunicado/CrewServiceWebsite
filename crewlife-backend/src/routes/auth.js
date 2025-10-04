const express = require('express');
const { body } = require('express-validator');
const { login, register, getProfile, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const loginValidation = [
  body('employeeId')
    .notEmpty()
    .withMessage('Employee ID is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Employee ID must be between 3 and 20 characters'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const registerValidation = [
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

const updateProfileValidation = [
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
    .withMessage('Location cannot be empty')
];

// Routes
router.post('/login', loginValidation, login);
router.post('/register', registerValidation, register);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfileValidation, updateProfile);

module.exports = router;
