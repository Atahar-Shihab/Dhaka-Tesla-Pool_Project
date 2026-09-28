const { PrismaClient } = require('@prisma/client');
const { calculateFare } = require('../utils/fareCalculator');

const prisma = new PrismaClient();

/**
 * Toggle driver's online status (vehicle active/inactive).
 * PATCH /api/driver/status
 */
const toggleOnlineStatus = async (req, res, next) => {
  try {
    const driverId = req.user.id;
    const { isActive } = req.body;

    // Find the driver's vehicle
    const vehicle = await prisma.vehicle.findUnique({
      where: { driverId }
    });

    if (!vehicle) {
      return res.status(404).json({ success: false, message: 'Vehicle not found for this driver.' });
    }

    // Update vehicle status
    const updatedVehicle = await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { isActive: isActive }
    });

    res.status(200).json({
      success: true,
      message: `You are now ${isActive ? 'online' : 'offline'}.`,
      data: updatedVehicle
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all available ride requests that haven't been accepted yet.
 * GET /api/driver/requests
 */
const getAvailableRequests = async (req, res, next) => {
  try {
    // Only show rides that are REQUESTED (not yet matched)
    const requests = await prisma.rideRequest.findMany({
      where: { status: 'REQUESTED' },
      include: {
        pickupLocation: true,
        dropoffLocation: true,
        passenger: { select: { name: true, phone: true } }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Accept a ride request and add it to the driver's current pool.
 * CRITICAL FUNCTION: Uses transactions and row-level locking to prevent double-booking seats.
 * POST /api/driver/accept/:rideId
 */
const acceptRide = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.user.id;

    // 1. Get driver's vehicle
    const vehicle = await prisma.vehicle.findUnique({ where: { driverId } });
    if (!vehicle || !vehicle.isActive) {
      return res.status(400).json({ success: false, message: 'You must be online with an active vehicle to accept rides.' });
    }

    // 2. We use a transaction because we need to check seat availability and update multiple records safely
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Check if the ride is still available
      const ride = await tx.rideRequest.findUnique({
        where: { id: rideId },
        include: { pickupLocation: true, dropoffLocation: true }
      });

      if (!ride || ride.status !== 'REQUESTED') {
        throw new Error('This ride is no longer available.');
      }

      // B. Find driver's active pool, or create one if it doesn't exist
      let pool = await tx.pool.findFirst({
        where: { 
          driverId,
          status: { in: ['OPEN', 'IN_PROGRESS'] } 
        }
      });

      if (!pool) {
        // Create a new pool
        pool = await tx.pool.create({
          data: {
            driverId,
            vehicleId: vehicle.id,
            status: 'OPEN',
            occupiedSeats: 0
          }
        });
      } else {
        // CONCURRENCY PROTECTION
        // Lock the pool row using raw SQL to ensure no other transaction modifies it concurrently
        await tx.$executeRaw`SELECT * FROM "Pool" WHERE id = ${pool.id}::uuid FOR UPDATE`;
        
        // Refetch to get the latest occupied seats after locking
        pool = await tx.pool.findUnique({ where: { id: pool.id } });
      }

      // C. Check if we have enough seats!
      if (pool.occupiedSeats + ride.seatsNeeded > vehicle.capacity) {
        throw new Error('Not enough seats available in your vehicle.');
      }

      // D. Calculate new pooled fare for the passenger (gives them the discount!)
      const newFare = calculateFare(ride.pickupLocation, ride.dropoffLocation, true);

      // E. Update the Pool (increment seats)
      await tx.pool.update({
        where: { id: pool.id },
        data: {
          occupiedSeats: { increment: ride.seatsNeeded }
        }
      });

      // F. Update the RideRequest
      const updatedRide = await tx.rideRequest.update({
        where: { id: rideId },
        data: {
          status: 'MATCHED',
          poolId: pool.id,
          // Apply the new discounted fare
          fareAmount: newFare.totalFare,
          baseFare: newFare.baseFare,
          distanceCharge: newFare.distanceCharge,
          poolDiscount: newFare.poolDiscount
        },
        include: {
          pickupLocation: true,
          dropoffLocation: true,
          passenger: { select: { name: true, phone: true } }
        }
      });

      return updatedRide;
    });

    res.status(200).json({
      success: true,
      message: 'Ride accepted and added to pool successfully.',
      data: result
    });

  } catch (error) {
    // If our manual errors were thrown, send them back nicely
    if (error.message === 'This ride is no longer available.' || error.message === 'Not enough seats available in your vehicle.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Driver marks that they have arrived at the pickup location.
 * PATCH /api/driver/rides/:rideId/arrive
 */
const markArrived = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    // Verify ride is currently matched
    const ride = await prisma.rideRequest.findUnique({ where: { id: rideId } });
    if (!ride || ride.status !== 'MATCHED') {
      return res.status(400).json({ success: false, message: 'Invalid ride status for this action.' });
    }

    const updatedRide = await prisma.rideRequest.update({
      where: { id: rideId },
      data: { status: 'DRIVER_ARRIVED' }
    });

    res.status(200).json({ success: true, data: updatedRide });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver starts the trip (passenger picked up).
 * PATCH /api/driver/rides/:rideId/start
 */
const startTrip = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    
    const ride = await prisma.rideRequest.findUnique({ where: { id: rideId } });
    if (!ride || ride.status !== 'DRIVER_ARRIVED') {
      return res.status(400).json({ success: false, message: 'Driver must arrive before starting trip.' });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Update ride status
      await tx.rideRequest.update({
        where: { id: rideId },
        data: { status: 'IN_PROGRESS' }
      });

      // 2. Also ensure the pool is marked as in progress (if poolId exists)
      if (ride.poolId) {
        await tx.pool.update({
          where: { id: ride.poolId },
          data: { status: 'IN_PROGRESS' }
        });
      }
    });

    res.status(200).json({ success: true, message: 'Trip started!' });
  } catch (error) {
    next(error);
  }
};

/**
 * Driver completes a specific passenger's ride (dropoff).
 * PATCH /api/driver/rides/:rideId/complete
 */
const completeTrip = async (req, res, next) => {
  try {
    const { rideId } = req.params;

    await prisma.$transaction(async (tx) => {
      const ride = await tx.rideRequest.findUnique({ where: { id: rideId } });
      if (!ride || ride.status !== 'IN_PROGRESS') {
        throw new Error('Ride must be in progress to complete.');
      }

      // 1. Mark ride as COMPLETED
      await tx.rideRequest.update({
        where: { id: rideId },
        data: { status: 'COMPLETED' }
      });

      // 2. Create a pending payment record
      await tx.payment.create({
        data: {
          rideRequestId: ride.id,
          amount: ride.fareAmount,
          method: 'CASH', // Defaulting to cash for simplicity
          status: 'PENDING'
        }
      });

      // 3. Decrement occupied seats in the pool
      const updatedPool = await tx.pool.update({
        where: { id: ride.poolId },
        data: { occupiedSeats: { decrement: ride.seatsNeeded } },
        include: { rideRequests: true }
      });

      // 4. If pool is empty AND all rides are completed/cancelled, close the pool
      const allRidesDone = updatedPool.rideRequests.every(r => 
        r.status === 'COMPLETED' || r.status === 'CANCELLED'
      );

      if (updatedPool.occupiedSeats === 0 && allRidesDone) {
        await tx.pool.update({
          where: { id: updatedPool.id },
          data: { status: 'COMPLETED' }
        });
      }
    });

    res.status(200).json({ success: true, message: 'Ride completed successfully.' });
  } catch (error) {
    if (error.message === 'Ride must be in progress to complete.') {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Get details of a specific pool.
 * GET /api/driver/pool/:poolId
 */
const getPoolDetails = async (req, res, next) => {
  try {
    const { poolId } = req.params;

    const pool = await prisma.pool.findUnique({
      where: { id: poolId },
      include: {
        rideRequests: {
          include: {
            passenger: { select: { name: true, phone: true } },
            pickupLocation: true,
            dropoffLocation: true,
            payment: true
          }
        }
      }
    });

    if (!pool) return res.status(404).json({ success: false, message: 'Pool not found.' });

    res.status(200).json({ success: true, data: pool });
  } catch (error) {
    next(error);
  }
};

/**
 * Get driver's past pools/rides history.
 * GET /api/driver/history
 */
const getMyHistory = async (req, res, next) => {
  try {
    const driverId = req.user.id;

    const pools = await prisma.pool.findMany({
      where: { driverId: driverId },
      orderBy: { createdAt: 'desc' },
      include: {
        rideRequests: {
          include: {
            pickupLocation: true,
            dropoffLocation: true
          }
        }
      }
    });

    res.status(200).json({ success: true, count: pools.length, data: pools });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  toggleOnlineStatus,
  getAvailableRequests,
  acceptRide,
  markArrived,
  startTrip,
  completeTrip,
  getPoolDetails,
  getMyHistory
};
