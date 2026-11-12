import { spacing } from "@vola/shared";
import { Linking, StyleSheet, View } from "react-native";
import { ErrorMessage } from "./ErrorMessage";
import { SecondaryButton } from "./SecondaryButton";

export function LocationPermissionNotice() {
  return (
    <View style={styles.notice}>
      <ErrorMessage message="Necesitamos tu ubicación para asignarte órdenes. Activala en Ajustes." />
      <SecondaryButton label="Abrir ajustes" icon="settings" onPress={Linking.openSettings} />
    </View>
  );
}

const styles = StyleSheet.create({
  notice: { gap: spacing[2] },
});
