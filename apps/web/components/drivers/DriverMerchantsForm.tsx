"use client";

import type {
  DriverMerchant,
  DriverMerchantsForm as DriverMerchantsFormValues,
} from "@vola/shared";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useDriverMerchantsForm } from "@/hooks/use-driver-merchants-form";
import type { DriverSaveResult } from "@/lib/driver-actions";
import { MerchantCheckboxes } from "./MerchantCheckboxes";
import { MerchantMultiSelect } from "./MerchantMultiSelect";

interface DriverMerchantsFormProps {
  save: (form: DriverMerchantsFormValues) => Promise<DriverSaveResult>;
  merchants: DriverMerchant[];
  initialMerchantIds: number[];
  isMerchantSearchable: boolean;
}

export function DriverMerchantsForm({
  save,
  merchants,
  initialMerchantIds,
  isMerchantSearchable,
}: DriverMerchantsFormProps) {
  const form = useDriverMerchantsForm(save, initialMerchantIds);
  const { fieldErrors, formError, isSaved } = form.result;

  return (
    <form onSubmit={form.submit} noValidate>
      <FieldGroup>
        {formError && <FormErrorAlert message={formError} />}
        {isMerchantSearchable ? (
          <MerchantMultiSelect
            merchants={merchants}
            selectedMerchantIds={form.selectedMerchantIds}
            error={fieldErrors.merchantIds}
            onToggle={form.toggleMerchants}
          />
        ) : (
          <MerchantCheckboxes
            merchants={merchants}
            selectedMerchantIds={form.selectedMerchantIds}
            error={fieldErrors.merchantIds}
            onToggle={form.toggleMerchants}
          />
        )}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={form.isPending}>
            {form.isPending && <Spinner data-icon="inline-start" />}
            {form.isPending ? "Guardando…" : "Guardar cambios"}
          </Button>
          {isSaved && <p className="text-sm text-muted-foreground">Cambios guardados.</p>}
        </div>
      </FieldGroup>
    </form>
  );
}
