export type LocationPermissionStatus = "granted" | "denied" | "undetermined";

export interface LocationSharingOptions {
  apiUrl: string;
  token: string;
  intervalSeconds: number;
}
