/**
 * Fare Calculation Utility
 * Handles calculating distances and converting that into fare amounts.
 */

// We store money in 'poysha' (like cents) to avoid JavaScript floating-point errors.
// 100 poysha = 1 BDT (Bangladeshi Taka)
const BASE_FARE = 3000; // 30 BDT
const RATE_PER_KM = 1500; // 15 BDT per kilometer
const POOL_DISCOUNT_PERCENT = 20; // 20% discount if pooling

/**
 * Calculates the distance between two points using the Haversine formula.
 * This calculates the straight-line "as the crow flies" distance on a sphere (Earth).
 * 
 * @param {Number} lat1 
 * @param {Number} lon1 
 * @param {Number} lat2 
 * @param {Number} lon2 
 * @returns {Number} Distance in kilometers
 */
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);  
  const dLon = deg2rad(lon2 - lon1); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

/**
 * Calculates the total fare for a ride.
 * 
 * @param {Object} pickupLocation - Needs .latitude and .longitude
 * @param {Object} dropoffLocation - Needs .latitude and .longitude
 * @param {Boolean} isPooled - Whether this ride will get a pool discount
 * @returns {Object} Fare breakdown in poysha
 */
function calculateFare(pickupLocation, dropoffLocation, isPooled = false) {
  // 1. Calculate distance in kilometers
  const distanceKm = getDistanceFromLatLonInKm(
    Number(pickupLocation.latitude), 
    Number(pickupLocation.longitude), 
    Number(dropoffLocation.latitude), 
    Number(dropoffLocation.longitude)
  );

  // 2. Calculate distance charge
  // Math.round ensures we keep integer poysha values
  const distanceCharge = Math.round(distanceKm * RATE_PER_KM);

  // 3. Subtotal before discount
  let totalFare = BASE_FARE + distanceCharge;
  let poolDiscount = 0;

  // 4. Apply pooling discount if applicable
  if (isPooled) {
    poolDiscount = Math.round((totalFare * POOL_DISCOUNT_PERCENT) / 100);
    totalFare = totalFare - poolDiscount;
  }

  // Return the full breakdown
  return {
    baseFare: BASE_FARE,
    distanceCharge: distanceCharge,
    poolDiscount: poolDiscount,
    totalFare: totalFare
  };
}

/**
 * Helper to format poysha into a readable string (e.g., "60.00 BDT")
 * @param {Number} poysha 
 * @returns {String}
 */
function formatFare(poysha) {
  if (poysha === null || poysha === undefined) return '0.00 BDT';
  const bdt = poysha / 100;
  return `${bdt.toFixed(2)} BDT`;
}

module.exports = {
  calculateFare,
  formatFare
};
