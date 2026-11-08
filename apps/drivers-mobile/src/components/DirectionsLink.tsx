import Feather from "@expo/vector-icons/Feather";
import { colors, spacing } from "@vola/shared";
import { Pressable, StyleSheet } from "react-native";
import { openDirections } from "@/lib/external-links";
import { AppText } from "./AppText";

const ICON_SIZE = 18;

interface DirectionsLinkProps {
  address: string;
  latitude: number;
  longitude: number;
}

export function DirectionsLink({ address, latitude, longitude }: DirectionsLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint="Abre el mapa con cómo llegar"
      onPress={() => openDirections(latitude, longitude)}
      style={styles.row}
    >
      <Feather name="map-pin" size={ICON_SIZE} color={colors.accion} />
      <AppText tone="accion" style={styles.address}>
        {address}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing[2] },
  address: { flex: 1, textDecorationLine: "underline" },
});
