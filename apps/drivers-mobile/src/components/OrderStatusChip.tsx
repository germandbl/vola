import Feather from "@expo/vector-icons/Feather";
import { ORDER_STATUS_LABEL, OrderStatus, colors, radius, spacing } from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

const ICON_SIZE = 12;

// DESIGN.md: los estados se distinguen por texto e ícono, no solo por color.
const ORDER_STATUS_ICON: Record<OrderStatus, keyof typeof Feather.glyphMap> = {
  [OrderStatus.New]: "circle",
  [OrderStatus.Preparing]: "clock",
  [OrderStatus.HeadingToBranch]: "corner-up-right",
  [OrderStatus.AtBranch]: "shopping-bag",
  [OrderStatus.OnTheWay]: "navigation",
  [OrderStatus.Delivered]: "check-circle",
  [OrderStatus.Cancelled]: "x-circle",
};

interface OrderStatusChipProps {
  status: OrderStatus;
}

export function OrderStatusChip({ status }: OrderStatusChipProps) {
  return (
    <View style={styles.chip}>
      <Feather name={ORDER_STATUS_ICON[status]} size={ICON_SIZE} color={colors.tinta} />
      <AppText variant="etiqueta">{ORDER_STATUS_LABEL[status]}</AppText>
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
