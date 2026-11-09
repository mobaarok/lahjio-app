// Flashcard practice with spaced repetition. The deck is fixed when a session
// starts, so marking a card doesn't reshuffle the cards still to come.
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState, type ComponentProps } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { ChipRow } from "@/components/ChipRow";
import { Flashcard } from "@/components/Flashcard";
import { ResultScreen } from "@/components/ResultScreen";
import { Screen } from "@/components/Screen";
import { Button, ErrorState, Loading, PageHeader, PressableCard, ProgressBar } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import { useNow } from "@/hooks/useNow";
import { shuffled } from "@/lib/format";
import { isDue, XP_CORRECT, XP_WRONG } from "@/lib/progress";
import type { Item, ProgressMap } from "@/lib/types";

const SESSION_SIZE = 20; // short sessions are easier to finish

type Mode = "due" | "new" | "hard" | "all";

const modes: { id: Mode; icon: ComponentProps<typeof Ionicons>["name"] }[] = [
  { id: "due", icon: "flame-outline" },
  { id: "new", icon: "add-circle-outline" },
  { id: "hard", icon: "alert-circle-outline" },
  { id: "all", icon: "shuffle-outline" },
];

// Each mode picks which cards go into the deck
function itemsForMode(mode: Mode, items: Item[], progress: ProgressMap, now: number): Item[] {
  if (mode === "due") {
    return items
      .filter((item) => isDue(progress[item.id], now))
      .sort((a, b) => (progress[a.id].next_review_at ?? 0) - (progress[b.id].next_review_at ?? 0));
  }
  if (mode === "new") return items.filter((item) => !progress[item.id]);
  if (mode === "hard") return items.filter((item) => progress[item.id] && !progress[item.id].known);
  return items;
}

export default function PracticeScreen() {
  const { content, loading, error, reload } = useContent();
  const progressState = useProgress();
  const { progress, recordAnswer } = progressState;
  const { t, num, localized } = useLocale();
  const now = useNow();

  const [categoryId, setCategoryId] = useState("all");
  const [deck, setDeck] = useState<Item[] | null>(null); // null = choosing a mode
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState({ known: 0, unknown: 0 });

  if (loading || progressState.loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const items = content.items.filter((item) => categoryId === "all" || item.category_ids?.includes(categoryId));

  function start(mode: Mode) {
    let cards = itemsForMode(mode, items, progress, now);
    if (mode !== "due") cards = shuffled(cards);
    setDeck(cards.slice(0, SESSION_SIZE));
    setIndex(0);
    setFlipped(false);
    setResults({ known: 0, unknown: 0 });
  }

  function mark(known: boolean) {
    if (!deck) return;
    recordAnswer(deck[index].id, known);
    setResults((r) => ({ known: r.known + (known ? 1 : 0), unknown: r.unknown + (known ? 0 : 1) }));
    setIndex(index + 1);
    setFlipped(false);
  }

  // 1. Pick a mode
  if (!deck) {
    const topicOptions = [
      { value: "all", label: t("filter.allTopics") },
      ...content.categories.map((c) => ({ value: c.id, label: localized(c, "name") })),
    ];

    return (
      <Screen>
        <PageHeader title={t("practice.title")} subtitle={t("practice.subtitle", { count: num(SESSION_SIZE) })} />
        <ChipRow options={topicOptions} selected={categoryId} onSelect={setCategoryId} />

        {modes.map((mode) => {
          const count = itemsForMode(mode.id, items, progress, now).length;
          return (
            <PressableCard key={mode.id} style={styles.mode} disabled={count === 0} onPress={() => start(mode.id)}>
              <View style={styles.modeIcon}>
                <Ionicons name={mode.icon} size={24} color={colors.primaryDark} />
              </View>
              <View style={styles.flex}>
                <Text style={styles.modeTitle}>{t(`practice.mode.${mode.id}`)}</Text>
                <Text style={styles.muted}>{t(`practice.mode.${mode.id}Text`)}</Text>
              </View>
              <Text style={styles.modeCount}>{num(count)}</Text>
            </PressableCard>
          );
        })}

        <Button title={`${t("practice.quizPrompt")} ${t("practice.quizLink")}`} variant="ghost" onPress={() => router.push("/quiz")} />
      </Screen>
    );
  }

  // 3. Session finished
  if (index >= deck.length) {
    return (
      <ResultScreen
        title={t("practice.done")}
        score={results.known}
        total={deck.length}
        xp={results.known * XP_CORRECT + results.unknown * XP_WRONG}
      >
        <Button title={t("practice.again")} size="lg" onPress={() => setDeck(null)} />
        <Button title={t("common.goHome")} size="lg" variant="secondary" onPress={() => router.navigate("/")} />
      </ResultScreen>
    );
  }

  // 2. Practising
  const word = deck[index];
  return (
    <Screen>
      <View style={styles.topBar}>
        <Pressable onPress={() => setDeck(null)} accessibilityRole="button" accessibilityLabel={t("common.close")} hitSlop={10}>
          <Ionicons name="close" size={26} color={colors.textMuted} />
        </Pressable>
        <ProgressBar value={index} max={deck.length} />
        <Text style={styles.muted}>
          {num(index + 1)}/{num(deck.length)}
        </Text>
      </View>

      {/* A new key per card, so a flipped card doesn't spin back and reveal the next answer */}
      <Flashcard key={word.id} word={word} flipped={flipped} onFlip={() => setFlipped(!flipped)} />

      {flipped ? (
        <View style={styles.answerRow}>
          <Button title={t("practice.dontKnow")} size="lg" variant="danger" style={styles.flex} onPress={() => mark(false)} />
          <Button title={t("practice.know")} size="lg" style={styles.flex} onPress={() => mark(true)} />
        </View>
      ) : (
        <Button title={t("practice.showMeaning")} size="lg" variant="secondary" onPress={() => setFlipped(true)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  muted: { fontSize: 14, color: colors.textMuted },
  mode: { flexDirection: "row", alignItems: "center", gap: spacing.lg, padding: spacing.lg },
  modeIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  modeCount: { fontSize: 22, fontWeight: "700", color: colors.primaryDark },
  topBar: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  answerRow: { flexDirection: "row", gap: spacing.md },
});
