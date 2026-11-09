// One course: its lessons, which are done, open or locked
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@/components/Screen";
import { Badge, Card, EmptyState, ErrorState, Loading, PressableCard, ProgressBar } from "@/components/ui";
import { brandGradient, colors, radius, spacing } from "@/constants/theme";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import type { MessageKey } from "@/i18n/messages";
import { completedCount, lessonStates } from "@/lib/courses";

export default function CourseScreen() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  const { content, loading, error, reload } = useContent();
  const { lessonProgress } = useProgress();
  const { t, num, localized } = useLocale();

  if (loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const course = content.courses.find((c) => c.id === courseId);
  if (!course) {
    return (
      <Screen edges={[]}>
        <EmptyState title={t("course.notFound")} />
      </Screen>
    );
  }

  const states = lessonStates(course, lessonProgress);
  const done = completedCount(course, lessonProgress);
  const topicName = Object.fromEntries(content.categories.map((c) => [c.id, localized(c, "name")]));

  return (
    <Screen edges={[]}>
      <Stack.Screen options={{ title: t("course.allCourses") }} />

      <LinearGradient colors={brandGradient} style={styles.hero}>
        <Badge tone="emerald">{t(`level.${course.level}` as MessageKey)}</Badge>
        <Text style={styles.title}>{localized(course, "title")}</Text>
        <Text style={styles.description}>{localized(course, "description")}</Text>
        <View style={styles.heroProgress}>
          <ProgressBar value={done} max={course.lessons.length} />
          <Text style={styles.heroCount}>
            {num(done)}/{num(course.lessons.length)}
          </Text>
        </View>
      </LinearGradient>

      {course.lessons.length === 0 ? <Text style={styles.empty}>{t("course.noLessons")}</Text> : null}

      {states.map(({ lesson, completed, unlocked }, index) => {
        const topic = lesson.category_id ? topicName[lesson.category_id] : undefined;
        const body = (
          <>
            <View style={[styles.circle, completed ? styles.circleDone : unlocked ? styles.circleOpen : styles.circleLocked]}>
              {completed ? (
                <Ionicons name="checkmark" size={22} color={colors.white} />
              ) : unlocked ? (
                <Text style={styles.circleText}>{num(index + 1)}</Text>
              ) : (
                <Ionicons name="lock-closed" size={16} color={colors.textFaint} />
              )}
            </View>
            <View style={styles.flex}>
              <Text style={styles.lessonTitle}>{localized(lesson, "title")}</Text>
              <Text style={styles.muted}>
                {t("course.itemCount", { count: num(lesson.item_ids?.length ?? 0) })}
                {topic ? ` · ${topic}` : ""}
              </Text>
            </View>
            {completed ? (
              <Badge tone="emerald">{t("course.best", { score: num(lessonProgress[lesson.id]?.best_score ?? 0) })}</Badge>
            ) : null}
          </>
        );

        return unlocked ? (
          <PressableCard
            key={lesson.id}
            style={styles.lesson}
            onPress={() =>
              router.push({ pathname: "/lesson/[courseId]/[lessonId]", params: { courseId: course.id, lessonId: lesson.id } })
            }
          >
            {body}
          </PressableCard>
        ) : (
          <Card key={lesson.id} style={[styles.lesson, styles.locked]}>
            <View accessibilityLabel={t("course.locked")} style={styles.lockedRow}>
              {body}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { borderRadius: radius.xl, padding: spacing.xxl, gap: spacing.sm },
  title: { fontSize: 24, fontWeight: "700", color: colors.white },
  description: { fontSize: 15, color: "#ecfdf5", lineHeight: 21 },
  heroProgress: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.md },
  heroCount: { color: colors.white, fontSize: 14 },
  empty: { textAlign: "center", color: colors.textMuted },
  lesson: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.lg },
  locked: { opacity: 0.6 },
  lockedRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.lg },
  circle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  circleDone: { backgroundColor: colors.primary },
  circleOpen: { backgroundColor: colors.primarySoft, borderWidth: 2, borderColor: colors.primary },
  circleLocked: { backgroundColor: colors.divider },
  circleText: { fontWeight: "700", color: colors.primaryDark, fontSize: 16 },
  lessonTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  muted: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
});
