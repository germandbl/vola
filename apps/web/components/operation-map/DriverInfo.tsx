import { ORDER_STATUS_LABEL, type DriverMapLocation } from "@vola/shared";
import { formatTime } from "@/lib/labels";

interface DriverInfoProps {
  driver: DriverMapLocation;
  showOwner: boolean;
}

export function DriverInfo({ driver, showOwner }: DriverInfoProps) {
  const { currentOrder } = driver;
  return (
    <div className="flex min-w-48 flex-col gap-1 text-sm text-tinta">
      {showOwner && <p className="text-muted-foreground">{driver.ownerName}</p>}
      <p>{driver.isAvailable ? "Disponible" : "No disponible"}</p>
      {currentOrder ? (
        <p className="font-semibold">
          Orden #{currentOrder.id} · {ORDER_STATUS_LABEL[currentOrder.status]} · {currentOrder.merchantName}
        </p>
      ) : (
        <p>Sin orden en curso</p>
      )}
      <p className="text-muted-foreground">Ubicación de las {formatTime(driver.recordedAt)}</p>
    </div>
  );
}
