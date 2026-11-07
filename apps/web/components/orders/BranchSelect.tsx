import type { OrderBranchOption } from "@vola/shared";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BranchGroup {
  label: string;
  options: OrderBranchOption[];
}

// Las opciones llegan ordenadas por organización y comercio; se agrupan para que el select sea fácil de recorrer.
function groupByMerchant(options: OrderBranchOption[], showOrganization: boolean): BranchGroup[] {
  const groups = new Map<string, BranchGroup>();
  for (const option of options) {
    const label = showOrganization
      ? `${option.organizationName} · ${option.merchantName}`
      : option.merchantName;
    const group = groups.get(label) ?? { label, options: [] };
    group.options.push(option);
    groups.set(label, group);
  }
  return [...groups.values()];
}

interface BranchSelectProps {
  id: string;
  options: OrderBranchOption[];
  value: string;
  isInvalid: boolean;
  onChange: (branchId: string) => void;
}

export function BranchSelect({ id, options, value, isInvalid, onChange }: BranchSelectProps) {
  const organizationNames = new Set(options.map((option) => option.organizationName));
  const groups = groupByMerchant(options, organizationNames.size > 1);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full" aria-invalid={isInvalid}>
        <SelectValue placeholder="Elegí la sucursal que despacha" />
      </SelectTrigger>
      <SelectContent>
        {groups.map((group) => (
          <SelectGroup key={group.label}>
            <SelectLabel>{group.label}</SelectLabel>
            {group.options.map((option) => (
              <SelectItem key={option.branchId} value={option.branchId.toString()}>
                {option.branchName}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}
