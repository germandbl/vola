import VolaLocation from "@/modules/vola-location";
import { getApiBaseUrl } from "./api";

const LOCATION_UPDATE_INTERVAL_SECONDS = 30;

// El envío lo hace el módulo nativo y no JavaScript: en segundo plano el sistema suspende JavaScript.
export async function startLocationSharing(token: string): Promise<void> {
  await VolaLocation.startSharingAsync({
    apiUrl: getApiBaseUrl(),
    token,
    intervalSeconds: LOCATION_UPDATE_INTERVAL_SECONDS,
  });
}

export async function stopLocationSharing(): Promise<void> {
  await VolaLocation.stopSharingAsync();
}

export async function hasLocationPermission(): Promise<boolean> {
  const status = await VolaLocation.getPermissionStatusAsync();
  return status === "granted";
}

export async function requestLocationPermission(): Promise<boolean> {
  const status = await VolaLocation.requestPermissionAsync();
  return status === "granted";
}
