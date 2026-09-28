const express = require('express');
const { 
  createRide, 
  getMyRides, 
  getRideById, 
  cancelRide, 
  getFareEstimate 
} = require('../controllers/rideController');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// All ride routes require authentication
router.use(authenticate);

// Estimate fare (doesn't require PASSENGER role strictly, but good to have)
router.get('/estimate', getFareEstimate);

// Passenger specific routes
router.post('/', authorizeRole('PASSENGER'), createRide);
router.get('/my', authorizeRole('PASSENGER'), getMyRides);
router.get('/:id', authorizeRole('PASSENGER'), getRideById);
router.patch('/:id/cancel', authorizeRole('PASSENGER'), cancelRide);

module.exports = router;
