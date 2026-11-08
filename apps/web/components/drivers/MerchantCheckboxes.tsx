import type { DriverMerchant } from "@vola/shared";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { groupByOrganization, type OrganizationGroup } from "@/lib/merchant-groups";

function findGroupState(group: OrganizationGroup, selectedMerchantIds: number[]) {
  const selectedCount = group.merchants.filter((merchant) =>
    selectedMerchantIds.includes(merchant.id),
  ).length;
  if (selectedCount === 0) return false;
  if (selectedCount === group.merchants.length) return true;
  return "indeterminate";
}

interface MerchantCheckboxesProps {
  merchants: DriverMerchant[];
  selectedMerchantIds: number[];
  error?: string;
  onToggle: (merchantIds: number[], isSelected: boolean) => void;
}

export function MerchantCheckboxes({
  merchants,
  selectedMerchantIds,
  error,
  onToggle,
}: MerchantCheckboxesProps) {
  const groups = groupByOrganization(merchants);
  const showsOrganizations = groups.length > 1;

  return (
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend>
        {showsOrganizations ? "Clientes y comercios que atiende" : "Comercios que atiende"}
      </FieldLegend>
      <FieldDescription>Solo recibe órdenes de las sucursales de estos comercios.</FieldDescription>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.organizationId} className="flex flex-col gap-3">
            {showsOrganizations && (
              <Field orientation="horizontal">
                <Checkbox
                  id={`organization-${group.organizationId}`}
                  checked={findGroupState(group, selectedMerchantIds)}
                  onCheckedChange={(checked) =>
                    onToggle(
                      group.merchants.map((merchant) => merchant.id),
                      checked === true,
                    )
                  }
                />
                <FieldLabel htmlFor={`organization-${group.organizationId}`}>
                  {group.organizationName}
                </FieldLabel>
              </Field>
            )}
            {group.merchants.map((merchant) => (
              <Field
                key={merchant.id}
                orientation="horizontal"
                className={showsOrganizations ? "pl-6" : undefined}
              >
                <Checkbox
                  id={`merchant-${merchant.id}`}
                  checked={selectedMerchantIds.includes(merchant.id)}
                  onCheckedChange={(checked) => onToggle([merchant.id], checked === true)}
                  aria-invalid={Boolean(error)}
                />
                <FieldLabel htmlFor={`merchant-${merchant.id}`} className="font-normal">
                  {merchant.name}
                </FieldLabel>
              </Field>
            ))}
          </div>
        ))}
      </div>
      <FieldError>{error}</FieldError>
    </FieldSet>
  );
}
