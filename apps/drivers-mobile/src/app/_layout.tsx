import { useFonts } from "@expo-google-fonts/outfit";
import { colors } from "@vola/shared";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SessionProvider, useSession } from "@/session/SessionProvider";
import { OUTFIT_FONTS } from "@/theme/fonts";

SplashScreen.preventAutoHideAsync();

interface RootNavigatorProps {
  areFontsReady: boolean;
}

function RootNavigator({ areFontsReady }: RootNavigatorProps) {
  const { session, isLoading } = useSession();
  const isReady = areFontsReady && !isLoading;

  useEffect(() => {
    if (isReady) SplashScreen.hideAsync();
  }, [isReady]);

  if (!isReady) return null;

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.aire } }}>
      <Stack.Protected guard={session !== null}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
      <Stack.Protected guard={session === null}>
        <Stack.Screen name="sign-in" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [areFontsLoaded, fontError] = useFonts(OUTFIT_FONTS);

  return (
    <SessionProvider>
      <StatusBar style="dark" />
      {/* Si la fuente falla, la app sigue con la fuente del sistema en vez de quedarse en la pantalla de carga. */}
      <RootNavigator areFontsReady={areFontsLoaded || Boolean(fontError)} />
    </SessionProvider>
  );
}
