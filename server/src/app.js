// Load environment variables from a .env file located one directory up (if any)
require('dotenv').config({ path: '../.env' });
// Also load from current directory .env to be safe
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import Route Handlers
// We will create these files shortly!
const authRoutes = require('./routes/authRoutes');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');
const locationRoutes = require('./routes/locationRoutes');

// Import Global Error Handler
const { errorHandler } = require('./middleware/errorHandler');

// Initialize the Express application
const app = express();

// ==========================================
// Middleware Setup
// ==========================================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows our React frontend (running on different ports) to communicate with this backend.
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'], // Allow these frontend URLs
  credentials: true, // Allow cookies if needed
}));

// Parse incoming JSON requests and put the parsed data in req.body
app.use(express.json());

// ==========================================
// API Routes
// ==========================================

// Simple health check endpoint to verify the server is running
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Dhaka Tesla Pool API is running' 
  });
});

// Register our feature-specific routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/rides', rideRoutes);
app.use('/api/driver', driverRoutes);

// ==========================================
// Error Handling
// ==========================================
// This must be the last middleware used!
app.use(errorHandler);

// ==========================================
// Server Initialization
// ==========================================
// Only start listening when this file is run directly (not when imported by tests)
const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app; // Export for testing purposes

