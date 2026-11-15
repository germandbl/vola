import { OrderStatus, type PublicOrderTracking } from "@vola/shared";
import { Logo } from "@/components/Logo";
import { TrackingProgress } from "./TrackingProgress";

const HEADLINE_BY_STATUS: Record<OrderStatus, string> = {
  [OrderStatus.New]: "Recibimos tu pedido",
  [OrderStatus.Preparing]: "Están preparando tu pedido",
  [OrderStatus.HeadingToBranch]: "Tu motorista va por tu pedido",
  [OrderStatus.AtBranch]: "Tu motorista está recogiendo tu pedido",
  [OrderStatus.OnTheWay]: "Tu motorista va en camino",
  [OrderStatus.Delivered]: "¡Llegó tu pedido!",
  [OrderStatus.Cancelled]: "Este pedido fue cancelado",
};

function findHeadline(tracking: PublicOrderTracking): string {
  if (tracking.status === OrderStatus.OnTheWay && tracking.driverFirstName) {
    return `${tracking.driverFirstName} va en camino`;
  }
  return HEADLINE_BY_STATUS[tracking.status];
}

interface TrackingHeaderProps {
  tracking: PublicOrderTracking;
  hasFailed: boolean;
}

export function TrackingHeader({ tracking, hasFailed }: TrackingHeaderProps) {
  const isCancelled = tracking.status === OrderStatus.Cancelled;

  return (
    <section className="pointer-events-auto mx-auto flex w-full max-w-md flex-col gap-4 rounded-xl border border-linea bg-blanco p-4 shadow-flotante">
      {/* En una fila el logotipo toma el ancho de su proporción; en la columna se estiraba a su ancho real. */}
      <div className="flex">
        <Logo tone="color" size="medio" />
      </div>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-tinta">{findHeadline(tracking)}</h1>
        <p className="text-sm text-tinta-suave">Tu pedido de {tracking.merchantName}</p>
      </div>
      {!isCancelled && <TrackingProgress status={tracking.status} />}
      {hasFailed && (
        <p className="text-sm text-tinta-suave">No pudimos actualizar el seguimiento. Seguimos intentando.</p>
      )}
    </section>
  );
}
