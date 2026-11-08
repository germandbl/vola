import { useState } from "react";
import { ApiUnreachableError } from "@/lib/api";
import { useSession } from "@/session/SessionProvider";

export function useSignOut() {
  const { signOut } = useSession();
  const [error, setError] = useState<string>();
  const [isPending, setIsPending] = useState(false);

  async function confirmSignOut() {
    setError(undefined);
    setIsPending(true);
    try {
      await signOut();
    } catch (signOutError) {
      if (!(signOutError instanceof ApiUnreachableError)) throw signOutError;
      setError("No pudimos cerrar sesión sin conexión. Revisá tu internet y probá de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return { error, isPending, confirmSignOut };
}
