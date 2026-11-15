import { useEffect, useRef, useState } from "react";

// El pin se desliza hacia la nueva ubicación en vez de saltar.
const ANIMATION_DURATION_MS = 1000;

function interpolate(from: number, to: number, progress: number): number {
  return from + (to - from) * progress;
}

export function useAnimatedPosition(target: google.maps.LatLngLiteral): google.maps.LatLngLiteral {
  const [position, setPosition] = useState(target);
  const positionRef = useRef(target);

  useEffect(() => {
    const start = positionRef.current;
    const startedAt = performance.now();
    let frameId = 0;

    function moveTowardTarget(now: number) {
      const progress = Math.min((now - startedAt) / ANIMATION_DURATION_MS, 1);
      const next = {
        lat: interpolate(start.lat, target.lat, progress),
        lng: interpolate(start.lng, target.lng, progress),
      };
      positionRef.current = next;
      setPosition(next);
      if (progress < 1) frameId = requestAnimationFrame(moveTowardTarget);
    }

    frameId = requestAnimationFrame(moveTowardTarget);
    return () => cancelAnimationFrame(frameId);
  }, [target.lat, target.lng]);

  return position;
}
