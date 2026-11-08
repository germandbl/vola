"use client";

import type { DriverMerchant } from "@vola/shared";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FieldDescription, FieldError, FieldLegend, FieldSet } from "@/components/ui/field";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { groupByOrganization } from "@/lib/merchant-groups";

interface MerchantMultiSelectProps {
  merchants: DriverMerchant[];
  selectedMerchantIds: number[];
  error?: string;
  onToggle: (merchantIds: number[], isSelected: boolean) => void;
}

export function MerchantMultiSelect({
  merchants,
  selectedMerchantIds,
  error,
  onToggle,
}: MerchantMultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const groups = groupByOrganization(merchants);
  const selectedMerchants = merchants.filter((merchant) =>
    selectedMerchantIds.includes(merchant.id),
  );

  return (
    <FieldSet data-invalid={Boolean(error)}>
      <FieldLegend>Comercios que atiende</FieldLegend>
      <FieldDescription>
        Buscá por comercio o por cliente. Solo recibe órdenes de las sucursales de estos comercios.
      </FieldDescription>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            aria-invalid={Boolean(error)}
            className="h-11 w-full justify-between rounded-lg px-4 font-normal md:max-w-md"
          >
            <span className="text-muted-foreground">Agregar comercios</span>
            <ChevronsUpDown data-icon="inline-end" />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
          <Command>
            <CommandInput placeholder="Ej. Doña Mary" />
            <CommandList>
              <CommandEmpty>No encontramos comercios con ese nombre.</CommandEmpty>
              {groups.map((group) => {
                const groupMerchantIds = group.merchants.map((merchant) => merchant.id);
                const isWholeGroupSelected = groupMerchantIds.every((id) =>
                  selectedMerchantIds.includes(id),
                );
                return (
                  <CommandGroup key={group.organizationId} heading={group.organizationName}>
                    <CommandItem
                      value={`todos ${group.organizationName}`}
                      onSelect={() => onToggle(groupMerchantIds, !isWholeGroupSelected)}
                    >
                      <Check className={isWholeGroupSelected ? "opacity-100" : "opacity-0"} />
                      Todos los comercios de {group.organizationName}
                    </CommandItem>
                    {group.merchants.map((merchant) => {
                      const isSelected = selectedMerchantIds.includes(merchant.id);
                      return (
                        <CommandItem
                          key={merchant.id}
                          value={`${merchant.name} ${group.organizationName} ${merchant.id}`}
                          onSelect={() => onToggle([merchant.id], !isSelected)}
                        >
                          <Check className={isSelected ? "opacity-100" : "opacity-0"} />
                          {merchant.name}
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                );
              })}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {selectedMerchants.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Comercios seleccionados">
          {selectedMerchants.map((merchant) => (
            <li key={merchant.id}>
              <Badge variant="secondary" className="gap-1 py-1 pr-1 pl-3">
                {merchant.name} · {merchant.organizationName}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onToggle([merchant.id], false)}
                  aria-label={`Quitar ${merchant.name}`}
                >
                  <X />
                </Button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
      <FieldError>{error}</FieldError>
    </FieldSet>
  );
}
