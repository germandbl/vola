import "server-only";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "vola_session";

// Igual que la duración de la sesión en la API, para que la cookie no venza antes que la sesión.
const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}

export async function saveSessionToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function deleteSessionToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
