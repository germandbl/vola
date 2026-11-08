"use client";

import { MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAddressSuggestions, type SelectedAddress } from "@/hooks/use-address-suggestions";

interface AddressAutocompleteProps {
  id: string;
  countryCode: string | null;
  value: string;
  isInvalid: boolean;
  onSelect: (address: SelectedAddress) => void;
  onWrite: (address: string) => void;
}

export function AddressAutocomplete({
  id,
  countryCode,
  value,
  isInvalid,
  onSelect,
  onWrite,
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectError, setSelectError] = useState<string>();
  const suggestions = useAddressSuggestions(countryCode);
  const writtenAddress = suggestions.query.trim();

  async function selectPrediction(prediction: google.maps.places.PlacePrediction) {
    setIsOpen(false);
    try {
      onSelect(await suggestions.resolvePrediction(prediction));
      setSelectError(undefined);
    } catch (resolveError) {
      setSelectError("No pudimos ubicar esa dirección. Elegí otra.");
      throw resolveError;
    }
  }

  function chooseWrittenAddress() {
    setIsOpen(false);
    setSelectError(undefined);
    onWrite(writtenAddress);
  }

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            aria-invalid={isInvalid}
            disabled={!suggestions.isReady}
            className="h-11 w-full justify-start rounded-lg px-4 font-normal"
          >
            <MapPin data-icon="inline-start" />
            <span className={value ? "truncate" : "truncate text-muted-foreground"}>
              {value || "Buscá o escribí la dirección del cliente"}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Ej. Col. Palmira, casa 12"
              value={suggestions.query}
              onValueChange={suggestions.setQuery}
            />
            <CommandList>
              <CommandEmpty>Escribí al menos 3 letras para ver sugerencias.</CommandEmpty>
              <CommandGroup>
                {writtenAddress && (
                  <CommandItem value={writtenAddress} onSelect={chooseWrittenAddress}>
                    Usar “{writtenAddress}”
                  </CommandItem>
                )}
                {suggestions.predictions.map((prediction) => (
                  <CommandItem
                    key={prediction.placeId}
                    value={prediction.placeId}
                    onSelect={() => selectPrediction(prediction)}
                  >
                    {prediction.text.toString()}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {(suggestions.error ?? selectError) && (
        <p className="text-sm text-destructive">{suggestions.error ?? selectError}</p>
      )}
    </div>
  );
}
