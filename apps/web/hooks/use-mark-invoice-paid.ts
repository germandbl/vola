import { useState, useTransition } from "react";
import { markInvoicePaid } from "@/lib/invoice-actions";

export function useMarkInvoicePaid(invoiceId: number) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  function changeOpen(nextIsOpen: boolean) {
    setIsOpen(nextIsOpen);
    setError(undefined);
  }

  function confirm() {
    setError(undefined);
    startTransition(async () => {
      const result = await markInvoicePaid(invoiceId);
      setError(result.error);
      if (result.isPaid) setIsOpen(false);
    });
  }

  return { isOpen, error, isPending, changeOpen, confirm };
}
