import { Linking } from "react-native";

// El enlace de direcciones de Google Maps abre la app de Maps si está instalada y si no, el navegador.
export function openDirections(latitude: number, longitude: number): Promise<void> {
  return Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  );
}

export function callPhone(phoneNumber: string): Promise<void> {
  return Linking.openURL(`tel:${phoneNumber}`);
}
