import "server-only";
import { getApiUrl } from "./api-url";
import { getSessionToken } from "./session-cookie";

export async function fetchWithSession(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const token = await getSessionToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");
  return fetch(getApiUrl(path), { ...init, headers });
}
