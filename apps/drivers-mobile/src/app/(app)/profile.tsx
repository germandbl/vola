import { colors, spacing } from "@vola/shared";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "@/components/AppText";
import { AvailabilityCard } from "@/components/AvailabilityCard";
import { Card } from "@/components/Card";
import { ErrorMessage } from "@/components/ErrorMessage";
import { SecondaryButton } from "@/components/SecondaryButton";
import { useDriverProfile } from "@/hooks/use-driver-profile";
import { useSignOut } from "@/hooks/use-sign-out";

export default function ProfileScreen() {
  const driverProfile = useDriverProfile();
  const signOut = useSignOut();
  const { profile } = driverProfile;

  return (
    <SafeAreaView edges={["top"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <AppText variant="titulo1">Perfil</AppText>
        {driverProfile.error && <ErrorMessage message={driverProfile.error} />}
        {!profile && !driverProfile.error && <ActivityIndicator color={colors.tinta} />}
        {profile && (
          <>
          <Card>
              <AppText variant="titulo3">{profile.name}</AppText>
              <View>
                <AppText variant="pequeno" tone="tintaSuave">
                  {profile.email}
                </AppText>
                <AppText variant="pequeno" tone="tintaSuave">
                  {profile.phoneNumber}
                </AppText>
              </View>
            </Card>
            <AvailabilityCard
              isAvailable={profile.isAvailable}
              isUpdating={driverProfile.isUpdatingAvailability}
              onChange={driverProfile.changeAvailability}
            />
          </>
        )}
        {signOut.error && <ErrorMessage message={signOut.error} />}
        <SecondaryButton
          label="Cerrar sesión"
          isLoading={signOut.isPending}
          onPress={signOut.confirmSignOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { gap: spacing[6], padding: spacing[4] },
});
