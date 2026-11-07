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
          <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {details.map((detail) => (
              <div key={detail.label} className="flex flex-col gap-1">
                <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                <dd className="font-semibold break-words">{detail.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
