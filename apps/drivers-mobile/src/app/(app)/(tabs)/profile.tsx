import { colors, spacing } from "@vola/shared";
import { Image } from "expo-image";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { AvailabilityCard } from "@/components/AvailabilityCard";
import { Avatar } from "@/components/Avatar";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useDriverProfile } from "@/hooks/use-driver-profile";
import { useSignOut } from "@/hooks/use-sign-out";
import { useSignedInSession } from "@/session/SessionProvider";

const HEADER_LOGO_HEIGHT = 32;
const LOGO_ASPECT_RATIO = 1281 / 434;
// El avatar mide 88: la mitad queda sobre la banda de color y la otra mitad sobre el contenido.
const AVATAR_OVERLAP = 44;

export default function ProfileScreen() {
  const { user } = useSignedInSession();
  const driverProfile = useDriverProfile();
  const signOut = useSignOut();
  const { profile } = driverProfile;

  return (
    <View style={styles.screen}>
      <SafeAreaView edges={["top"]} style={styles.band}>
        <View style={styles.bandHeader}>
          <AppText variant="titulo2" tone="blanco">
            Mi cuenta
          </AppText>
          <Image
            source={require("@/assets/images/logo-blanco.png")}
            accessibilityLabel="Volá!"
            contentFit="contain"
            style={styles.logo}
          />
        </View>
      </SafeAreaView>
      <View style={styles.avatar}>
        <Avatar name={user.name} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.identity}>
          <AppText variant="titulo2">{user.name}</AppText>
          <AppText tone="tintaSuave">{user.email}</AppText>
          <AppText variant="pequeno" tone="tintaSuave">
            {user.phoneNumber}
          </AppText>
        </View>
        {driverProfile.error && <ErrorMessage message={driverProfile.error} />}
        {!profile && !driverProfile.error && <ActivityIndicator color={colors.tinta} />}
        {profile && (
          <AvailabilityCard
            isAvailable={profile.isAvailable}
            isUpdating={driverProfile.isUpdatingAvailability}
            onChange={driverProfile.changeAvailability}
          />
        )}
        {signOut.error && <ErrorMessage message={signOut.error} />}
        <SecondaryButton
          label="Cerrar sesión"
          icon="log-out"
          isLoading={signOut.isPending}
          onPress={signOut.confirmSignOut}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.aire },
  band: { backgroundColor: colors.tinta },
  bandHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing[4],
    paddingTop: spacing[2],
    paddingBottom: spacing[6] + AVATAR_OVERLAP,
  },
  logo: { height: HEADER_LOGO_HEIGHT, aspectRatio: LOGO_ASPECT_RATIO },
  avatar: { alignItems: "center", marginTop: -AVATAR_OVERLAP },
  content: { gap: spacing[6], padding: spacing[4] },
  identity: { alignItems: "center", gap: spacing[1] },
});
