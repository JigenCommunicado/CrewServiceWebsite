const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Generate order number
const generateOrderNumber = async () => {
  const count = await prisma.hotelOrder.count();
  const year = new Date().getFullYear();
  return `HT-${year}-${String(count + 1).padStart(4, '0')}`;
};

// Create hotel order
const createHotelOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      city,
      checkInDate,
      checkInTime,
      checkOutDate,
      checkOutTime,
      flightDate,
      flightNumber
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

    // Create hotel order
    const hotelOrder = await prisma.hotelOrder.create({
      data: {
        orderNumber,
        userId: req.user.id,
        employeeId: user.employeeId,
        fullName: user.fullName,
        city,
        checkInDate: new Date(checkInDate),
        checkInTime,
        checkOutDate: new Date(checkOutDate),
        checkOutTime,
        flightDate: new Date(flightDate),
        flightNumber
      }
    });

    res.status(201).json({
      message: 'Hotel order created successfully',
      order: hotelOrder
    });
  } catch (error) {
    console.error('Create hotel order error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get user's hotel orders
const getUserHotelOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {
      userId: req.user.id
    };

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { flightNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.hotelOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hotelOrder.count({ where })
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
    console.error('Get user hotel orders error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get single hotel order
const getHotelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.hotelOrder.findFirst({
      where: {
        id,
        userId: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        message: 'Hotel order not found'
      });
    }

    res.status(200).json({
      order
    });
  } catch (error) {
    console.error('Get hotel order error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Update hotel order status (admin only)
const updateHotelOrderStatus = async (req, res) => {
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

    const order = await prisma.hotelOrder.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        message: 'Hotel order not found'
      });
    }

    const updatedOrder = await prisma.hotelOrder.update({
      where: { id },
      data: {
        status,
        adminNotes,
        processedBy: req.user.id,
        processedAt: new Date()
      }
    });

    res.status(200).json({
      message: 'Hotel order status updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error('Update hotel order status error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get all hotel orders (admin only)
const getAllHotelOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
        { flightNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [orders, total] = await Promise.all([
      prisma.hotelOrder.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' }
      }),
      prisma.hotelOrder.count({ where })
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
    console.error('Get all hotel orders error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get hotel order statistics
const getHotelOrderStats = async (req, res) => {
  try {
    const stats = await prisma.hotelOrder.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const totalOrders = await prisma.hotelOrder.count();

    res.status(200).json({
      stats,
      totalOrders
    });
  } catch (error) {
    console.error('Get hotel order stats error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createHotelOrder,
  getUserHotelOrders,
  getHotelOrder,
  updateHotelOrderStatus,
  getAllHotelOrders,
  getHotelOrderStats
};
