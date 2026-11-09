// A 10-question multiple-choice quiz, optionally on one topic.
// Anyone can play; answers are only saved for logged-in learners.
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { ChipRow } from "@/components/ChipRow";
import { QuizRunner } from "@/components/QuizRunner";
import { ResultScreen } from "@/components/ResultScreen";
import { Screen } from "@/components/Screen";
import { Button, Card, ErrorState, Loading, PageHeader } from "@/components/ui";
import { colors, spacing } from "@/constants/theme";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import { XP_CORRECT, XP_WRONG } from "@/lib/progress";
import { makeQuestions, type Question } from "@/lib/quiz";

const QUESTION_COUNT = 10;

export default function QuizScreen() {
  const { content, loading, error, reload } = useContent();
  const { recordAnswer } = useProgress();
  const { user } = useAuth();
  const { t, num, localized } = useLocale();

  const [categoryId, setCategoryId] = useState("all");
  const [questions, setQuestions] = useState<Question[] | null>(null); // null = start screen
  const [finalScore, setFinalScore] = useState<number | null>(null);

  if (loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const pool = content.items;
  const topicItems = pool.filter((item) => categoryId === "all" || item.category_ids?.includes(categoryId));
  const close = () => (router.canGoBack() ? router.back() : router.replace("/"));

  function start() {
    setQuestions(makeQuestions(topicItems, pool, QUESTION_COUNT));
    setFinalScore(null);
  }

  if (questions && finalScore !== null) {
    const wrong = questions.length - finalScore;
    return (
      <ResultScreen
        title={t("quiz.done")}
        score={finalScore}
        total={questions.length}
        xp={finalScore * XP_CORRECT + wrong * XP_WRONG}
      >
        <Button title={t("quiz.playAgain")} size="lg" onPress={start} />
        <Button title={t("quiz.otherTopic")} size="lg" variant="secondary" onPress={() => setQuestions(null)} />
        {!user ? (
          <Button title={t("quiz.signupToSave")} variant="ghost" onPress={() => router.replace("/signup")} />
        ) : null}
      </ResultScreen>
    );
  }

  if (questions) {
    return <QuizRunner questions={questions} onAnswer={recordAnswer} onFinish={setFinalScore} onClose={() => setQuestions(null)} />;
  }

  const topicOptions = [
    { value: "all", label: t("filter.allTopics") },
    ...content.categories.map((c) => ({ value: c.id, label: localized(c, "name") })),
  ];

  return (
    <Screen edges={["top", "bottom"]}>
      <Button title={`← ${t("common.close")}`} variant="ghost" onPress={close} style={styles.back} />
      <PageHeader title={t("nav.quiz")} subtitle={t("quiz.subtitle", { count: num(QUESTION_COUNT) })} />

      <Card style={styles.card}>
        <Text style={styles.label}>{t("quiz.whichTopic")}</Text>
        <ChipRow options={topicOptions} selected={categoryId} onSelect={setCategoryId} />
        <Button title={t("quiz.start")} size="lg" disabled={topicItems.length < 2} onPress={start} />
        {topicItems.length < 2 ? <Text style={styles.muted}>{t("quiz.notEnough")}</Text> : null}
      </Card>

      {user ? (
        <View>
          <Button title={`${t("quiz.learnFirst")} ${t("quiz.practiceLink")}`} variant="ghost" onPress={() => router.replace("/practice")} />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: "flex-start", paddingHorizontal: 0 },
  card: { padding: spacing.xl, gap: spacing.lg, overflow: "hidden" },
  label: { fontSize: 16, fontWeight: "600", color: colors.text },
  muted: { textAlign: "center", fontSize: 14, color: colors.textMuted },
});
