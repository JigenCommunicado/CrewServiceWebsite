const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Generate order number
const generateOrderNumber = async () => {
  const count = await prisma.flightOrder.count();
  const year = new Date().getFullYear();
  return `FL-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Create flight order
const createFlightOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      departureCity,
      arrivalCity,
      departureDate,
      departureTime,
      arrivalDate,
      arrivalTime,
      flightNumber,
      airline,
      purpose,
      priority = 'MEDIUM',
      passengers = 1,
      luggageInfo,
      specialRequests
    } = req.body;

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { employeeId: true, fullName: true }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create flight order
    const flightOrder = await prisma.flightOrder.create({
      data: {
        orderNumber,
        userId: req.user.id,
        employeeId: user.employeeId,
        fullName: user.fullName,
        departureCity,
        arrivalCity,
        departureDate: new Date(departureDate),
        departureTime,
        arrivalDate: new Date(arrivalDate),
        arrivalTime,
        flightNumber,
        airline,
        purpose,
        priority,
        passengers,
        luggageInfo,
        specialRequests
      }
    });

    res.status(201).json({
      message: 'Flight order created successfully',
      order: flightOrder
    });
  } catch (error) {
    console.error('Create flight order error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get user's flight orders
const getUserFlightOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { departureCity: { contains: search, mode: 'insensitive' } },
        { arrivalCity: { contains: search, mode: 'insensitive' } },
        { flightNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.flightOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.flightOrder.count({ where })
    ]);

    res.status(200).json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user flight orders error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get single flight order
const getFlightOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.flightOrder.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        message: 'Flight order not found'
      });
    }

    res.status(200).json({
      order
    });
  } catch (error) {
    console.error('Get flight order error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Update flight order status (admin only)
const updateFlightOrderStatus = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const order = await prisma.flightOrder.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        message: 'Flight order not found'
      });
    }

    const updatedOrder = await prisma.flightOrder.update({
      where: { id },
      data: {
        status,
        adminNotes,
        processedBy: req.user.id,
        processedAt: new Date()
      }
    });

    res.status(200).json({
      message: 'Flight order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update flight order status error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get all flight orders (admin only)
const getAllFlightOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { departureCity: { contains: search, mode: 'insensitive' } },
        { arrivalCity: { contains: search, mode: 'insensitive' } },
        { flightNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.flightOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.flightOrder.count({ where })
    ]);

    res.status(200).json({
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all flight orders error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get flight order statistics
const getFlightOrderStats = async (req, res) => {
  try {
    const stats = await prisma.flightOrder.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const totalOrders = await prisma.flightOrder.count();

    res.status(200).json({
      stats,
      totalOrders
    });
  } catch (error) {
    console.error('Get flight order stats error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createFlightOrder,
  getUserFlightOrders,
  getFlightOrder,
  updateFlightOrderStatus,
  getAllFlightOrders,
  getFlightOrderStats
};
