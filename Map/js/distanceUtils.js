// distanceUtils.js
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }
  
  function haversineDistance(point1, point2) {
    const R = 6371000; // Earth's radius in meters
    const lat1 = toRadians(point1.lat);
    const lat2 = toRadians(point2.lat);
    const deltaLat = toRadians(point2.lat - point1.lat);
    const deltaLng = toRadians(point2.lng - point1.lng);
  
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
    const distanceInMeters = R * c;
    const distanceInFeet = distanceInMeters * 3.28084; // Convert meters to feet
  
    return distanceInFeet;
  }
  
  export { toRadians, haversineDistance };