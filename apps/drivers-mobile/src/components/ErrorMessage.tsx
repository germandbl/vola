import { colors, radius, spacing } from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <View accessibilityRole="alert" style={styles.box}>
      <AppText variant="pequeno" tone="error">
        {message}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    padding: spacing[4],
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.error,
    backgroundColor: colors.blanco,
  },
});
