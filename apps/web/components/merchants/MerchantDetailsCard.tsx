import { canManageMerchants, type AuthUser, type Merchant } from "@vola/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateMerchant } from "@/lib/merchant-actions";
import { MerchantForm } from "./MerchantForm";

interface MerchantDetailsCardProps {
  merchant: Merchant;
  currentUser: AuthUser;
}

export function MerchantDetailsCard({ merchant, currentUser }: MerchantDetailsCardProps) {
  const details = [
    { label: "Encargado", value: merchant.contactName },
    { label: "Correo", value: merchant.contactEmail },
    { label: "Teléfono", value: merchant.contactPhone },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Datos del comercio</CardTitle>
      </CardHeader>
      <CardContent>
        {canManageMerchants(currentUser) ? (
          <MerchantForm
            action={updateMerchant.bind(null, merchant.id)}
            merchant={merchant}
            submitLabel="Guardar cambios"
            pendingLabel="Guardando…"
          />
        ) : (
          <dl className="flex flex-col divide-y">
            {details.map((detail) => (
              <div key={detail.label} className="flex justify-between gap-4 py-2">
                <dt className="text-muted-foreground">{detail.label}</dt>
                <dd className="font-semibold">{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
