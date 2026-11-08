import Feather from "@expo/vector-icons/Feather";
import {
  PREPARATION_STATUS_LABEL,
  PreparationStatus,
  colors,
  radius,
  spacing,
} from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

const ICON_SIZE = 12;

// DESIGN.md: los estados se distinguen por texto e ícono, no solo por color.
const PREPARATION_STATUS_ICON: Record<PreparationStatus, keyof typeof Feather.glyphMap> = {
  [PreparationStatus.New]: "circle",
  [PreparationStatus.Preparing]: "clock",
  [PreparationStatus.Ready]: "check-circle",
};

interface PreparationChipProps {
  status: PreparationStatus;
}

// El motorista ve el avance del comercio: si la orden ya está lista para recoger.
export function PreparationChip({ status }: PreparationChipProps) {
  return (
    <View style={styles.chip}>
      <Feather name={PREPARATION_STATUS_ICON[status]} size={ICON_SIZE} color={colors.tinta} />
      <AppText variant="etiqueta">{PREPARATION_STATUS_LABEL[status]}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing[1],
    paddingVertical: spacing[1],
    paddingHorizontal: spacing[2],
    borderRadius: radius.pill,
    backgroundColor: colors.nube,
  },
});
