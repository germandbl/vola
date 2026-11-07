export interface Coordinates {
  latitude: number;
  longitude: number;
}

const TEGUCIGALPA: Coordinates = { latitude: 14.072275, longitude: -87.192136 };

// Centro inicial del mapa: la capital del país del cliente, para no arrancar a cientos de km.
const CAPITAL_BY_COUNTRY_CODE: Record<string, Coordinates> = {
  GT: { latitude: 14.634915, longitude: -90.506882 },
  BZ: { latitude: 17.251011, longitude: -88.75902 },
  HN: TEGUCIGALPA,
  SV: { latitude: 13.69294, longitude: -89.218191 },
  NI: { latitude: 12.114993, longitude: -86.236174 },
  CR: { latitude: 9.928069, longitude: -84.090725 },
  PA: { latitude: 8.982379, longitude: -79.51987 },
};

export function getDefaultMapCenter(countryCode: string | null): Coordinates {
  if (countryCode === null) return TEGUCIGALPA;
  return CAPITAL_BY_COUNTRY_CODE[countryCode] ?? TEGUCIGALPA;
}
