import { colors, radius, spacing, type DriverOrder } from "@vola/shared";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { formatMoney, formatTime } from "@/lib/format";
import { AppText } from "./AppText";
import { PreparationChip } from "./PreparationChip";

interface OrderCardProps {
  order: DriverOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint="Abre el detalle de la orden"
      onPress={() => router.push(`/orders/${order.id}`)}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.header}>
        <View style={styles.title}>
          <AppText variant="titulo3" numberOfLines={1}>
            Orden #{order.id}
          </AppText>
          <AppText variant="pequeno" tone="tintaSuave" numberOfLines={1}>
            {order.customerName}
          </AppText>
        </View>
        <PreparationChip status={order.preparationStatus} />
      </View>

      <View style={styles.divider} />

      <AppText variant="pequeno" numberOfLines={1}>
        {order.merchantName} · {order.branchName}
      </AppText>
      <View style={styles.footer}>
        <AppText variant="pequeno" style={styles.total}>
          {formatMoney(order.total, order.currency)}
        </AppText>
        <AppText variant="pequeno" tone="tintaSuave">
          Asignada a las {formatTime(order.assignedAt)}
        </AppText>
      </View>
    </Pressable>
  );
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
  pressed: { backgroundColor: colors.bruma },
  header: { flexDirection: "row", alignItems: "flex-start", gap: spacing[2] },
  title: { flex: 1 },
  divider: { height: 1, backgroundColor: colors.linea },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  total: { fontFamily: "Outfit_600SemiBold" },
});
