import { OrderStatus, canDriverCancel, findDriverNextStatus, spacing } from "@vola/shared";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { Card } from "./Card";
import { PrimaryButton } from "./PrimaryButton";
import { SecondaryButton } from "./SecondaryButton";
import { TextField } from "./TextField";

// Lo que dice el botón según el paso al que lleva la orden.
const NEXT_STATUS_ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.HeadingToBranch]: "Salir a la sucursal",
  [OrderStatus.AtBranch]: "Llegué a la sucursal",
  [OrderStatus.OnTheWay]: "Salir a entregar",
  [OrderStatus.Delivered]: "Marcar entregada",
};

interface OrderStatusActionsProps {
  status: OrderStatus;
  isChangingStatus: boolean;
  cancellationReasonError?: string;
  onAdvance: () => void;
  onCancel: (cancellationReason: string) => void;
}

export function OrderStatusActions({
  status,
  isChangingStatus,
  cancellationReasonError,
  onAdvance,
  onCancel,
}: OrderStatusActionsProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const nextStatus = findDriverNextStatus(status);
  const nextActionLabel = nextStatus ? NEXT_STATUS_ACTION_LABEL[nextStatus] : undefined;

  if (!nextActionLabel) {
    return (
      <Card>
        <AppText variant="titulo3">Esta orden ya terminó</AppText>
        <AppText tone="tintaSuave">No hay nada más que hacer con ella.</AppText>
      </Card>
    );
  }

  if (isCancelling) {
    return (
      <View style={styles.actions}>
        <TextField
          label="Motivo de la cancelación"
          placeholder="Ej. El cliente no contestó ni estaba en la dirección"
          multiline
          value={cancellationReason}
          onChangeText={setCancellationReason}
          error={cancellationReasonError}
        />
        <PrimaryButton
          label="Confirmar cancelación"
          isLoading={isChangingStatus}
          onPress={() => onCancel(cancellationReason)}
        />
        <SecondaryButton label="Volver" onPress={() => setIsCancelling(false)} />
      </View>
    );
  }

  return (
    <View style={styles.actions}>
      <PrimaryButton label={nextActionLabel} isLoading={isChangingStatus} onPress={onAdvance} />
      {canDriverCancel(status) && (
        <SecondaryButton label="Cancelar orden" onPress={() => setIsCancelling(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing[4] },
});
