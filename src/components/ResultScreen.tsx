// End-of-session summary for quizzes, practice and lessons
import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import { Screen } from "./Screen";
import { Card } from "./ui";

interface ResultScreenProps {
  title: string;
  score: number;
  total: number;
  xp: number;
  children?: ReactNode;
}

export function ResultScreen({ title, score, total, xp, children }: ResultScreenProps) {
  const { t, num } = useLocale();
  const percent = total > 0 ? Math.round((score / total) * 100) : 0;
  const message = percent === 100 ? t("result.perfect") : percent >= 70 ? t("result.great") : t("result.keepGoing");
  const emoji = percent === 100 ? "🏆" : percent >= 70 ? "🎉" : "💪";

  return (
    <Screen edges={["top", "bottom"]} contentStyle={styles.screen}>
      <Card style={styles.card}>
        <Text style={styles.emoji} accessibilityElementsHidden>
          {emoji}
        </Text>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.stats}>
          <View style={[styles.stat, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.statValue, { color: colors.primaryDark }]}>
              {num(score)}/{num(total)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.primaryDeep }]}>{t("result.correct")}</Text>
          </View>
          <View style={[styles.stat, { backgroundColor: colors.amberSoft }]}>
            <Text style={[styles.statValue, { color: colors.amber }]}>+{num(xp)}</Text>
            <Text style={[styles.statLabel, { color: colors.amberText }]}>{t("result.xp")}</Text>
          </View>
        </View>

        <View style={styles.actions}>{children}</View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { flexGrow: 1, justifyContent: "center" },
  card: { padding: spacing.xxl, alignItems: "center" },
  emoji: { fontSize: 56 },
  title: { marginTop: spacing.md, fontSize: 24, fontWeight: "700", color: colors.text, textAlign: "center" },
  message: { marginTop: spacing.xs, color: colors.textMuted, textAlign: "center" },
  stats: { flexDirection: "row", gap: spacing.md, marginTop: spacing.xxl, alignSelf: "stretch" },
  stat: { flex: 1, borderRadius: radius.lg, padding: spacing.lg, alignItems: "center" },
  statValue: { fontSize: 28, fontWeight: "700" },
  statLabel: { fontSize: 13, textAlign: "center" },
  actions: { marginTop: spacing.xxl, gap: spacing.sm, alignSelf: "stretch" },
});
