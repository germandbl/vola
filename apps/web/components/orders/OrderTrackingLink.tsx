"use client";

import { Check, Copy, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const COPIED_FEEDBACK_MS = 2000;

interface OrderTrackingLinkProps {
  trackingCode: string;
}

// El enlace es público: se le manda al cliente para que siga su pedido sin cuenta en Volá!.
export function OrderTrackingLink({ trackingCode }: OrderTrackingLinkProps) {
  const [hasCopied, setHasCopied] = useState(false);
  const trackingPath = `/seguimiento/${trackingCode}`;

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}${trackingPath}`);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), COPIED_FEEDBACK_MS);
  }

  return (
    <div className="flex flex-wrap gap-2 border-b px-5 py-3">
      <Button asChild variant="outline" size="sm">
        <a href={trackingPath} target="_blank" rel="noreferrer">
          <ExternalLink data-icon="inline-start" />
          Ver seguimiento
        </a>
      </Button>
      <Button variant="outline" size="sm" onClick={copyLink}>
        {hasCopied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {hasCopied ? "Enlace copiado" : "Copiar enlace"}
      </Button>
    </div>
  );
}
