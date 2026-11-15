import { colors, spacing } from "@vola/shared";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { AppText } from "@/components/AppText";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderCard } from "@/components/OrderCard";
import { RefreshCountdownBar } from "@/components/RefreshCountdownBar";
import { ASSIGNED_ORDERS_INTERVAL_MS, useAssignedOrders } from "@/hooks/use-assigned-orders";

function EmptyOrders() {
  return (
    <View style={styles.empty}>
      <AppText variant="titulo3">No tenés órdenes asignadas</AppText>
      <AppText tone="tintaSuave" style={styles.emptyText}>
        Cuando te asignen una la vas a ver acá. Para recibirlas, marcate disponible en Mi cuenta.
      </AppText>
    </View>
  );
}

export default function OrdersScreen() {
  const assignedOrders = useAssignedOrders();
  const { orders } = assignedOrders;

  return (
    <View style={styles.screen}>
      <RefreshCountdownBar cycle={assignedOrders.cycle} durationMs={ASSIGNED_ORDERS_INTERVAL_MS} />
      <FlatList
        data={orders ?? []}
        keyExtractor={(order) => order.id.toString()}
        renderItem={({ item }) => <OrderCard order={item} />}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={assignedOrders.isRefreshing}
            onRefresh={assignedOrders.refresh}
            tintColor={colors.tinta}
          />
        }
        ListHeaderComponent={
          assignedOrders.error ? <ErrorMessage message={assignedOrders.error} /> : undefined
        }
        ListEmptyComponent={
          orders === null ? <ActivityIndicator color={colors.tinta} /> : <EmptyOrders />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  // flexGrow deja centrar el mensaje de "sin órdenes" en el alto de la pantalla.
  content: { flexGrow: 1, gap: spacing[4], padding: spacing[4] },
  empty: { flex: 1, justifyContent: "center", alignItems: "center", gap: spacing[2] },
  emptyText: { textAlign: "center" },
});
