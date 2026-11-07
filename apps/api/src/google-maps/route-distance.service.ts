import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { z } from 'zod';

const COMPUTE_ROUTES_URL =
  'https://routes.googleapis.com/directions/v2:computeRoutes';
const METERS_PER_KM = 1000;
const HUNDREDTHS_PER_UNIT = 100;

const computeRoutesResponseSchema = z.object({
  routes: z.array(z.object({ distanceMeters: z.number() })).optional(),
});

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Google rechaza cualquier campo extra en latLng, así que se copian solo la latitud y la longitud.
function toWaypoint({ latitude, longitude }: Coordinates) {
  return { location: { latLng: { latitude, longitude } } };
}

@Injectable()
export class RouteDistanceService {
  private readonly logger = new Logger(RouteDistanceService.name);

  // Devuelve null cuando Google no encuentra una ruta por calle entre los dos puntos.
  async findDrivingDistanceKm(
    origin: Coordinates,
    destination: Coordinates,
  ): Promise<number | null> {
    const response = await fetch(COMPUTE_ROUTES_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.getApiKey(),
        'X-Goog-FieldMask': 'routes.distanceMeters',
      },
      body: JSON.stringify({
        origin: toWaypoint(origin),
        destination: toWaypoint(destination),
        travelMode: 'DRIVE',
      }),
    });
    if (!response.ok) {
      // Nest no registra las excepciones HTTP; sin este log no se ve por qué Google rechazó la ruta.
      const message = `Google Routes API answered ${response.status} for ${JSON.stringify({ origin, destination })}: ${await response.text()}`;
      this.logger.error(message);
      throw new BadGatewayException(message);
    }

    const { routes } = computeRoutesResponseSchema.parse(await response.json());
    const route = routes?.[0];
    if (!route) return null;
    const distanceKm = route.distanceMeters / METERS_PER_KM;
    return Math.round(distanceKm * HUNDREDTHS_PER_UNIT) / HUNDREDTHS_PER_UNIT;
  }

  private getApiKey(): string {
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY;
    if (!apiKey) {
      throw new Error(
        'GOOGLE_MAPS_SERVER_API_KEY is not defined. Add it to apps/api/.env',
      );
    }
    return apiKey;
  }
}
