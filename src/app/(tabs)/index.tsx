// Home: streak, XP, daily goal, next lesson and word of the day
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AudioButton } from "@/components/AudioButton";
import { ContentLanguageNotice } from "@/components/ContentLanguageNotice";
import { Screen } from "@/components/Screen";
import { Alert, ArabicText, Card, ErrorState, Loading, PressableCard, ProgressBar } from "@/components/ui";
import { brandGradient, colors, radius, spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import { useNow } from "@/hooks/useNow";
import { courseToContinue, coursesForLocale, nextLesson } from "@/lib/courses";
import { DAY, DEFAULT_DAILY_GOAL, isDue, liveStreak, todayCount } from "@/lib/progress";

export default function HomeScreen() {
  const { user } = useAuth();
  const { content, loading, error, reload } = useContent();
  const progressState = useProgress();
  const { progress, lessonProgress, profile } = progressState;
  const { t, num, locale, meaningOf, pronunciationOf, localized } = useLocale();
  const now = useNow();

  if (loading || progressState.loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const name = user?.displayName || t("dashboard.friend");
  const goal = profile?.daily_goal ?? DEFAULT_DAILY_GOAL;
  const doneToday = todayCount(profile, now);
  const streak = liveStreak(profile, now);
  const due = content.items.filter((i) => isDue(progress[i.id], now)).length;

  const course = courseToContinue(coursesForLocale(content.courses, locale), lessonProgress);
  const lesson = course && nextLesson(course, lessonProgress);

  // Word of the day: the same for everyone on a given day (same as the website)
  const items = [...content.items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
  const wordOfDay = items.length > 0 ? items[Math.floor(now / DAY) % items.length] : null;

  return (
    <Screen>
      <View>
        <Text style={styles.greeting}>{t("dashboard.greeting", { name })}</Text>
        <Text style={styles.question}>{t("dashboard.question")}</Text>
      </View>

      <ContentLanguageNotice />
      {progressState.error ? <Alert>{t(progressState.error)}</Alert> : null}

      <View style={styles.statsRow}>
        <Card style={styles.stat}>
          <Text style={styles.statLabel}>🔥 {t("stats.streak")}</Text>
          <Text style={[styles.statValue, { color: colors.amber }]}>{num(streak)}</Text>
        </Card>
        <Card style={styles.stat}>
          <Text style={styles.statLabel}>{t("stats.xp")}</Text>
          <Text style={[styles.statValue, { color: colors.primaryDark }]}>{num(profile?.xp ?? 0)}</Text>
        </Card>
      </View>

      <Card style={styles.goal}>
        <View style={styles.goalHeader}>
          <Text style={styles.cardTitle}>{t("goal.title")}</Text>
          <Text style={styles.muted}>
            {num(Math.min(doneToday, goal))}/{num(goal)}
          </Text>
        </View>
        <ProgressBar value={Math.min(doneToday, goal)} max={goal} />
        <Text style={styles.muted}>{doneToday >= goal ? t("goal.done") : t("goal.hint")}</Text>
      </Card>

      {course && lesson ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: "/lesson/[courseId]/[lessonId]", params: { courseId: course.id, lessonId: lesson.id } })}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <LinearGradient colors={brandGradient} style={styles.next}>
            <Text style={styles.nextCourse}>{localized(course, "title")}</Text>
            <Text style={styles.nextTitle}>{t("dashboard.nextLesson", { title: localized(lesson, "title") })}</Text>
            <View style={styles.nextButton}>
              <Text style={styles.nextButtonText}>{t("dashboard.continue")}</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.primaryDeep} />
            </View>
          </LinearGradient>
        </Pressable>
      ) : null}

      <ActionCard
        icon="layers-outline"
        tint={colors.amber}
        tintBg={colors.amberSoft}
        title={t("dashboard.review")}
        text={due > 0 ? t("dashboard.reviewWaiting", { count: num(due) }) : t("dashboard.reviewNone")}
        onPress={() => router.push("/practice")}
      />
      <ActionCard
        icon="help-circle-outline"
        tint={colors.sky}
        tintBg={colors.skySoft}
        title={t("nav.quiz")}
        text={t("dashboard.quizText", { count: num(10) })}
        onPress={() => router.push("/quiz")}
      />

      {wordOfDay ? (
        <Card style={styles.word}>
          <Text style={styles.wordLabel}>{t("dashboard.wordOfDay")}</Text>
          <View style={styles.wordRow}>
            <View style={styles.flex}>
              <Text style={styles.wordMeaning}>{meaningOf(wordOfDay)}</Text>
              <Text style={styles.muted}>{pronunciationOf(wordOfDay)}</Text>
            </View>
            <ArabicText style={styles.wordArabic}>{wordOfDay.arabic}</ArabicText>
            <AudioButton item={wordOfDay} />
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

interface ActionCardProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  tint: string;
  tintBg: string;
  title: string;
  text: string;
  onPress: () => void;
}

function ActionCard({ icon, tint, tintBg, title, text, onPress }: ActionCardProps) {
  return (
    <PressableCard style={styles.action} onPress={onPress}>
      <View style={[styles.actionIcon, { backgroundColor: tintBg }]}>
        <Ionicons name={icon} size={24} color={tint} />
      </View>
      <View style={styles.flex}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.muted}>{text}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textFaint} />
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  greeting: { fontSize: 24, fontWeight: "700", color: colors.text },
  question: { marginTop: spacing.xs, fontSize: 15, color: colors.textMuted },
  statsRow: { flexDirection: "row", gap: spacing.md },
  stat: { flex: 1, padding: spacing.lg },
  statLabel: { fontSize: 13, color: colors.textMuted },
  statValue: { marginTop: spacing.xs, fontSize: 30, fontWeight: "700" },
  goal: { padding: spacing.xl, gap: spacing.md },
  goalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  muted: { fontSize: 14, color: colors.textMuted },
  pressed: { opacity: 0.9 },
  next: { borderRadius: radius.xl, padding: spacing.xl },
  nextCourse: { fontSize: 14, color: "#d1fae5" },
  nextTitle: { marginTop: spacing.xs, fontSize: 20, fontWeight: "700", color: colors.white },
  nextButton: {
    marginTop: spacing.lg,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  nextButtonText: { fontSize: 14, fontWeight: "600", color: colors.primaryDeep },
  action: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.lg },
  actionIcon: { width: 48, height: 48, borderRadius: radius.lg, alignItems: "center", justifyContent: "center" },
  word: { padding: spacing.xl, gap: spacing.md },
  wordLabel: { fontSize: 14, fontWeight: "500", color: colors.primaryDark },
  wordRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  wordMeaning: { fontSize: 20, fontWeight: "700", color: colors.text },
  wordArabic: { fontSize: 28, flexShrink: 1 },
});
