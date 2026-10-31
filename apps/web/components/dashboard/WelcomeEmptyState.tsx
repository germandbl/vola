import { SpeedLines } from "@/components/SpeedLines";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

export function WelcomeEmptyState() {
  return (
    <Empty className="border border-solid bg-card">
      <EmptyHeader>
        <EmptyMedia>
          <SpeedLines background="blanco" />
        </EmptyMedia>
        <EmptyTitle className="text-lg font-semibold">Todavía no hay nada por acá</EmptyTitle>
        <EmptyDescription>
          Muy pronto vas a ver tus pedidos, motoristas y ventas en este panel.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
