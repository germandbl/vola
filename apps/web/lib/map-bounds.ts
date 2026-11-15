// Deja espacio para que los pines, que se dibujan hacia arriba del punto, no queden cortados en el borde.
const BOUNDS_PADDING_PX = 56;

export function findBounds(
  points: google.maps.LatLngLiteral[],
  padding: number | google.maps.Padding = BOUNDS_PADDING_PX,
) {
  const latitudes = points.map((point) => point.lat);
  const longitudes = points.map((point) => point.lng);
  return {
    north: Math.max(...latitudes),
    south: Math.min(...latitudes),
    east: Math.max(...longitudes),
    west: Math.min(...longitudes),
    padding,
  };
}
