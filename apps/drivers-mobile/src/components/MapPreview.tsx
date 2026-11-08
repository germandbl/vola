import { colors, radius } from "@vola/shared";
import { Pressable, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MAP_HEIGHT = 140;
// Cerca de 1 km alrededor del punto: se ve la cuadra y las calles de acceso.
const MAP_DELTA = 0.01;

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
        <Marker coordinate={{ latitude, longitude }} pinColor={colors.tinta} />
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
