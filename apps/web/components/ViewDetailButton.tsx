import { Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ViewDetailButtonProps {
  href: string;
  // En órdenes el detalle abre un panel encima de la tabla: no hay que mover la página.
  shouldScroll?: boolean;
}

export function ViewDetailButton({ href, shouldScroll = true }: ViewDetailButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button asChild size="icon-sm">
          <Link href={href} scroll={shouldScroll} aria-label="Ver detalle">
            <Eye />
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent>Ver detalle</TooltipContent>
    </Tooltip>
  );
}
