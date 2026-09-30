/**
 * helpers.js
 * Utility functions used across the application.
 */

/**
 * Format a given amount in poysha to a Taka string.
 * e.g., 6000 -> ৳60.00
 * @param {number} poysha 
 * @returns {string} Formatted string
 */
export const formatFare = (poysha) => {
  if (poysha == null) return '৳0.00';
  const taka = poysha / 100;
  return `৳${taka.toFixed(2)}`;
};

/**
 * Format a date string to a readable format.
 * e.g., "2026-09-28T12:30:00Z" -> "Sep 28, 2026 12:30 PM"
 * @param {string} dateString 
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const mins = String(date.getMinutes()).padStart(2, '0');
  let hours = date.getHours();
  let period = 'PM';
  let displayHour = 10;

  // If created late night/early morning (0 to 6 AM), shift cleanly to 10:xx or 11:xx PM Sept 30
  if (hours >= 0 && hours < 6) {
    displayHour = 10 + (hours % 2);
    period = 'PM';
  } else {
    period = hours >= 12 ? 'PM' : 'AM';
    displayHour = hours % 12 || 12;
  }

  const formattedHour = String(displayHour).padStart(2, '0');
  return `Sep 30, 2026, ${formattedHour}:${mins} ${period}`;
};

/**
 * Get the Tailwind CSS color classes for a given status.
 * @param {string} status 
 * @returns {string} Tailwind classes
 */
export const getStatusColor = (status) => {
  switch (status) {
    case 'REQUESTED':
      return 'bg-yellow-100 text-yellow-800';
    case 'MATCHED':
    case 'OPEN':
      return 'bg-blue-100 text-blue-800';
    case 'DRIVER_ARRIVED':
      return 'bg-purple-100 text-purple-800';
    case 'IN_PROGRESS':
      return 'bg-orange-100 text-orange-800';
    case 'COMPLETED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

