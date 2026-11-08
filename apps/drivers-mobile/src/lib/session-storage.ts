import { authUserSchema, type AuthUser } from "@vola/shared";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { z } from "zod";

const SESSION_KEY = "vola_session";

const storedSessionSchema = z.object({ token: z.string(), user: authUserSchema });

export interface Session {
  token: string;
  user: AuthUser;
}

// SecureStore no existe en web; ahí basta localStorage para probar la app en el navegador.
async function readValue(): Promise<string | null> {
  if (Platform.OS === "web") return localStorage.getItem(SESSION_KEY);
  return SecureStore.getItemAsync(SESSION_KEY);
}

export async function readStoredSession(): Promise<Session | null> {
  const value = await readValue();
  if (value === null) return null;
  const result = storedSessionSchema.safeParse(JSON.parse(value));
  if (!result.success) {
    await deleteStoredSession();
    return null;
  }
  return result.data;
}

export async function saveSession(session: Session): Promise<void> {
  const value = JSON.stringify(session);
  if (Platform.OS === "web") {
    localStorage.setItem(SESSION_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(SESSION_KEY, value);
}

export async function deleteStoredSession(): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(SESSION_KEY);
    return;
  }
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
