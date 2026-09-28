const express = require('express');
const { 
  toggleOnlineStatus, 
  getAvailableRequests, 
  acceptRide, 
  markArrived, 
  startTrip, 
  completeTrip, 
  getPoolDetails, 
  getMyHistory 
} = require('../controllers/driverController');
const { authenticate, authorizeRole } = require('../middleware/auth');

const router = express.Router();

// All driver routes require authentication AND the DRIVER role
router.use(authenticate);
router.use(authorizeRole('DRIVER'));

// General driver actions
router.patch('/status', toggleOnlineStatus);
router.get('/requests', getAvailableRequests);
router.get('/history', getMyHistory);
router.get('/pool/:poolId', getPoolDetails);

// Actions on a specific ride request
router.post('/accept/:rideId', acceptRide);
router.patch('/rides/:rideId/arrive', markArrived);
router.patch('/rides/:rideId/start', startTrip);
router.patch('/rides/:rideId/complete', completeTrip);

module.exports = router;
