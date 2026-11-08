import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { DriverForm } from "@/components/drivers/DriverForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = { title: "Crear motorista · Volá!" };

export default function NewDriverPage() {
  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="ghost" className="self-start">
        <Link href="/motoristas">
          <ArrowLeft data-icon="inline-start" />
          Volver a los motoristas
        </Link>
      </Button>
      <PageHeader
        title="Crear motorista"
        description="Con este email y contraseña entra a la app de motoristas."
      />
      <Card>
        <CardContent>
          <DriverForm />
        </CardContent>
      </Card>
    </div>
  );
}
