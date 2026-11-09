// A lesson has three stages: learn each item, take a short quiz, see results
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AudioButton } from "@/components/AudioButton";
import { QuizRunner } from "@/components/QuizRunner";
import { ResultScreen } from "@/components/ResultScreen";
import { Screen } from "@/components/Screen";
import { ArabicText, Button, Card, EmptyState, ErrorState, Loading, ProgressBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import { lessonStates } from "@/lib/courses";
import { XP_CORRECT, XP_LESSON, XP_WRONG } from "@/lib/progress";
import { makeQuestions, type Question } from "@/lib/quiz";
import type { Item } from "@/lib/types";

type Stage = "learn" | "quiz" | "done";

export default function LessonScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const { content, loading, error, reload } = useContent();
  const progressState = useProgress();
  const { lessonProgress, recordAnswer, completeLesson } = progressState;
  const { t, num, meaningOf, pronunciationOf, noteOf, localized } = useLocale();

  const [stage, setStage] = useState<Stage>("learn");
  const [cardIndex, setCardIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);

  if (loading || progressState.loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const course = content.courses.find((c) => c.id === courseId);
  const lessonIndex = course?.lessons.findIndex((l) => l.id === lessonId) ?? -1;
  const lesson = course?.lessons[lessonIndex];

  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  if (!course || !lesson) {
    return (
      <Screen>
        <EmptyState title={t("lesson.notFound")} />
        <Button title={t("course.allCourses")} variant="secondary" onPress={close} />
      </Screen>
    );
  }

  if (!lessonStates(course, lessonProgress)[lessonIndex].unlocked) {
    return (
      <Screen>
        <EmptyState title={t("lesson.lockedTitle")}>{t("lesson.lockedText")}</EmptyState>
        <Button title={t("lesson.backToCourse")} variant="secondary" onPress={close} />
      </Screen>
    );
  }

  // Only published items reach learners; skip any that were archived
  const itemById = new Map(content.items.map((i) => [i.id, i]));
  const items = (lesson.item_ids ?? []).map((id) => itemById.get(id)).filter((i): i is Item => Boolean(i));
  const next = course.lessons[lessonIndex + 1];
  // Reading courses ("Read Arabic") show the Arabic big instead of the pronunciation
  const arabicFirst = course.type === "reading";

  if (items.length === 0) {
    return (
      <Screen>
        <EmptyState title={t("lesson.emptyTitle")}>{t("lesson.emptyText")}</EmptyState>
        <Button title={t("lesson.backToCourse")} variant="secondary" onPress={close} />
      </Screen>
    );
  }

  function startQuiz() {
    setQuestions(makeQuestions(items, content?.items ?? items, Math.min(items.length, 10)));
    setStage("quiz");
  }

  function finishQuiz(finalScore: number) {
    if (!course || !lesson) return;
    setScore(finalScore);
    completeLesson(course.id, lesson.id, Math.round((finalScore / questions.length) * 100));
    setStage("done");
  }

  function restart() {
    setCardIndex(0);
    setStage("learn");
  }

  if (stage === "done") {
    const wrong = questions.length - score;
    return (
      <ResultScreen
        title={t("lesson.done")}
        score={score}
        total={questions.length}
        xp={XP_LESSON + score * XP_CORRECT + wrong * XP_WRONG}
      >
        {next ? (
          <Button
            title={t("dashboard.nextLesson", { title: localized(next, "title") })}
            size="lg"
            onPress={() =>
              router.replace({ pathname: "/lesson/[courseId]/[lessonId]", params: { courseId: course.id, lessonId: next.id } })
            }
          />
        ) : null}
        <Button title={t("lesson.again")} size="lg" variant="secondary" onPress={restart} />
        <Button title={t("lesson.backToCourse")} size="lg" variant="ghost" onPress={close} />
      </ResultScreen>
    );
  }

  if (stage === "quiz") {
    return (
      <QuizRunner questions={questions} onAnswer={recordAnswer} onFinish={finishQuiz} onClose={close} arabicFirst={arabicFirst} />
    );
  }

  // Learn stage: one item at a time
  const item = items[cardIndex];
  const isLast = cardIndex === items.length - 1;
  const note = noteOf(item);

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        <Pressable onPress={close} accessibilityRole="button" accessibilityLabel={t("lesson.exit")} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
        <ProgressBar value={cardIndex + 1} max={items.length} />
        <Text style={styles.counter}>
          {num(cardIndex + 1)}/{num(items.length)}
        </Text>
      </View>

      <Text style={styles.stageLabel}>
        {localized(lesson, "title")} · {t("lesson.learn")}
      </Text>

      <Card style={styles.card}>
        {/* Pronunciation first and big, so learners can say it straight away.
            Reading courses swap them, because reading the Arabic is the point. */}
        {arabicFirst ? (
          <>
            <ArabicText style={styles.arabicBig}>{item.arabic}</ArabicText>
            <Text style={styles.pronunciationSmall}>{pronunciationOf(item)}</Text>
          </>
        ) : (
          <>
            <Text style={styles.pronunciationBig}>{pronunciationOf(item)}</Text>
            <ArabicText style={styles.arabicSmall}>{item.arabic}</ArabicText>
          </>
        )}
        <AudioButton key={item.id} item={item} size="lg" autoPlay style={styles.audio} />
        <Text style={styles.meaning}>{meaningOf(item)}</Text>
      </Card>

      {/* Optional tip from the item: when to say it, or why */}
      {note ? (
        <View style={styles.note}>
          <Text style={styles.noteTitle}>💡 {t("lesson.note")}</Text>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ) : null}

      <View style={styles.navRow}>
        <Button
          title={t("lesson.previous")}
          size="lg"
          variant="secondary"
          style={styles.flex}
          disabled={cardIndex === 0}
          onPress={() => setCardIndex(cardIndex - 1)}
        />
        {isLast ? (
          <Button title={t("lesson.startQuiz")} size="lg" style={styles.flex} onPress={startQuiz} />
        ) : (
          <Button title={t("lesson.next")} size="lg" style={styles.flex} onPress={() => setCardIndex(cardIndex + 1)} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topBar: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  counter: { fontSize: 14, color: colors.textMuted },
  stageLabel: { fontSize: 14, fontWeight: "500", color: colors.primaryDark },
  card: { padding: spacing.xxl, alignItems: "center", gap: spacing.md },
  arabicBig: { fontSize: 56, textAlign: "center" },
  arabicSmall: { fontSize: 24, color: colors.textMuted, fontWeight: "400", textAlign: "center" },
  pronunciationBig: { fontSize: 34, fontWeight: "700", color: colors.primaryDark, textAlign: "center" },
  pronunciationSmall: { fontSize: 22, color: colors.textMuted, textAlign: "center" },
  audio: { marginVertical: spacing.md },
  meaning: { fontSize: 24, fontWeight: "700", color: colors.text, textAlign: "center" },
  note: {
    borderWidth: 1,
    borderColor: colors.amberBorder,
    backgroundColor: colors.amberSoft,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  noteTitle: { fontSize: 14, fontWeight: "600", color: colors.amberText },
  noteText: { fontSize: 15, color: colors.textBody, lineHeight: 21 },
  navRow: { flexDirection: "row", gap: spacing.md },
});
