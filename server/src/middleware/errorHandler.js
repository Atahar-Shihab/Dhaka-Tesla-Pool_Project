/**
 * Global Error Handler Middleware for Express.
 * This catches errors thrown anywhere in the app and sends a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('An error occurred:', err);

  // Default error details
  let statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // --- Handle specific Prisma database errors ---

  // P2002: Unique constraint failed
  if (err.code === 'P2002') {
    statusCode = 400; // Bad Request
    const field = err.meta && err.meta.target ? err.meta.target.join(', ') : 'field';
    message = `Duplicate value error. The ${field} is already in use.`;
  }

  // P2025: Record not found
  if (err.code === 'P2025') {
    statusCode = 404; // Not Found
    message = 'Requested record was not found in the database.';
  }

  // Send the error response
  res.status(statusCode).json({
    success: false,
    message: message,
    // Include stack trace only in development mode for easier debugging
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { errorHandler };
