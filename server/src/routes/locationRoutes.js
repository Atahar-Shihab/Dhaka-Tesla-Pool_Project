const express = require('express');
const { getLocations } = require('../controllers/locationController');

const router = express.Router();

// Public route to get all locations
router.get('/', getLocations);

module.exports = router;
