const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_dev';

/**
 * Helper function to generate a JWT token for a user.
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role: role },
    JWT_SECRET,
    { expiresIn: '30d' } // Token expires in 30 days
  );
};

/**
 * Register a new user (Passenger or Driver).
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Basic validation
    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    if (role !== 'PASSENGER' && role !== 'DRIVER') {
      return res.status(400).json({ success: false, message: 'Invalid role. Must be PASSENGER or DRIVER.' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email is already in use.' });
    }

    // Hash the password securely using bcrypt (10 rounds)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user in the database
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        phone,
      },
    });

    // Generate token
    const token = generateToken(user.id, user.role);

    // Send response (exclude password for security)
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error); // Pass error to global error handler
  }
};

/**
 * Login an existing user.
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    
    // Check if user exists and password is correct
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate token
    const token = generateToken(user.id, user.role);

    // Send response
    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current logged-in user profile.
 * This route is protected by authentication middleware.
 */
const getMe = async (req, res, next) => {
  try {
    // req.user.id is set by the authenticate middleware
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      // Include the vehicle details if the user is a driver
      include: {
        vehicle: true
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    // Don't send the password back!
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe
};
