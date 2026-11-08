"use client";

import { APIProvider } from "@vis.gl/react-google-maps";
import { FormErrorAlert } from "@/components/FormErrorAlert";
import type { SelectedAddress } from "@/hooks/use-address-suggestions";
import {
  MAP_AUTH_FAILURE_MESSAGE,
  MISSING_MAPS_KEY_MESSAGE,
  useMapAuthFailure,
} from "@/hooks/use-map-auth-failure";
import { getDefaultMapCenter, type Coordinates } from "@/lib/map-defaults";
import { AddressAutocomplete } from "./AddressAutocomplete";
import { DeliveryLocationMap } from "./DeliveryLocationMap";

interface DeliveryAddressPickerProps {
  id: string;
  countryCode: string | null;
  address: string;
  location: Coordinates | null;
  isInvalid: boolean;
  onSelectSuggestion: (address: SelectedAddress) => void;
  onWriteAddress: (address: string) => void;
  onMoveLocation: (location: Coordinates) => void;
}

export function DeliveryAddressPicker({
  id,
  countryCode,
  address,
  location,
  isInvalid,
  onSelectSuggestion,
  onWriteAddress,
  onMoveLocation,
}: DeliveryAddressPickerProps) {
  const hasAuthFailed = useMapAuthFailure();
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (hasAuthFailed) return <FormErrorAlert message={MAP_AUTH_FAILURE_MESSAGE} />;
  if (!apiKey) return <FormErrorAlert message={MISSING_MAPS_KEY_MESSAGE} />;

  return (
    <APIProvider apiKey={apiKey}>
      <div className="flex flex-col gap-2">
        <AddressAutocomplete
          id={id}
          countryCode={countryCode}
          value={address}
          isInvalid={isInvalid}
          onSelect={onSelectSuggestion}
          onWrite={onWriteAddress}
        />
        <DeliveryLocationMap
          location={location}
          defaultCenter={getDefaultMapCenter(countryCode)}
          onChange={onMoveLocation}
        />
      </div>
    </APIProvider>
  );
}
