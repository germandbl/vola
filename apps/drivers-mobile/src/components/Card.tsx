import { colors, radius, spacing } from "@vola/shared";
import { StyleSheet, View, type ViewProps } from "react-native";

export function Card({ style, ...props }: ViewProps) {
  return <View style={[styles.card, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    gap: spacing[2],
    padding: spacing[4],
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.linea,
    backgroundColor: colors.blanco,
  },
});
