// The bottom tab bar for logged-in learners (same five tabs as the website on phones)
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import type { ColorValue } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";

type IconName = ComponentProps<typeof Ionicons>["name"];

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={String(color)} size={size} />;
  }
  return TabIcon;
}

// Taller than the default 49 px bar, so Bangla labels (with vowel signs below
// the line) fit under the icon instead of being cut off
const TAB_BAR_HEIGHT = 62;

export default function TabsLayout() {
  const { t } = useLocale();
  // Space for the phone's gesture bar or buttons at the bottom of the screen
  const { bottom } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: TAB_BAR_HEIGHT + bottom,
          paddingBottom: bottom,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500", lineHeight: 16 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: t("nav.home"), tabBarIcon: tabIcon("home-outline") }} />
      <Tabs.Screen name="courses" options={{ title: t("nav.courses"), tabBarIcon: tabIcon("book-outline") }} />
      <Tabs.Screen name="words" options={{ title: t("nav.words"), tabBarIcon: tabIcon("list-outline") }} />
      <Tabs.Screen name="practice" options={{ title: t("nav.practice"), tabBarIcon: tabIcon("layers-outline") }} />
      <Tabs.Screen name="account" options={{ title: t("nav.profile"), tabBarIcon: tabIcon("person-outline") }} />
    </Tabs>
  );
}
