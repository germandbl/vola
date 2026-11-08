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

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tinta,
        tabBarInactiveTintColor: colors.tintaSuave,
        tabBarStyle: { backgroundColor: colors.blanco, borderTopColor: colors.linea },
        tabBarLabelStyle: { fontFamily: "Outfit_600SemiBold" },
        sceneStyle: { backgroundColor: colors.aire },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Órdenes",
          tabBarIcon: ({ color }) => <TabIcon name="package" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color }) => <TabIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
