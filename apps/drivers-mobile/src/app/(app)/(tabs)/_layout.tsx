import Feather from "@expo/vector-icons/Feather";
import { colors } from "@vola/shared";
import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";

const TAB_ICON_SIZE = 24;

interface TabIconProps {
  name: "package" | "user";
  color: ColorValue;
}

// Expo Router tipa el color como ColorValue (que admite null); Feather solo acepta texto.
function TabIcon({ name, color }: TabIconProps) {
  const iconColor = typeof color === "string" ? color : colors.tintaSuave;
  return <Feather name={name} size={TAB_ICON_SIZE} color={iconColor} />;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tinta,
        tabBarInactiveTintColor: colors.tintaSuave,
        tabBarStyle: { backgroundColor: colors.blanco, borderTopColor: colors.linea },
        headerStyle: { backgroundColor: colors.aire },
        headerTitleStyle: { fontFamily: "Outfit_700Bold", color: colors.tinta },
        headerShadowVisible: false,
        sceneStyle: { backgroundColor: colors.aire },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Órdenes",
          tabBarAccessibilityLabel: "Órdenes",
          tabBarIcon: ({ color }) => <TabIcon name="package" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Mi cuenta",
          headerShown: false,
          tabBarAccessibilityLabel: "Mi cuenta",
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
