"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";
import { useState } from "react";
import { FormErrorAlert } from "@/components/FormErrorAlert";
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
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";

interface AddressAutocompleteProps {
  id: string;
  countryCode: string | null;
  value: SelectedAddress | null;
  isInvalid: boolean;
  onSelect: (address: SelectedAddress) => void;
}

function AddressCombobox({ id, countryCode, value, isInvalid, onSelect }: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectError, setSelectError] = useState<string>();
  const suggestions = useAddressSuggestions(countryCode);

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
              {value?.address ?? "Buscá la dirección del cliente"}
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

export function AddressAutocomplete(props: AddressAutocompleteProps) {
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (hasAuthFailed) return <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />;
  if (!apiKey) return <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />;

  return (
    <APIProvider apiKey={apiKey}>
      <AddressCombobox {...props} />
    </APIProvider>
  );
}
