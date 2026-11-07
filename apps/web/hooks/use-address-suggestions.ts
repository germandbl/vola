import { useMapsLibrary } from "@vis.gl/react-google-maps";
import { useEffect, useRef, useState } from "react";

export interface SelectedAddress {
  address: string;
  latitude: number;
  longitude: number;
}

const MIN_QUERY_LENGTH = 3;
const SEARCH_DELAY_MS = 300;
const SEARCH_ERROR = "No pudimos buscar direcciones. Probá de nuevo.";

export function useAddressSuggestions(countryCode: string | null) {
  const places = useMapsLibrary("places");
  const [query, setQuery] = useState("");
  const [predictions, setPredictions] = useState<google.maps.places.PlacePrediction[]>([]);
  const [error, setError] = useState<string>();
  // Google cobra por sesión: todas las búsquedas hasta elegir una dirección comparten el mismo token.
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);
  const isQueryLongEnough = query.trim().length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    if (!places || !isQueryLongEnough) return;
    let isCurrentSearch = true;
    const timeoutId = setTimeout(async () => {
      sessionTokenRef.current ??= new places.AutocompleteSessionToken();
      try {
        const { suggestions } = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: query,
          sessionToken: sessionTokenRef.current,
          includedRegionCodes: countryCode ? [countryCode.toLowerCase()] : undefined,
        });
        if (!isCurrentSearch) return;
        setPredictions(suggestions.flatMap((suggestion) => suggestion.placePrediction ?? []));
        setError(undefined);
      } catch (searchError) {
        if (!isCurrentSearch) return;
        setError(SEARCH_ERROR);
        throw searchError;
      }
    }, SEARCH_DELAY_MS);
    return () => {
      isCurrentSearch = false;
      clearTimeout(timeoutId);
    };
  }, [places, query, isQueryLongEnough, countryCode]);

  async function resolvePrediction(
    prediction: google.maps.places.PlacePrediction,
  ): Promise<SelectedAddress> {
    const place = prediction.toPlace();
    await place.fetchFields({ fields: ["formattedAddress", "location"] });
    sessionTokenRef.current = null;
    if (!place.location) {
      throw new Error(`Google did not return a location for place ${place.id}`);
    }
    return {
      address: place.formattedAddress ?? prediction.text.toString(),
      latitude: place.location.lat(),
      longitude: place.location.lng(),
    };
  }

  return {
    query,
    setQuery,
    predictions: isQueryLongEnough ? predictions : [],
    error,
    isReady: places !== null,
    resolvePrediction,
  };
}
