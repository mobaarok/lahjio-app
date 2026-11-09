// Stats, daily goal, mastery levels and the words that need more work
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { ArabicText, Badge, Button, Card, Chip, ErrorState, Loading, ProgressBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import { useNow } from "@/hooks/useNow";
import { DEFAULT_DAILY_GOAL, isDue, liveStreak, todayCount } from "@/lib/progress";

const GOAL_OPTIONS = [10, 20, 30, 50];

export default function ProgressScreen() {
  const { content, loading, error, reload } = useContent();
  const progressState = useProgress();
  const { progress, lessonProgress, profile, setDailyGoal } = progressState;
  const { t, num, meaningOf, pronunciationOf, localized } = useLocale();
  const now = useNow();

  if (loading || progressState.loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const items = content.items;
  const goal = profile?.daily_goal ?? DEFAULT_DAILY_GOAL;
  const doneToday = todayCount(profile, now);

  // Box numbers come from spaced repetition: higher means remembered longer
  const seen = items.filter((i) => progress[i.id]);
  const strong = seen.filter((i) => progress[i.id].box >= 3).length;
  const learning = seen.length - strong;
  const fresh = items.length - seen.length;
  const known = items.filter((i) => progress[i.id]?.known).length;
  const due = items.filter((i) => isDue(progress[i.id], now)).length;
  // Only lessons that still exist (old results stay saved after a content reset)
  const lessonsDone = content.courses
    .flatMap((c) => c.lessons)
    .filter((l) => lessonProgress[l.id]?.status === "completed").length;

  const hardWords = seen
    .filter((i) => progress[i.id].times_wrong > 0)
    .sort((a, b) => progress[b.id].times_wrong - progress[a.id].times_wrong)
    .slice(0, 6);

  return (
    <Screen edges={[]}>
      <Text style={styles.subtitle}>{t("progress.subtitle")}</Text>

      <View style={styles.grid}>
        <Stat label={t("stats.xp")} value={num(profile?.xp ?? 0)} />
        <Stat
          label={`${t("stats.streak")} 🔥`}
          value={num(liveStreak(profile, now))}
          hint={t("progress.bestStreak", { count: num(profile?.longest_streak ?? 0) })}
        />
        <Stat label={t("progress.knownWords")} value={`${num(known)}/${num(items.length)}`} />
        <Stat label={t("progress.lessonsDone")} value={num(lessonsDone)} />
      </View>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t("goal.title")}</Text>
        <Text style={styles.muted}>
          {t("progress.answersToday", { done: num(Math.min(doneToday, goal)), goal: num(goal) })}
          {doneToday >= goal ? ` · ${t("progress.goalMet")}` : ""}
        </Text>
        <View style={styles.chips} accessibilityLabel={t("progress.chooseGoal")}>
          {GOAL_OPTIONS.map((option) => (
            <Chip key={option} label={num(option)} selected={goal === option} onPress={() => setDailyGoal(option)} />
          ))}
        </View>
        <ProgressBar value={Math.min(doneToday, goal)} max={goal} />
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t("progress.wordStatus")}</Text>
        <View style={styles.levels}>
          <Level value={num(fresh)} label={t("progress.new")} bg={colors.background} fg={colors.textBody} />
          <Level value={num(learning)} label={t("progress.learning")} bg={colors.amberSoft} fg={colors.amber} />
          <Level value={num(strong)} label={t("progress.strong")} bg={colors.primarySoft} fg={colors.primaryDark} />
        </View>
        {due > 0 ? (
          <Button title={t("progress.reviewDue", { count: num(due) })} onPress={() => router.navigate("/practice")} />
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>{t("progress.byTopic")}</Text>
        {content.categories.map((category) => {
          const inCategory = items.filter((i) => i.category_ids?.includes(category.id));
          const knownHere = inCategory.filter((i) => progress[i.id]?.known).length;
          return (
            <View key={category.id} style={styles.topic}>
              <View style={styles.topicRow}>
                <Text style={styles.topicName}>{localized(category, "name")}</Text>
                <Text style={styles.muted}>
                  {num(knownHere)}/{num(inCategory.length)}
                </Text>
              </View>
              <ProgressBar value={knownHere} max={inCategory.length} />
            </View>
          );
        })}
      </Card>

      {hardWords.length > 0 ? (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>{t("progress.hardWords")}</Text>
          {hardWords.map((item) => (
            <View key={item.id} style={styles.hardRow}>
              <View style={styles.flex}>
                <Text style={styles.hardMeaning}>{meaningOf(item)}</Text>
                <Text style={styles.muted}>{pronunciationOf(item)}</Text>
              </View>
              <View style={styles.hardRight}>
                <ArabicText style={styles.hardArabic}>{item.arabic}</ArabicText>
                <Badge tone="red">{t("progress.mistakes", { count: num(progress[item.id].times_wrong) })}</Badge>
              </View>
            </View>
          ))}
        </Card>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card style={styles.stat}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </Card>
  );
}

function Level({ value, label, bg, fg }: { value: string; label: string; bg: string; fg: string }) {
  return (
    <View style={[styles.level, { backgroundColor: bg }]}>
      <Text style={[styles.levelValue, { color: fg }]}>{value}</Text>
      <Text style={styles.levelLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  subtitle: { fontSize: 15, color: colors.textMuted },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  stat: { flexBasis: "47%", flexGrow: 1, padding: spacing.lg },
  statValue: { marginTop: spacing.xs, fontSize: 26, fontWeight: "700", color: colors.text },
  hint: { marginTop: 2, fontSize: 12, color: colors.textMuted },
  section: { padding: spacing.xl, gap: spacing.md },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  muted: { fontSize: 14, color: colors.textMuted },
  chips: { flexDirection: "row", gap: spacing.sm },
  levels: { flexDirection: "row", gap: spacing.md },
  level: { flex: 1, borderRadius: radius.lg, padding: spacing.md, alignItems: "center" },
  levelValue: { fontSize: 22, fontWeight: "700" },
  levelLabel: { fontSize: 12, color: colors.textMuted },
  topic: { gap: spacing.xs },
  topicRow: { flexDirection: "row", justifyContent: "space-between" },
  topicName: { fontSize: 14, fontWeight: "500", color: colors.textBody, flexShrink: 1 },
  hardRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, paddingVertical: spacing.xs },
  hardMeaning: { fontSize: 15, fontWeight: "500", color: colors.text },
  hardRight: { alignItems: "flex-end", gap: spacing.xs },
  hardArabic: { fontSize: 20 },
});
