// A card that flips: Arabic on the front, the meaning on the back.
// The parent decides whether it is flipped.
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import { Animated, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { brandGradient, colors, radius, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import type { Item } from "@/lib/types";
import { AudioButton } from "./AudioButton";
import { ArabicText } from "./ui";

interface FlashcardProps {
  word: Item;
  flipped: boolean;
  onFlip: () => void;
}

export function Flashcard({ word, flipped, onFlip }: FlashcardProps) {
  const { t, meaningOf, pronunciationOf, noteOf } = useLocale();
  // Created once per card (0 = front, 1 = back) and animated between the two
  const [rotation] = useState(() => new Animated.Value(flipped ? 1 : 0));

  useEffect(() => {
    Animated.spring(rotation, {
      toValue: flipped ? 1 : 0,
      useNativeDriver: Platform.OS !== "web", // the native driver runs the animation off the JS thread
      friction: 8,
    }).start();
  }, [flipped, rotation]);

  const frontRotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "180deg"] });
  const backRotate = rotation.interpolate({ inputRange: [0, 1], outputRange: ["180deg", "360deg"] });
  const note = noteOf(word);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onFlip} accessibilityRole="button" accessibilityLabel={t("flashcard.flip")} style={styles.fill}>
        {/* Front: Arabic and pronunciation */}
        <Animated.View
          style={[styles.face, { transform: [{ perspective: 1000 }, { rotateY: frontRotate }] }]}
          importantForAccessibility={flipped ? "no-hide-descendants" : "auto"}
        >
          <LinearGradient colors={brandGradient} style={styles.gradient}>
            <ArabicText style={styles.frontArabic}>{word.arabic}</ArabicText>
            <Text style={styles.frontPronunciation}>{pronunciationOf(word)}</Text>
            <Text style={styles.hint}>{t("flashcard.tapHint")}</Text>
          </LinearGradient>
        </Animated.View>

        {/* Back: meaning, pronunciation and the optional tip */}
        <Animated.View
          style={[styles.face, styles.back, { transform: [{ perspective: 1000 }, { rotateY: backRotate }] }]}
          importantForAccessibility={flipped ? "auto" : "no-hide-descendants"}
        >
          <Text style={styles.meaning}>{meaningOf(word)}</Text>
          <Text style={styles.backPronunciation}>{pronunciationOf(word)}</Text>
          {note ? <Text style={styles.note}>💡 {note}</Text> : null}
        </Animated.View>
      </Pressable>

      {/* Outside the flip area, so it stays on top on both sides */}
      <AudioButton item={word} style={styles.audio} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { height: 320 },
  fill: { flex: 1 },
  face: {
    ...StyleSheet.absoluteFill,
    borderRadius: radius.xl,
    overflow: "hidden",
    backfaceVisibility: "hidden",
  },
  gradient: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.xxl },
  back: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xxl,
  },
  frontArabic: { fontSize: 46, color: colors.white, textAlign: "center" },
  frontPronunciation: { marginTop: spacing.md, fontSize: 18, color: "#ecfdf5", textAlign: "center" },
  hint: { marginTop: spacing.xxl, fontSize: 13, color: "#d1fae5" },
  meaning: { fontSize: 28, fontWeight: "700", color: colors.text, textAlign: "center" },
  backPronunciation: { marginTop: spacing.md, fontSize: 18, color: colors.textMuted, textAlign: "center" },
  note: { marginTop: spacing.lg, fontSize: 14, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  audio: { position: "absolute", top: spacing.lg, right: spacing.lg, backgroundColor: "rgba(255,255,255,0.92)" },
});
