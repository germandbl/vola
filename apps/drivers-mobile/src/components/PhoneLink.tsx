import Feather from "@expo/vector-icons/Feather";
import { colors, spacing } from "@vola/shared";
import { Pressable, StyleSheet } from "react-native";
import { callPhone } from "@/lib/external-links";
import { AppText } from "./AppText";

const ICON_SIZE = 18;

interface PhoneLinkProps {
  phoneNumber: string;
}

export function PhoneLink({ phoneNumber }: PhoneLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityHint="Llama al cliente"
      onPress={() => callPhone(phoneNumber)}
      style={styles.row}
    >
      <Feather name="phone" size={ICON_SIZE} color={colors.accion} />
      <AppText tone="accion">{phoneNumber}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "flex-start", gap: spacing[2] },
});
