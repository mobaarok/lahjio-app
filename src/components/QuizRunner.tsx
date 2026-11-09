// Shows one multiple-choice question at a time.
// questions come from lib/quiz.ts makeQuestions().
// onAnswer(itemId, correct) runs after every answer; onFinish(score) at the end.
// arabicFirst (reading courses) shows the Arabic big, so learners practise reading it.
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import type { Question } from "@/lib/quiz";
import { playWord } from "@/lib/speak";
import type { Item } from "@/lib/types";
import { AudioButton } from "./AudioButton";
import { Screen } from "./Screen";
import { ArabicText, Button, Card, ProgressBar } from "./ui";

interface QuizRunnerProps {
  questions: Question[];
  onAnswer?: (itemId: string, correct: boolean) => void;
  onFinish: (score: number) => void;
  onClose?: () => void;
  arabicFirst?: boolean;
}

export function QuizRunner({ questions, onAnswer, onFinish, onClose, arabicFirst = false }: QuizRunnerProps) {
  const { t, num, meaningOf, pronunciationOf } = useLocale();
  const [index, setIndex] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const question = questions[index];
  const answered = selectedId !== null;
  const isRight = selectedId === question.item.id;

  // Listen and read questions play the word as soon as they appear.
  // "Pick the Arabic" waits until it's answered, so the sound doesn't give it away.
  useEffect(() => {
    if (question.type !== "bn-ar") playWord(question.item);
  }, [question]);

  function choose(option: Item) {
    if (answered) return;
    const correct = option.id === question.item.id;
    setSelectedId(option.id);
    if (question.type === "bn-ar") playWord(question.item); // hear the right answer
    if (correct) setScore((s) => s + 1);
    onAnswer?.(question.item.id, correct);
  }

  function next() {
    if (index + 1 >= questions.length) {
      onFinish(score);
      return;
    }
    setIndex(index + 1);
    setSelectedId(null);
  }

  // Green for the right answer, red for a wrong pick, faded for the rest
  function optionStyle(option: Item) {
    if (!answered) return null;
    if (option.id === question.item.id) return styles.optionRight;
    if (option.id === selectedId) return styles.optionWrong;
    return styles.optionFaded;
  }

  const showArabicOptions = question.type === "bn-ar";

  return (
    <Screen edges={["top", "bottom"]}>
      <View style={styles.topBar}>
        {onClose ? (
          <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel={t("common.close")} hitSlop={10}>
            <Ionicons name="close" size={26} color={colors.textMuted} />
          </Pressable>
        ) : null}
        <ProgressBar value={index + (answered ? 1 : 0)} max={questions.length} />
        <Text style={styles.counter}>
          {num(index + 1)}/{num(questions.length)}
        </Text>
      </View>

      <Card style={styles.promptCard}>
        <Text style={styles.prompt}>{t(`quiz.prompt.${question.type}`)}</Text>

        {question.type === "ar-bn" &&
          (arabicFirst ? (
            <View style={styles.row}>
              <ArabicText style={styles.arabicBig}>{question.item.arabic}</ArabicText>
              <AudioButton item={question.item} size="sm" />
            </View>
          ) : (
            <>
              {/* Most learners can't read Arabic yet: pronunciation big, Arabic small */}
              <View style={styles.row}>
                <Text style={styles.pronunciationBig}>{pronunciationOf(question.item)}</Text>
                <AudioButton item={question.item} size="sm" />
              </View>
              <ArabicText style={styles.arabicSmall}>{question.item.arabic}</ArabicText>
            </>
          ))}

        {question.type === "bn-ar" && <Text style={styles.meaningBig}>{meaningOf(question.item)}</Text>}

        {question.type === "listen" && (
          <View style={styles.listen}>
            <AudioButton item={question.item} size="lg" />
            {/* The pronunciation helps when the phone's voice is unclear */}
            <Text style={styles.pronunciationBig}>{pronunciationOf(question.item)}</Text>
          </View>
        )}
      </Card>

      <View style={styles.options}>
        {question.options.map((option) => (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            onPress={() => choose(option)}
            disabled={answered}
            style={({ pressed }) => [styles.option, pressed && styles.optionPressed, optionStyle(option)]}
          >
            {showArabicOptions && arabicFirst ? (
              <ArabicText style={styles.optionArabicOnly}>{option.arabic}</ArabicText>
            ) : showArabicOptions ? (
              <View style={styles.optionSplit}>
                <Text style={styles.optionText}>{pronunciationOf(option)}</Text>
                <ArabicText style={styles.optionArabic}>{option.arabic}</ArabicText>
              </View>
            ) : (
              <Text style={styles.optionText}>{meaningOf(option)}</Text>
            )}
          </Pressable>
        ))}
      </View>

      {answered && (
        <View style={styles.feedback}>
          <Text style={[styles.feedbackTitle, { color: isRight ? colors.primaryDark : colors.red }]}>
            {isRight ? t("quiz.right") : t("quiz.wrong")}
          </Text>
          {/* Arabic on its own line, so the right-to-left text doesn't flip the order */}
          <ArabicText style={styles.feedbackArabic}>{question.item.arabic}</ArabicText>
          <Text style={styles.feedbackText}>
            {pronunciationOf(question.item)} · {meaningOf(question.item)}
          </Text>
          <Button
            title={index + 1 >= questions.length ? t("quiz.seeResult") : t("quiz.next")}
            onPress={next}
            size="lg"
          />
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  counter: { fontSize: 14, color: colors.textMuted },
  promptCard: { padding: spacing.xxl, alignItems: "center", gap: spacing.sm },
  prompt: { fontSize: 14, fontWeight: "500", color: colors.textMuted, textAlign: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  arabicBig: { fontSize: 44 },
  arabicSmall: { fontSize: 20, color: colors.textMuted, fontWeight: "400" },
  pronunciationBig: { fontSize: 28, fontWeight: "700", color: colors.primaryDark, textAlign: "center", flexShrink: 1 },
  meaningBig: { marginTop: spacing.sm, fontSize: 28, fontWeight: "700", color: colors.text, textAlign: "center" },
  listen: { alignItems: "center", gap: spacing.md, marginTop: spacing.sm },
  options: { gap: spacing.sm },
  option: {
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  optionPressed: { borderColor: colors.primaryBorder, backgroundColor: colors.primarySoft },
  optionRight: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionWrong: { borderColor: colors.redBorder, backgroundColor: colors.redSoft },
  optionFaded: { opacity: 0.55 },
  optionText: { fontSize: 18, fontWeight: "500", color: colors.text, flexShrink: 1 },
  optionSplit: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: spacing.md },
  optionArabic: { fontSize: 18, color: colors.textMuted, fontWeight: "400" },
  optionArabicOnly: { fontSize: 26, color: colors.text, textAlign: "right" },
  feedback: { backgroundColor: colors.divider, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm },
  feedbackTitle: { fontSize: 17, fontWeight: "700" },
  feedbackText: { fontSize: 15, color: colors.textBody },
  feedbackArabic: { fontSize: 20, alignSelf: "flex-start" },
});
