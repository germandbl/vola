import Feather from "@expo/vector-icons/Feather";
import { colors, spacing, type DriverOrder } from "@vola/shared";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { formatMoney } from "@/lib/format";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { DirectionsLink } from "./DirectionsLink";
import { OrderStatusChip } from "./OrderStatusChip";
import { PhoneLink } from "./PhoneLink";

const ICON_SIZE = 18;

interface OrderCardProps {
  order: DriverOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <AppText variant="titulo3">Orden #{order.id}</AppText>
        <OrderStatusChip status={order.status} />
      </View>
      <AppText variant="pequeno" tone="tintaSuave">
        Recogé en {order.merchantName} · {order.branchName}
      </AppText>

      <View style={styles.section}>
        <AppText>{order.customerName}</AppText>
        <PhoneLink phoneNumber={order.customerPhone} />
        <DirectionsLink
          address={order.deliveryAddress}
          latitude={order.deliveryLatitude}
          longitude={order.deliveryLongitude}
        />
      </View>

      <View style={styles.totalRow}>
        <AppText tone="tintaSuave">Total a cobrar</AppText>
        <AppText variant="titulo3">{formatMoney(order.total, order.currency)}</AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(`/orders/${order.id}`)}
        style={styles.detailButton}
      >
        <AppText tone="accion">Ver detalle</AppText>
        <Feather name="chevron-right" size={ICON_SIZE} color={colors.accion} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[4] },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing[2],
  },
  section: { gap: spacing[2] },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.linea,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: spacing[1],
  },
});
