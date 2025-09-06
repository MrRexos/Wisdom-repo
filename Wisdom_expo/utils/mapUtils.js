export const getRegionForRadius = (latitude, longitude, radiusKm, marginFactor = 1.2) => {
  const earthKmPerDegLat = 111; // approx
  const latDelta = Math.max((radiusKm / earthKmPerDegLat) * 2 * marginFactor, 0.05);
  const lonDegreeKm = earthKmPerDegLat * Math.cos(latitude * Math.PI / 180);
  const lonDelta = Math.max((radiusKm / lonDegreeKm) * 2 * marginFactor, 0.03);
  return {
    latitude,
    longitude,
    latitudeDelta: latDelta,
    longitudeDelta: lonDelta,
  };
};
