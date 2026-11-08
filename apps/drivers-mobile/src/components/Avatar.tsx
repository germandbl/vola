import { colors } from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";

const AVATAR_SIZE = 88;
const AVATAR_BORDER_WIDTH = 4;

// Todavía no hay foto de perfil: se muestran las iniciales del nombre.
function getInitials(name: string): string {
  const words = name.trim().split(/\s+/);
  const initials = words.slice(0, 2).map((word) => word.charAt(0).toUpperCase());
  return initials.join("");
}

interface AvatarProps {
  name: string;
}

export function Avatar({ name }: AvatarProps) {
  return (
    <View style={styles.avatar} accessibilityLabel={`Foto de ${name}`}>
      <AppText variant="titulo2">{getInitials(name)}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    borderWidth: AVATAR_BORDER_WIDTH,
    borderColor: colors.aire,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.cielo,
  },
});
