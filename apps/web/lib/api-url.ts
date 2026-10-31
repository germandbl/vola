import "server-only";

export function getApiUrl(path: string): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL is not defined. Add it to apps/web/.env.local");
  }
  return `${apiUrl}${path}`;
}
