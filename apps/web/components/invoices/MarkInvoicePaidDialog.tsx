"use client";

import { CircleCheck } from "lucide-react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import { useMarkInvoicePaid } from "@/hooks/use-mark-invoice-paid";

interface MarkInvoicePaidDialogProps {
  invoiceId: number;
  organizationName: string;
  formattedAmount: string;
}

export function MarkInvoicePaidDialog({ invoiceId, organizationName, formattedAmount }: MarkInvoicePaidDialogProps) {
  const dialog = useMarkInvoicePaid(invoiceId);

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.changeOpen}>
      <DialogTrigger asChild>
        <Button>
          <CircleCheck data-icon="inline-start" />
          Registrar pago
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar el pago de la factura #{invoiceId}</DialogTitle>
          <DialogDescription>
            Confirmá cuando {organizationName} te haya pagado {formattedAmount}. La factura queda como pagada.
          </DialogDescription>
        </DialogHeader>
        {dialog.error && <FormErrorAlert message={dialog.error} />}
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Volver</Button>
          </DialogClose>
          <Button disabled={dialog.isPending} onClick={dialog.confirm}>
            {dialog.isPending && <Spinner data-icon="inline-start" />}
            {dialog.isPending ? "Registrando…" : "Confirmar pago"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
