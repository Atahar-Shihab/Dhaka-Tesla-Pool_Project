const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Fetches all available locations from the database,
 * ordered alphabetically by name.
 */
const getLocations = async (req, res, next) => {
  try {
    // Query database for all locations
    const locations = await prisma.location.findMany({
      orderBy: {
        name: 'asc' // Sort ascending by name
      }
    });

    // Send response back to the client
    res.status(200).json({
      success: true,
      count: locations.length,
      data: locations
    });
  } catch (error) {
    // Pass any errors to the global error handler
    next(error);
  }
};

module.exports = {
  getLocations
};
