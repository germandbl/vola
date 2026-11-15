// Sin negocios ni paradas de bus: en los mapas de seguimiento solo deben destacar nuestros pines.
export const HIDDEN_PLACES_STYLE: google.maps.MapTypeStyle[] = [
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];
