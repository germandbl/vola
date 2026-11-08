import { colors } from "@vola/shared";
import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        contentStyle: { backgroundColor: colors.aire },
        headerStyle: { backgroundColor: colors.aire },
        headerTintColor: colors.tinta,
        headerTitleStyle: { fontFamily: "Outfit_700Bold" },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="orders/[orderId]" options={{ title: "Orden", headerBackTitle: "Órdenes" }} />
    </Stack>
  );
}
