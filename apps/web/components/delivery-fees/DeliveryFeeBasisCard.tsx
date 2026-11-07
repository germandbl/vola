"use client";

import { DeliveryFeeBasis } from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Spinner } from "@/components/ui/spinner";
import { useDeliveryFeeBasisForm } from "@/hooks/use-delivery-fee-basis-form";

interface DeliveryFeeBasisCardProps {
  merchantId: number;
  initialBasis: DeliveryFeeBasis | null;
  hasDistanceRate: boolean;
  hasOrderCountRate: boolean;
}

export function DeliveryFeeBasisCard({
  merchantId,
  initialBasis,
  hasDistanceRate,
  hasOrderCountRate,
}: DeliveryFeeBasisCardProps) {
  const form = useDeliveryFeeBasisForm(merchantId, initialBasis);
  const options = [
    {
      basis: DeliveryFeeBasis.Distance,
      label: "Por distancia",
      description: "Cada pedido paga según los km del envío.",
      isConfigured: hasDistanceRate,
    },
    {
      basis: DeliveryFeeBasis.CompletedOrders,
      label: "Por cantidad de pedidos del mes",
      description: "Cada pedido paga según cuántos lleva el comercio en el mes.",
      isConfigured: hasOrderCountRate,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Cómo se cobra el envío</CardTitle>
        <CardDescription>El comercio usa una sola tarifa a la vez.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.submit}>
          <FieldGroup>
            {form.result.formError && <FormErrorAlert message={form.result.formError} />}
            <RadioGroup value={form.selectedBasis ?? ""} onValueChange={form.selectBasis}>
              {options.map((option) => (
                <Field key={option.basis} orientation="horizontal" data-disabled={!option.isConfigured}>
                  <RadioGroupItem
                    id={`basis-${option.basis}`}
                    value={option.basis}
                    disabled={!option.isConfigured}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor={`basis-${option.basis}`}>{option.label}</FieldLabel>
                    <FieldDescription>
                      {option.isConfigured
                        ? option.description
                        : "Configurá esta tarifa abajo para poder activarla."}
                    </FieldDescription>
                  </FieldContent>
                </Field>
              ))}
            </RadioGroup>
            <div className="flex items-center gap-4">
              <Button type="submit" disabled={!form.hasChanges || form.isPending}>
                {form.isPending && <Spinner data-icon="inline-start" />}
                {form.isPending ? "Guardando…" : "Guardar"}
              </Button>
              {form.result.isSaved && (
                <p className="text-sm text-muted-foreground">Cambios guardados.</p>
              )}
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
