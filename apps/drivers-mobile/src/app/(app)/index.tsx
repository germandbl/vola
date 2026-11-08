import { colors, spacing } from "@vola/shared";
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { OrderCard } from "@/components/OrderCard";
import { useAssignedOrders } from "@/hooks/use-assigned-orders";

function EmptyOrders() {
  return (
    <Card>
      <AppText variant="titulo3">No tenés órdenes asignadas</AppText>
      <AppText tone="tintaSuave">
        Cuando te asignen una la vas a ver acá. Para recibirlas, marcate disponible en Perfil.
      </AppText>
    </Card>
  );
}

export default function OrdersScreen() {
  const assignedOrders = useAssignedOrders();
  const { orders } = assignedOrders;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
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
          <View style={styles.header}>
            <AppText variant="titulo1">Tus órdenes</AppText>
            {assignedOrders.error && <ErrorMessage message={assignedOrders.error} />}
          </View>
        }
        ListEmptyComponent={
          orders === null ? <ActivityIndicator color={colors.tinta} /> : <EmptyOrders />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: spacing[4], padding: spacing[4] },
  header: { gap: spacing[4] },
});
