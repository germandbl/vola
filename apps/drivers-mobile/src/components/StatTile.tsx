import Feather from "@expo/vector-icons/Feather";
import { colors, radius, spacing } from "@vola/shared";
import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

const ICON_SIZE = 18;

type StatTileTone = "nube" | "bruma";

interface StatTileProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  tone: StatTileTone;
  children: ReactNode;
}

export function StatTile({ icon, label, tone, children }: StatTileProps) {
  return (
    <View style={[styles.tile, { backgroundColor: colors[tone] }]}>
      <Feather name={icon} size={ICON_SIZE} color={colors.tinta} />
      <AppText variant="etiqueta" tone="tintaSuave">
        {label}
      </AppText>
      <AppText variant="titulo3" style={styles.value}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    alignItems: "center",
    gap: spacing[1],
    padding: spacing[4],
    borderRadius: radius.md,
  },
  value: { textAlign: "center" },
});
