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

// wa.me necesita el número solo con dígitos, sin el + ni espacios.
export function openWhatsApp(phoneNumber: string): Promise<void> {
  const digits = phoneNumber.replace(/\D/g, "");
  return Linking.openURL(`https://wa.me/${digits}`);
}
