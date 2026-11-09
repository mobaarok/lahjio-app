// Plays an item's own recording, or the phone's Arabic voice when it has none.
// autoPlay plays the word once as soon as the button appears.
import { Ionicons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import { playWord } from "@/lib/speak";
import type { Item } from "@/lib/types";

const sizes = { sm: 36, md: 44, lg: 64 } as const;

interface AudioButtonProps {
  item: Pick<Item, "id" | "arabic" | "audio">;
  size?: keyof typeof sizes;
  autoPlay?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function AudioButton({ item, size = "md", autoPlay = false, style }: AudioButtonProps) {
  const { t } = useLocale();
  const dimension = sizes[size];

  useEffect(() => {
    if (autoPlay) playWord(item);
  }, [autoPlay, item]);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("audio.listen")}
      hitSlop={8}
      onPress={() => playWord(item)}
      style={({ pressed }) => [
        styles.button,
        { width: dimension, height: dimension },
        pressed && styles.pressed,
        style,
      ]}
    >
      <Ionicons name="volume-high" size={size === "lg" ? 32 : 20} color={colors.primaryDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: radius.full,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: { backgroundColor: "#d1fae5", transform: [{ scale: 0.95 }] },
});
