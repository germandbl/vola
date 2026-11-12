import type { LocationPermissionStatus } from "./VolaLocation.types";

// En web no hay ubicación en segundo plano; la app web solo sirve para probar pantallas.
export default {
  async getPermissionStatusAsync(): Promise<LocationPermissionStatus> {
    return "denied";
  },
  async requestPermissionAsync(): Promise<LocationPermissionStatus> {
    return "denied";
  },
  async startSharingAsync(): Promise<void> {
    throw new Error("Location sharing is not available on the web");
  },
  async stopSharingAsync(): Promise<void> {},
  isSharing(): boolean {
    return false;
  },
};
