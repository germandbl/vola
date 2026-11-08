import { colors, spacing } from "@vola/shared";
import { ActivityIndicator, StyleSheet, Switch, View } from "react-native";
import { AppText } from "./AppText";
import { Card } from "./Card";

interface AvailabilityCardProps {
  isAvailable: boolean;
  isUpdating: boolean;
  onChange: (isAvailable: boolean) => void;
}

// El estado se dice con texto además del switch: DESIGN.md pide no comunicarlo solo con color.
function describeAvailability(isAvailable: boolean): string {
  if (isAvailable) return "Estás disponible. Te pueden asignar órdenes.";
  return "No estás disponible. No te van a asignar órdenes nuevas.";
}

export function AvailabilityCard({ isAvailable, isUpdating, onChange }: AvailabilityCardProps) {
  return (
    <Card style={styles.row}>
      <View style={styles.text}>
        <AppText variant="titulo3">Disponible para recibir órdenes</AppText>
       {/*  <AppText variant="pequeno" tone="tintaSuave">
          {describeAvailability(isAvailable)}
        </AppText> */}
      </View>
      {isUpdating ? (
        <ActivityIndicator color={colors.tinta} />
      ) : (
        <Switch
          accessibilityLabel="Disponible para recibir órdenes"
          value={isAvailable}
          onValueChange={onChange}
          trackColor={{ false: colors.linea, true: colors.tinta }}
          thumbColor={colors.blanco}
          ios_backgroundColor={colors.linea}
        />
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: spacing[4] },
  text: { flex: 1, gap: spacing[1] },
});
