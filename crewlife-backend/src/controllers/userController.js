const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, position, location, isActive } = req.query;
    const skip = (page - 1) * limit;

    const where = {};

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } },
        { position: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (position) {
      where.position = position;
    }

    if (location) {
      where.location = location;
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          employeeId: true,
          fullName: true,
          position: true,
          location: true,
          isActive: true,
          createdAt: true,
          lastLogin: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);

    res.status(200).json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get single user (admin only)
const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        position: true,
        location: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    res.status(200).json({
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Create user (admin only)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { employeeId, fullName, password, position, location } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { employeeId }
    });

    if (existingUser) {
      return res.status(409).json({
        message: 'User with this employee ID already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        employeeId,
        fullName,
        password: hashedPassword,
        position,
        location
      },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        position: true,
        location: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Update user (admin only)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { fullName, position, location, isActive } = req.body;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const updateData = {};
    if (fullName) updateData.fullName = fullName;
    if (position) updateData.position = position;
    if (location) updateData.location = location;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        position: true,
        location: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Toggle user status (admin only)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive
      },
      select: {
        id: true,
        employeeId: true,
        fullName: true,
        position: true,
        location: true,
        isActive: true,
        createdAt: true,
        lastLogin: true
      }
    });

    res.status(200).json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

// Get user statistics (admin only)
const getUserStats = async (req, res) => {
  try {
    const [totalUsers, activeUsers, inactiveUsers] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: false } })
    ]);

    const positionStats = await prisma.user.groupBy({
      by: ['position'],
      _count: {
        position: true
      }
    });

    const locationStats = await prisma.user.groupBy({
      by: ['location'],
      _count: {
        location: true
      }
    });

    res.status(200).json({
      totalUsers,
      activeUsers,
      inactiveUsers,
      positionStats,
      locationStats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStats
};
