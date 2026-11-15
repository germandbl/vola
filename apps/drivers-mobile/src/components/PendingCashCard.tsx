import Feather from "@expo/vector-icons/Feather";
import { SettlementReceiver, colors, spacing, type DriverPendingCash } from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { formatMoney } from "@/lib/format";
import { AppText } from "./AppText";
import { Card } from "./Card";

const ICON_SIZE = 20;

const RECEIVER_INSTRUCTION: Record<SettlementReceiver, string> = {
  [SettlementReceiver.Platform]: "Entregalo a Volá!",
  [SettlementReceiver.Merchant]: "Entregalo a tu comercio",
};

function describeOrderCount(orderCount: number): string {
  if (orderCount === 1) return "1 orden";
  return `${orderCount} órdenes`;
}

interface PendingCashCardProps {
  pendingCash: DriverPendingCash;
}

export function PendingCashCard({ pendingCash }: PendingCashCardProps) {
  const hasPendingCash = pendingCash.orderCount > 0;

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Feather name="dollar-sign" size={ICON_SIZE} color={colors.tinta} />
        <AppText variant="titulo3">Efectivo por liquidar</AppText>
      </View>
      {hasPendingCash ? (
        <>
          <AppText variant="titulo2">{formatMoney(pendingCash.amount, pendingCash.currency)}</AppText>
          <AppText variant="pequeno" tone="tintaSuave">
            {describeOrderCount(pendingCash.orderCount)} · {RECEIVER_INSTRUCTION[pendingCash.receiver]}
          </AppText>
        </>
      ) : (
        <AppText tone="tintaSuave">No tenés efectivo por liquidar.</AppText>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing[2] },
  header: { flexDirection: "row", alignItems: "center", gap: spacing[2] },
});
