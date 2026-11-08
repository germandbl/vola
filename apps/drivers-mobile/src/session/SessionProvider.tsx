import { RoleName, type LoginRequest } from "@vola/shared";
import { createContext, use, useEffect, useState, type ReactNode } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { SignInError, requestCurrentUser, requestLogin, requestLogout } from "@/lib/auth-api";
import {
  deleteStoredSession,
  readStoredSession,
  saveSession,
  type Session,
} from "@/lib/session-storage";

interface SessionContextValue {
  session: Session | null;
  isLoading: boolean;
  signIn: (credentials: LoginRequest) => Promise<void>;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSession(): SessionContextValue {
  const value = use(SessionContext);
  if (!value) {
    throw new Error("useSession must be used inside <SessionProvider />");
  }
  return value;
}

// Confirma con el API que la sesión guardada sigue viva y trae los datos del usuario al día.
async function verifyStoredSession(storedSession: Session): Promise<Session | null> {
  try {
    const user = await requestCurrentUser(storedSession.token);
    if (user === null) {
      await deleteStoredSession();
      return null;
    }
    const refreshedSession = { token: storedSession.token, user };
    await saveSession(refreshedSession);
    return refreshedSession;
  } catch (error) {
    // Sin conexión no se puede confirmar, pero el motorista sigue dentro con lo guardado.
    if (error instanceof ApiUnreachableError) return storedSession;
    throw error;
  }
}

interface SessionProviderProps {
  children: ReactNode;
}

export function SessionProvider({ children }: SessionProviderProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      const storedSession = await readStoredSession();
      setSession(storedSession);
      setIsLoading(false);
      if (storedSession) setSession(await verifyStoredSession(storedSession));
    }
    restoreSession();
  }, []);

  async function signIn(credentials: LoginRequest) {
    const { token, user } = await requestLogin(credentials);
    if (user.role !== RoleName.Driver) {
      await requestLogout(token);
      throw new SignInError("Esta app es solo para motoristas. Para tu comercio, entrá al panel web.");
    }
    const newSession = { token, user };
    await saveSession(newSession);
    setSession(newSession);
  }

  async function signOut() {
    if (!session) return;
    await requestLogout(session.token);
    await deleteStoredSession();
    setSession(null);
  }

  return <SessionContext value={{ session, isLoading, signIn, signOut }}>{children}</SessionContext>;
}
