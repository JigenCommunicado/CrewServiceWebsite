const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, employeeId: true, fullName: true, position: true, isActive: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid or inactive user' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Check if user is admin (you can add admin field to User model)
  // For now, we'll check by position
  const adminPositions = ['ADMIN', 'MANAGER', 'SUPERVISOR'];
  
  if (!adminPositions.includes(req.user.position?.toUpperCase())) {
    return res.status(403).json({ message: 'Admin access required' });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};