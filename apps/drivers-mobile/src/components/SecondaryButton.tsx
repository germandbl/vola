import { colors, radius, spacing } from "@vola/shared";
import { ActivityIndicator, Pressable, StyleSheet } from "react-native";
import { AppText } from "./AppText";

const BUTTON_HEIGHT = 48;

interface SecondaryButtonProps {
  label: string;
  isLoading?: boolean;
  onPress: () => void;
}

export function SecondaryButton({ label, isLoading = false, onPress }: SecondaryButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isLoading, busy: isLoading }}
      disabled={isLoading}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && { backgroundColor: colors.bruma }]}
    >
      {isLoading && <ActivityIndicator color={colors.tinta} />}
      <AppText variant="cuerpo" style={styles.label}>
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
    borderWidth: 1,
    borderColor: colors.borde,
    backgroundColor: colors.blanco,
  },
  label: { fontFamily: "Outfit_600SemiBold" },
});
