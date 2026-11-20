import { CircleCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface InvoiceStatusChipProps {
  paidAt: string | null;
}

export function InvoiceStatusChip({ paidAt }: InvoiceStatusChipProps) {
  const isPaid = paidAt !== null;
  const Icon = isPaid ? CircleCheck : Clock;
  return (
    <Badge className="rounded-full bg-nube px-2 py-1 text-xs font-semibold text-tinta">
      <Icon data-icon="inline-start" />
      {isPaid ? "Pagada" : "Pendiente"}
    </Badge>
  );
}
