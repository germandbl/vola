"use server";

import { publicOrderTrackingSchema, type PublicOrderTracking } from "@vola/shared";
import { getApiUrl } from "./api-url";

const HTTP_NOT_FOUND = 404;

// Sin sesión: la página de seguimiento es pública y el código de la URL es lo único que identifica la orden.
// null cuando no hay ninguna orden con ese código.
export async function loadPublicTracking(trackingCode: string): Promise<PublicOrderTracking | null> {
  const response = await fetch(getApiUrl(`/tracking/${encodeURIComponent(trackingCode)}`), {
    cache: "no-store",
  });
  if (response.status === HTTP_NOT_FOUND) return null;
  if (!response.ok) {
    throw new Error(`GET /tracking/${trackingCode} failed with status ${response.status}`);
  }
  return publicOrderTrackingSchema.parse(await response.json());
}
