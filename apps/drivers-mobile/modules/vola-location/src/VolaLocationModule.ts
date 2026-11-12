import { NativeModule, requireNativeModule } from "expo";
import type { LocationPermissionStatus, LocationSharingOptions } from "./VolaLocation.types";

declare class VolaLocationModule extends NativeModule {
  getPermissionStatusAsync(): Promise<LocationPermissionStatus>;
  requestPermissionAsync(): Promise<LocationPermissionStatus>;
  startSharingAsync(options: LocationSharingOptions): Promise<void>;
  stopSharingAsync(): Promise<void>;
  isSharing(): boolean;
}

export default requireNativeModule<VolaLocationModule>("VolaLocation");
