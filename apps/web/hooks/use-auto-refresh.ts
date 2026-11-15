import { useEffect, useEffectEvent, useState } from "react";

// Cada actualización, automática o a mano, suma un ciclo: la cuenta regresiva vuelve a empezar desde ahí.
export function useAutoRefresh(intervalMs: number, refresh: () => void) {
  const [cycle, setCycle] = useState(0);

  function refreshNow() {
    refresh();
    setCycle((current) => current + 1);
  }

  // Los efectos usan siempre la versión más reciente de refresh sin reiniciar el temporizador.
  const runRefresh = useEffectEvent(refreshNow);

  useEffect(() => {
    // Con la pestaña oculta no se consulta: la barra queda llena y se actualiza al volver.
    const timeoutId = setTimeout(() => {
      if (document.visibilityState === "visible") runRefresh();
    }, intervalMs);
    return () => clearTimeout(timeoutId);
  }, [cycle, intervalMs]);

  useEffect(() => {
    function refreshOnReturn() {
      if (document.visibilityState === "visible") runRefresh();
    }
    document.addEventListener("visibilitychange", refreshOnReturn);
    return () => document.removeEventListener("visibilitychange", refreshOnReturn);
  }, []);

  return { cycle, refreshNow };
}
