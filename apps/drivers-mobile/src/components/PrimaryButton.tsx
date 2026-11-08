import { colors, radius, spacing } from "@vola/shared";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { AppText } from "./AppText";

const BUTTON_HEIGHT = 48;
const PRESSED_OPACITY = 0.85;

interface PrimaryButtonProps {
  label: string;
  isLoading?: boolean;
  onPress: () => void;
}

export function PrimaryButton({ label, isLoading = false, onPress }: PrimaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { opacity: PRESSED_OPACITY }]}
    >
      {isLoading && <ActivityIndicator color={colors.blanco} />}
      <AppText variant="cuerpo" tone="blanco" style={styles.label}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: BUTTON_HEIGHT,
    flexDirection: "row",
    gap: spacing[2],
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing[6],
    borderRadius: radius.pill,
    backgroundColor: colors.tinta,
  },
  label: { fontFamily: "Outfit_600SemiBold" },
});
