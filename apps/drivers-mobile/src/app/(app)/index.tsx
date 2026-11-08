import { spacing } from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { useSignedInSession } from "@/session/SessionProvider";

export default function HomeScreen() {
  const { user } = useSignedInSession();

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <View style={styles.content}>
        <AppText variant="titulo1">Hola, {user.name}</AppText>
        <AppText tone="tintaSuave">
          Pronto vas a ver acá tus órdenes. Para recibirlas, marcate disponible en Perfil.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: spacing[2], padding: spacing[4] },
});
