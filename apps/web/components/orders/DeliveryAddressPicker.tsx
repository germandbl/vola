"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import type { SelectedAddress } from "@/hooks/use-address-suggestions";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { DeliveryLocationMap } from "./DeliveryLocationMap";

interface DeliveryAddressPickerProps {
  id: string;
  countryCode: string | null;
  value: SelectedAddress | null;
  isInvalid: boolean;
  onSelect: (address: SelectedAddress) => void;
}

export function DeliveryAddressPicker(props: DeliveryAddressPickerProps) {
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (hasAuthFailed) return <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />;
  if (!apiKey) return <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="flex flex-col gap-2">
        <AddressAutocomplete {...props} />
        {/* Sin dirección buscada no hay punto que ajustar, así que el mapa aparece después de elegirla. */}
        {props.value && <DeliveryLocationMap address={props.value} onChange={props.onSelect} />}
      </div>
    </APIProvider>
  );
}
