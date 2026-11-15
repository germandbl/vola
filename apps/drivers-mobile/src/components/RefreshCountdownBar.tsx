import { colors, radius, spacing } from "@vola/shared";
import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const BAR_HEIGHT = 3;
const FULL_PROGRESS = 1;

interface RefreshCountdownBarProps {
  cycle: number;
  durationMs: number;
}

// Una línea fina que se llena hasta la próxima actualización; cada ciclo vuelve a empezar desde cero.
export function RefreshCountdownBar({ cycle, durationMs }: RefreshCountdownBarProps) {
  const isReducedMotion = useReducedMotion();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(FULL_PROGRESS, { duration: durationMs, easing: Easing.linear });
  }, [cycle, durationMs, progress]);

  const fillStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  // Con movimiento reducido no se anima: la lista igual se actualiza sola.
  if (isReducedMotion) return null;

  return (
    <View
      style={styles.track}
      accessibilityLabel="Tus órdenes se actualizan solas cada 10 segundos"
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[styles.fill, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: BAR_HEIGHT,
    marginHorizontal: spacing[4],
    marginTop: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: colors.linea,
    overflow: "hidden",
  },
  fill: { height: "100%", borderRadius: radius.pill, backgroundColor: colors.cielo },
});
