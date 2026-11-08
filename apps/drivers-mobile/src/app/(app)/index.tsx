import { spacing } from "@vola/shared";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useSignOut } from "@/hooks/use-sign-out";
import { useSession } from "@/session/SessionProvider";

export default function HomeScreen() {
  const { session } = useSession();
  const signOut = useSignOut();

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.heading}>
          <AppText variant="titulo1">Hola, {session?.user.name}</AppText>
          <AppText tone="tintaSuave">Ya estás dentro. Pronto vas a ver acá tus órdenes.</AppText>
        </View>
        {signOut.error && <ErrorMessage message={signOut.error} />}
        <SecondaryButton
          label="Cerrar sesión"
          isLoading={signOut.isPending}
          onPress={signOut.confirmSignOut}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { flex: 1, justifyContent: "space-between", padding: spacing[4] },
  heading: { gap: spacing[2] },
});
