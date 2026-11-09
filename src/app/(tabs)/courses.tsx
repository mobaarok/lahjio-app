// Published courses for the current language, with the learner's progress
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { ContentLanguageNotice } from "@/components/ContentLanguageNotice";
import { Screen } from "@/components/Screen";
import { Badge, EmptyState, ErrorState, Loading, PageHeader, PressableCard, ProgressBar } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import type { MessageKey } from "@/i18n/messages";
import { completedCount, coursesForLocale } from "@/lib/courses";

export default function CoursesScreen() {
  const { content, loading, error, reload } = useContent();
  const { lessonProgress } = useProgress();
  const { t, num, locale, localized } = useLocale();

  if (loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const courses = coursesForLocale(content.courses, locale);

  return (
    <Screen>
      <PageHeader title={t("courses.title")} subtitle={t("courses.subtitle")} />
      <ContentLanguageNotice />

      {courses.length === 0 ? (
        <EmptyState title={t("courses.soonTitle")}>{t("courses.soonText")}</EmptyState>
      ) : (
        courses.map((course) => {
          const done = completedCount(course, lessonProgress);
          const total = course.lessons.length;
          return (
            <PressableCard
              key={course.id}
              style={styles.card}
              onPress={() => router.push({ pathname: "/course/[courseId]", params: { courseId: course.id } })}
            >
              <View style={styles.badges}>
                <Badge tone="emerald">{t(`level.${course.level}` as MessageKey)}</Badge>
                <Badge>{t(`courseType.${course.type}` as MessageKey)}</Badge>
              </View>
              <Text style={styles.title}>{localized(course, "title")}</Text>
              <Text style={styles.description} numberOfLines={2}>
                {localized(course, "description")}
              </Text>
              <View style={styles.progress}>
                <ProgressBar value={done} max={total} />
                <Text style={styles.count}>{t("courses.lessonsDone", { done: num(done), total: num(total) })}</Text>
              </View>
            </PressableCard>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.xl, gap: spacing.sm },
  badges: { flexDirection: "row", gap: spacing.xs },
  title: { fontSize: 19, fontWeight: "700", color: colors.text },
  description: { fontSize: 15, color: colors.textMuted, lineHeight: 21 },
  progress: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.xs },
  count: { fontSize: 13, color: colors.textMuted },
});
