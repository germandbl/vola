import { colors, radius } from "@vola/shared";
import { Pressable, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MAP_HEIGHT = 140;
// Cerca de 1 km alrededor del punto: se ve la cuadra y las calles de acceso.
const MAP_DELTA = 0.01;
const MARKER_HEIGHT = 48;
// La imagen tiene la punta del pin en el borde inferior: así apunta a la dirección y no queda centrada sobre ella.
const MARKER_TIP_ANCHOR = { x: 0.5, y: 1 };
const MARKER_TIP_OFFSET = { x: 0, y: -MARKER_HEIGHT / 2 };

interface MapPreviewProps {
  latitude: number;
  longitude: number;
  onPress: () => void;
}

export function MapPreview({ latitude, longitude, onPress }: MapPreviewProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Mapa de la dirección de entrega. Tocá para ver cómo llegar."
      onPress={onPress}
      style={styles.container}
    >
      <MapView
        pointerEvents="none"
        style={styles.map}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: MAP_DELTA,
          longitudeDelta: MAP_DELTA,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        rotateEnabled={false}
        pitchEnabled={false}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          image={require("@/assets/images/markers/customer.png")}
          anchor={MARKER_TIP_ANCHOR}
          centerOffset={MARKER_TIP_OFFSET}
        />
      </MapView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    height: MAP_HEIGHT,
    borderRadius: radius.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.linea,
  },
  map: { flex: 1 },
});
