const express = require('express');
const { body, query } = require('express-validator');
const {
  createFlightOrder,
  getUserFlightOrders,
  getFlightOrder,
  updateFlightOrderStatus,
  getAllFlightOrders,
  getFlightOrderStats
} = require('../controllers/flightOrderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const createFlightOrderValidation = [
  body('departureCity')
    .notEmpty()
    .withMessage('Departure city is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Departure city must be between 2 and 50 characters'),
  body('arrivalCity')
    .notEmpty()
    .withMessage('Arrival city is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Arrival city must be between 2 and 50 characters'),
  body('departureDate')
    .notEmpty()
    .withMessage('Departure date is required')
    .isISO8601()
    .withMessage('Departure date must be a valid date'),
  body('departureTime')
    .notEmpty()
    .withMessage('Departure time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Departure time must be in HH:MM format'),
  body('arrivalDate')
    .notEmpty()
    .withMessage('Arrival date is required')
    .isISO8601()
    .withMessage('Arrival date must be a valid date'),
  body('arrivalTime')
    .notEmpty()
    .withMessage('Arrival time is required')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Arrival time must be in HH:MM format'),
  body('flightNumber')
    .notEmpty()
    .withMessage('Flight number is required')
    .isLength({ min: 3, max: 20 })
    .withMessage('Flight number must be between 3 and 20 characters'),
  body('airline')
    .notEmpty()
    .withMessage('Airline is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Airline must be between 2 and 50 characters'),
  body('purpose')
    .notEmpty()
    .withMessage('Purpose is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Purpose must be between 5 and 200 characters'),
  body('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH, URGENT'),
  body('passengers')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Passengers must be between 1 and 10'),
  body('luggageInfo')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Luggage info must not exceed 500 characters'),
  body('specialRequests')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Special requests must not exceed 500 characters')
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
  query('priority')
    .optional()
    .isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT'])
    .withMessage('Priority must be one of: LOW, MEDIUM, HIGH, URGENT'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters')
];

// Routes
router.post('/', authenticateToken, createFlightOrderValidation, createFlightOrder);
router.get('/my', authenticateToken, queryValidation, getUserFlightOrders);
router.get('/stats', authenticateToken, getFlightOrderStats);
router.get('/:id', authenticateToken, getFlightOrder);

// Admin routes
router.get('/', authenticateToken, requireAdmin, queryValidation, getAllFlightOrders);
router.put('/:id/status', authenticateToken, requireAdmin, updateStatusValidation, updateFlightOrderStatus);

module.exports = router;
