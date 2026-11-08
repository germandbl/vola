// Se distingue de un error del API: sin conexión, un motorista con sesión guardada puede seguir dentro.
export class ApiUnreachableError extends Error {}

function getApiUrl(path: string): string {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error("EXPO_PUBLIC_API_URL is not defined. Add it to apps/drivers-mobile/.env.local");
  }
  return `${apiUrl}${path}`;
}

interface ApiRequest {
  method?: "GET" | "POST" | "PUT";
  token?: string;
  body?: unknown;
}

export async function fetchApi(path: string, request: ApiRequest = {}): Promise<Response> {
  const headers: Record<string, string> = {};
  if (request.token) headers.Authorization = `Bearer ${request.token}`;
  if (request.body) headers["Content-Type"] = "application/json";

  try {
    return await fetch(getApiUrl(path), {
      method: request.method ?? "GET",
      headers,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });
  } catch (networkError) {
    throw new ApiUnreachableError(`Could not reach the API at ${path}`, { cause: networkError });
  }
}
