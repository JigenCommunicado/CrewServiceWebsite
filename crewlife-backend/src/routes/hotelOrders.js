const express = require('express');
const { body, query } = require('express-validator');
const {
  createHotelOrder,
  getUserHotelOrders,
  getHotelOrder,
  updateHotelOrderStatus,
  getAllHotelOrders,
  getHotelOrderStats
} = require('../controllers/hotelOrderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createHotelOrderValidation = [
  body('city')
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('checkInDate')
    .notEmpty()
    .withMessage('Check-in date is required')
    .isISO8601()
    .withMessage('Check-in date must be a valid date'),
  body('checkInTime')
    .notEmpty()
    .withMessage('Check-in time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Check-in time must be in HH:MM format'),
  body('checkOutDate')
    .notEmpty()
    .withMessage('Check-out date is required')
    .isISO8601()
    .withMessage('Check-out date must be a valid date'),
  body('checkOutTime')
    .notEmpty()
    .withMessage('Check-out time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Check-out time must be in HH:MM format'),
  body('flightDate')
    .notEmpty()
    .withMessage('Flight date is required')
    .isISO8601()
    .withMessage('Flight date must be a valid date'),
  body('flightNumber')
    .notEmpty()
    .withMessage('Flight number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Flight number must be between 3 and 20 characters')
];

const updateStatusValidation = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['NEW', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Status must be one of: NEW, PROCESSING, CONFIRMED, CANCELLED, COMPLETED'),
  body('adminNotes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Admin notes must not exceed 1000 characters')
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
  query('status')
    .optional()
    .isIn(['NEW', 'PROCESSING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Status must be one of: NEW, PROCESSING, CONFIRMED, CANCELLED, COMPLETED'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// Routes
router.post('/', authenticateToken, createHotelOrderValidation, createHotelOrder);
router.get('/my', authenticateToken, queryValidation, getUserHotelOrders);
router.get('/stats', authenticateToken, getHotelOrderStats);
router.get('/:id', authenticateToken, getHotelOrder);

// Admin routes
router.get('/', authenticateToken, requireAdmin, queryValidation, getAllHotelOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateStatusValidation, updateHotelOrderStatus);

module.exports = router;
