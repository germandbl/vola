import Feather from "@expo/vector-icons/Feather";
import { colors, spacing, type DriverOrder } from "@vola/shared";
import { Pressable, StyleSheet, View } from "react-native";
import { callPhone, openDirections } from "@/lib/external-links";
import { formatMoney } from "@/lib/format";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { OrderStatusChip } from "./OrderStatusChip";

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
        <Pressable
          accessibilityRole="link"
          accessibilityHint="Llama al cliente"
          onPress={() => callPhone(order.customerPhone)}
          style={styles.linkRow}
        >
          <Feather name="phone" size={ICON_SIZE} color={colors.accion} />
          <AppText tone="accion">{order.customerPhone}</AppText>
        </Pressable>
        <Pressable
          accessibilityRole="link"
          accessibilityHint="Abre el mapa con cómo llegar"
          onPress={() => openDirections(order.deliveryLatitude, order.deliveryLongitude)}
          style={styles.linkRow}
        >
          <Feather name="map-pin" size={ICON_SIZE} color={colors.accion} />
          <AppText tone="accion" style={styles.address}>
            {order.deliveryAddress}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.totalRow}>
        <AppText tone="tintaSuave">Total a cobrar</AppText>
        <AppText variant="titulo3">{formatMoney(order.total, order.currency)}</AppText>
      </View>
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
  linkRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing[2] },
  address: { flex: 1, textDecorationLine: "underline" },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: colors.linea,
  },
});
