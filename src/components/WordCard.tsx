// One word or phrase in the word library
import { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import type { Item } from "@/lib/types";
import { AudioButton } from "./AudioButton";
import { ArabicText, Badge, Card } from "./ui";

interface WordCardProps {
  item: Item;
  categoryLabel?: string;
  known: boolean;
}

// memo: the library list can hold hundreds of cards
export const WordCard = memo(function WordCard({ item, categoryLabel, known }: WordCardProps) {
  const { t, meaningOf, pronunciationOf, noteOf } = useLocale();
  const note = noteOf(item);

  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        <View style={styles.text}>
          <Text style={styles.meaning}>{meaningOf(item)}</Text>
          <Text style={styles.pronunciation}>{pronunciationOf(item)}</Text>
        </View>
        <View style={styles.arabicRow}>
          <ArabicText style={styles.arabic}>{item.arabic}</ArabicText>
          <AudioButton item={item} size="sm" />
        </View>
      </View>
      {note ? <Text style={styles.note}>💡 {note}</Text> : null}
      <View style={styles.badges}>
        {categoryLabel ? <Badge tone="emerald">{categoryLabel}</Badge> : null}
        {item.type === "phrase" ? <Badge tone="sky">{t("type.phrase")}</Badge> : null}
        {known ? <Badge tone="amber">✓ {t("words.known")}</Badge> : null}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  card: { padding: spacing.lg, gap: spacing.sm },
  top: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  text: { flex: 1 },
  meaning: { fontSize: 17, fontWeight: "600", color: colors.text },
  pronunciation: { fontSize: 14, color: colors.textMuted, marginTop: 2 },
  arabicRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, flexShrink: 1 },
  arabic: { fontSize: 24, flexShrink: 1 },
  note: { fontSize: 14, color: colors.textBody, lineHeight: 20 },
  badges: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
});
