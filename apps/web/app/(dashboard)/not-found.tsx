import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export default function DashboardNotFound() {
  return (
    <Empty className="border border-solid bg-card">
      <EmptyHeader>
        <EmptyTitle>No encontramos esta página</EmptyTitle>
        <EmptyDescription>Puede que no exista o que no tengas acceso.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild variant="outline">
          <Link href="/">Volver al inicio</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
