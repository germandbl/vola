import { colors, spacing } from "@vola/shared";
import { Stack, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { DirectionsLink } from "@/components/DirectionsLink";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderStatusActions } from "@/components/OrderStatusActions";
import { OrderStatusChip } from "@/components/OrderStatusChip";
import { PhoneLink } from "@/components/PhoneLink";
import { useOrderDetail } from "@/hooks/use-order-detail";
import { formatMoney, formatTime } from "@/lib/format";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderDetail = useOrderDetail(Number(orderId));
  const { order } = orderDetail;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: `Orden #${orderId}` }} />
      {orderDetail.error && <ErrorMessage message={orderDetail.error} />}
      {!order && !orderDetail.error && <ActivityIndicator color={colors.tinta} />}
      {order && (
        <>
          <View style={styles.status}>
            <OrderStatusChip status={order.status} />
            <AppText variant="pequeno" tone="tintaSuave">
              Desde las {formatTime(order.statusChangedAt)}
            </AppText>
          </View>
          {order.cancellationReason && (
            <AppText tone="tintaSuave">Motivo: {order.cancellationReason}</AppText>
          )}

          <Card>
            <AppText variant="etiqueta" tone="tintaSuave">
              Recogé en
            </AppText>
            <AppText variant="titulo3">
              {order.merchantName} · {order.branchName}
            </AppText>
            <AppText tone="tintaSuave">{order.branchAddress}</AppText>
          </Card>

          <Card>
            <AppText variant="etiqueta" tone="tintaSuave">
              Entregá a
            </AppText>
            <AppText variant="titulo3">{order.customerName}</AppText>
            <PhoneLink phoneNumber={order.customerPhone} />
            <DirectionsLink
              address={order.deliveryAddress}
              latitude={order.deliveryLatitude}
              longitude={order.deliveryLongitude}
            />
          </Card>

          <Card>
            <AppText variant="etiqueta" tone="tintaSuave">
              Productos
            </AppText>
            {order.items.map((item, index) => (
              <AppText key={index}>
                {item.quantity} × {item.name}
              </AppText>
            ))}
            <View style={styles.totalRow}>
              <AppText tone="tintaSuave">Total a cobrar</AppText>
              <AppText variant="titulo3">{formatMoney(order.total, order.currency)}</AppText>
            </View>
          </Card>

          <OrderStatusActions
            status={order.status}
            isChangingStatus={orderDetail.isChangingStatus}
            cancellationReasonError={orderDetail.cancellationReasonError}
            onAdvance={orderDetail.advance}
            onCancel={orderDetail.cancel}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[4], padding: spacing[4] },
  status: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
  totalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: spacing[2],
  },
});
