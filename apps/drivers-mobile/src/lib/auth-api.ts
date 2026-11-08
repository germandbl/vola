import {
  authUserSchema,
  loginResponseSchema,
  type AuthUser,
  type LoginRequest,
  type LoginResponse,
} from "@vola/shared";
import { fetchApi } from "./api";

const HTTP_UNAUTHORIZED = 401;

// El mensaje de este error se muestra tal cual en la pantalla de inicio de sesión.
export class SignInError extends Error {}

export async function requestLogin(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await fetchApi("/auth/login", { method: "POST", body: credentials });
  if (response.status === HTTP_UNAUTHORIZED) {
    throw new SignInError("El email o la contraseña no coinciden. Probá de nuevo.");
  }
  if (!response.ok) {
    throw new Error(`POST /auth/login failed with status ${response.status}`);
  }
  return loginResponseSchema.parse(await response.json());
}

// Devuelve null cuando la sesión ya no es válida: venció o se cerró en otro lado.
export async function requestCurrentUser(token: string): Promise<AuthUser | null> {
  const response = await fetchApi("/auth/me", { token });
  if (response.status === HTTP_UNAUTHORIZED) return null;
  if (!response.ok) {
    throw new Error(`GET /auth/me failed with status ${response.status}`);
  }
  return authUserSchema.parse(await response.json());
}

export async function requestLogout(token: string): Promise<void> {
  const response = await fetchApi("/auth/logout", { method: "POST", token });
  // Si la sesión ya no existe en el API, cerrarla otra vez no es un error.
  if (!response.ok && response.status !== HTTP_UNAUTHORIZED) {
    throw new Error(`POST /auth/logout failed with status ${response.status}`);
  }
}
