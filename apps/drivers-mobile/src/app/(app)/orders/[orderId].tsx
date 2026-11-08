import { ORDER_STATUS_LABEL, colors, findDriverNextStatus, spacing } from "@vola/shared";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { MapPreview } from "@/components/MapPreview";
import { OrderStatusActions } from "@/components/OrderStatusActions";
import { SecondaryButton } from "@/components/SecondaryButton";
import { StatTile } from "@/components/StatTile";
import { useOrderDetail } from "@/hooks/use-order-detail";
import { callPhone, openDirections, openWhatsApp } from "@/lib/external-links";
import { formatMoney, formatTime } from "@/lib/format";

export default function OrderDetailScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const orderDetail = useOrderDetail(Number(orderId));
  const { order } = orderDetail;

  if (!order) {
    return (
      <View style={styles.centered}>
        {orderDetail.error ? (
          <ErrorMessage message={orderDetail.error} />
        ) : (
          <ActivityIndicator color={colors.tinta} />
        )}
      </View>
    );
  }

  const isActive = findDriverNextStatus(order.status) !== null;
  const showDirections = () => openDirections(order.deliveryLatitude, order.deliveryLongitude);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <MapPreview
        latitude={order.deliveryLatitude}
        longitude={order.deliveryLongitude}
        onPress={showDirections}
      />
      <AppText variant="titulo2" style={styles.centeredText}>
        Orden #{order.id}
      </AppText>
      {orderDetail.error && <ErrorMessage message={orderDetail.error} />}

      <Card style={styles.statusCard}>
        <View style={styles.tiles}>
          <StatTile icon="clock" label="Estado de la orden" tone="nube">
            {ORDER_STATUS_LABEL[order.status]}
          </StatTile>
          <StatTile icon="dollar-sign" label="Total a cobrar" tone="bruma">
            {formatMoney(order.total, order.currency)}
          </StatTile>
        </View>
        <AppText variant="pequeno" tone="tintaSuave" style={styles.centeredText}>
          Último cambio a las {formatTime(order.statusChangedAt)}
        </AppText>
        {order.cancellationReason && (
          <AppText tone="tintaSuave" style={styles.centeredText}>
            Motivo: {order.cancellationReason}
          </AppText>
        )}
        <OrderStatusActions
          status={order.status}
          isChangingStatus={orderDetail.isChangingStatus}
          cancellationReasonError={orderDetail.cancellationReasonError}
          onAdvance={orderDetail.advance}
          onCancel={orderDetail.cancel}
        />
      </Card>

      <Card style={styles.detailCard}>
        <View style={styles.section}>
          <AppText variant="etiqueta" tone="tintaSuave">
            Recogé en
          </AppText>
          <AppText variant="titulo3">
            {order.merchantName} · {order.branchName}
          </AppText>
          <AppText variant="pequeno" tone="tintaSuave">
            {order.branchAddress}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <AppText variant="etiqueta" tone="tintaSuave">
            Entregá a
          </AppText>
          <AppText variant="titulo3">{order.customerName}</AppText>
          <AppText variant="pequeno">{order.customerPhone}</AppText>
          <AppText variant="pequeno" tone="tintaSuave">
            {order.deliveryAddress}
          </AppText>
        </View>
        <View style={styles.divider} />
        <View style={styles.section}>
          <AppText variant="etiqueta" tone="tintaSuave">
            Productos
          </AppText>
          {order.items.map((item, index) => (
            <AppText key={index}>
              {item.quantity} × {item.name}
            </AppText>
          ))}
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
          <AppText tone="tintaSuave">Total a cobrar</AppText>
          <AppText variant="titulo3">{formatMoney(order.total, order.currency)}</AppText>
        </View>
      </Card>

      {isActive && (
        <View style={styles.contactActions}>
          <SecondaryButton label="Abrir en Google Maps" icon="map" onPress={showDirections} />
          <SecondaryButton
            label="Escribir por WhatsApp al cliente"
            icon="message-circle"
            onPress={() => openWhatsApp(order.customerPhone)}
          />
          <SecondaryButton
            label="Llamar al cliente"
            icon="phone"
            onPress={() => callPhone(order.customerPhone)}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing[4], padding: spacing[4], paddingBottom: spacing[10] },
  centered: { flex: 1, justifyContent: "center", padding: spacing[4] },
  centeredText: { textAlign: "center" },
  statusCard: { gap: spacing[4] },
  tiles: { flexDirection: "row", gap: spacing[2] },
  detailCard: { gap: spacing[4] },
  section: { gap: spacing[1] },
  divider: { height: 1, backgroundColor: colors.linea },
  totalRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  contactActions: { gap: spacing[2] },
});
