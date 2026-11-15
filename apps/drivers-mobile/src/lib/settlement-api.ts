import { driverPendingCashSchema, type DriverPendingCash } from "@vola/shared";
import { fetchApi } from "./api";

export async function requestPendingCash(token: string): Promise<DriverPendingCash> {
  const response = await fetchApi("/settlements/me", { token });
  if (!response.ok) {
    throw new Error(`GET /settlements/me failed with status ${response.status}`);
  }
  return driverPendingCashSchema.parse(await response.json());
}
