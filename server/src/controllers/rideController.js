const { PrismaClient } = require('@prisma/client');
const { calculateFare, formatFare } = require('../utils/fareCalculator');

const prisma = new PrismaClient();

/**
 * Get fare estimate between two locations without creating a ride.
 * GET /api/rides/estimate?pickupLocationId=...&dropoffLocationId=...
 */
const getFareEstimate = async (req, res, next) => {
  try {
    const { pickupLocationId, dropoffLocationId } = req.query;

    if (!pickupLocationId || !dropoffLocationId) {
      return res.status(400).json({ success: false, message: 'Missing location IDs.' });
    }

    // Fetch both locations to get their coordinates
    const pickup = await prisma.location.findUnique({ where: { id: pickupLocationId } });
    const dropoff = await prisma.location.findUnique({ where: { id: dropoffLocationId } });

    if (!pickup || !dropoff) {
      return res.status(404).json({ success: false, message: 'One or both locations not found.' });
    }

    // Calculate solo fare (no pool discount)
    const soloFare = calculateFare(pickup, dropoff, false);
    // Calculate pooled fare (with discount)
    const pooledFare = calculateFare(pickup, dropoff, true);

    res.status(200).json({
      success: true,
      data: {
        solo: {
          ...soloFare,
          totalFareFormatted: formatFare(soloFare.totalFare)
        },
        pooled: {
          ...pooledFare,
          totalFareFormatted: formatFare(pooledFare.totalFare)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Passenger creates a new ride request.
 * POST /api/rides
 */
const createRide = async (req, res, next) => {
  try {
    const { pickupLocationId, dropoffLocationId, seatsNeeded = 1 } = req.body;
    const passengerId = req.user.id;

    if (!pickupLocationId || !dropoffLocationId) {
      return res.status(400).json({ success: false, message: 'Pickup and dropoff locations are required.' });
    }

    // Fetch locations to verify they exist and get coordinates for fare calculation
    const pickup = await prisma.location.findUnique({ where: { id: pickupLocationId } });
    const dropoff = await prisma.location.findUnique({ where: { id: dropoffLocationId } });

    if (!pickup || !dropoff) {
      return res.status(404).json({ success: false, message: 'Location not found.' });
    }

    // Calculate initial estimated fare (without pool discount initially)
    // The discount is applied later when a driver accepts it as a pooled ride.
    const fareEstimate = calculateFare(pickup, dropoff, false);

    // Create the ride request in the database
    const ride = await prisma.rideRequest.create({
      data: {
        passengerId,
        pickupLocationId,
        dropoffLocationId,
        seatsNeeded,
        status: 'REQUESTED',
        // Save the calculated fare breakdown
        fareAmount: fareEstimate.totalFare,
        baseFare: fareEstimate.baseFare,
        distanceCharge: fareEstimate.distanceCharge,
        poolDiscount: 0 // Initially 0, updated on match
      },
      // Include related data in the response so the client doesn't have to fetch it separately
      include: {
        pickupLocation: true,
        dropoffLocation: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Ride requested successfully. Waiting for a driver.',
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all rides requested by the current passenger.
 * GET /api/rides/my
 */
const getMyRides = async (req, res, next) => {
  try {
    const passengerId = req.user.id;

    const rides = await prisma.rideRequest.findMany({
      where: { passengerId: passengerId },
      orderBy: { createdAt: 'desc' },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        pool: {
          include: {
            driver: {
              select: { name: true, phone: true } // Only send needed driver info
            },
            vehicle: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      count: rides.length,
      data: rides
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific ride by its ID.
 * GET /api/rides/:id
 */
const getRideById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const passengerId = req.user.id;

    const ride = await prisma.rideRequest.findUnique({
      where: { id },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        pool: {
          include: {
            driver: { select: { name: true, phone: true } },
            vehicle: true
          }
        }
      }
    });

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    // Security check: Passengers can only see their own rides
    if (ride.passengerId !== passengerId) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ride.' });
    }

    res.status(200).json({
      success: true,
      data: ride
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel a ride request.
 * PATCH /api/rides/:id/cancel
 */
const cancelRide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const passengerId = req.user.id;

    // 1. Fetch the ride to check its current status
    const ride = await prisma.rideRequest.findUnique({
      where: { id }
    });

    if (!ride) {
      return res.status(404).json({ success: false, message: 'Ride not found.' });
    }

    // Security check
    if (ride.passengerId !== passengerId) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    // 2. Validate if the ride can be cancelled
    if (ride.status === 'IN_PROGRESS' || ride.status === 'COMPLETED') {
      return res.status(400).json({ success: false, message: 'Cannot cancel an ongoing or completed ride.' });
    }
    
    if (ride.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Ride is already cancelled.' });
    }

    // 3. Perform cancellation in a transaction
    // If it was MATCHED, we need to free up the seats in the pool
    await prisma.$transaction(async (tx) => {
      // Update the ride status
      const updatedRide = await tx.rideRequest.update({
        where: { id },
        data: { status: 'CANCELLED' }
      });

      // If it was assigned to a pool, decrement the occupied seats
      if (ride.poolId && (ride.status === 'MATCHED' || ride.status === 'DRIVER_ARRIVED')) {
        await tx.pool.update({
          where: { id: ride.poolId },
          data: {
            occupiedSeats: {
              decrement: ride.seatsNeeded
            }
          }
        });
      }
    });

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  getMyRides,
  getRideById,
  cancelRide,
  getFareEstimate
};
