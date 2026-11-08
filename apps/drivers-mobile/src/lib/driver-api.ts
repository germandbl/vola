import { driverProfileSchema, type DriverProfile } from "@vola/shared";
import { fetchApi } from "./api";

export async function requestDriverProfile(token: string): Promise<DriverProfile> {
  const response = await fetchApi("/drivers/me", { token });
  if (!response.ok) {
    throw new Error(`GET /drivers/me failed with status ${response.status}`);
  }
  return driverProfileSchema.parse(await response.json());
}

export async function requestUpdateAvailability(
  token: string,
  isAvailable: boolean,
): Promise<DriverProfile> {
  const response = await fetchApi("/drivers/me/availability", {
    method: "PUT",
    token,
    body: { isAvailable },
  });
  if (!response.ok) {
    throw new Error(`PUT /drivers/me/availability failed with status ${response.status}`);
  }
  return driverProfileSchema.parse(await response.json());
}
