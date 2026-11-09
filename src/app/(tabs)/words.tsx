// The word and phrase library, with search and filters.
// FlatList only draws the cards on screen, so hundreds of words stay smooth.
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChipRow } from "@/components/ChipRow";
import { WordCard } from "@/components/WordCard";
import { EmptyState, ErrorState, Loading, PageHeader } from "@/components/ui";
import { colors, radius, spacing } from "@/constants/theme";
import { useContent } from "@/context/ContentContext";
import { useLocale } from "@/context/LocaleContext";
import { useProgress } from "@/context/ProgressContext";
import type { Item } from "@/lib/types";

const typeFilters = ["all", "word", "phrase"] as const;

export default function WordsScreen() {
  const { content, loading, error, reload } = useContent();
  const { progress } = useProgress();
  const { t, num, localized } = useLocale();

  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("all");
  const [categoryId, setCategoryId] = useState("all");

  const visible = useMemo(() => {
    if (!content) return [];
    const query = search.trim().toLowerCase();
    return content.items.filter(
      (item) =>
        (type === "all" || item.type === type) &&
        (categoryId === "all" || item.category_ids?.includes(categoryId)) &&
        [item.arabic, item.bangla, item.english, item.bn_transliteration, item.en_transliteration].some((text) =>
          (text ?? "").toLowerCase().includes(query)
        )
    );
  }, [content, search, type, categoryId]);

  if (loading) return <Loading />;
  if (error || !content) return <ErrorState message={t(error ?? "error.contentLoad")} onRetry={reload} />;

  const categoryName = Object.fromEntries(content.categories.map((c) => [c.id, localized(c, "name")]));
  const topicOptions = [
    { value: "all", label: t("filter.allTopics") },
    ...content.categories.map((c) => ({ value: c.id, label: localized(c, "name") })),
  ];

  const header = (
    <View style={styles.header}>
      <PageHeader title={t("words.title")} subtitle={t("words.subtitle")} />
      <View style={styles.search}>
        <Ionicons name="search" size={20} color={colors.textFaint} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder={t("words.search")}
          placeholderTextColor={colors.textFaint}
          accessibilityLabel={t("words.search")}
          style={styles.searchInput}
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>
      <ChipRow
        options={typeFilters.map((value) => ({ value, label: t(`type.${value}`) }))}
        selected={type}
        onSelect={setType}
      />
      <ChipRow options={topicOptions} selected={categoryId} onSelect={setCategoryId} />
      <Text style={styles.found}>{t("words.found", { count: num(visible.length) })}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList<Item>
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WordCard
            item={item}
            categoryLabel={categoryName[item.category_ids?.[0] ?? ""]}
            known={Boolean(progress[item.id]?.known)}
          />
        )}
        ListHeaderComponent={header}
        ListEmptyComponent={<EmptyState title={t("words.noneTitle")}>{t("words.noneText")}</EmptyState>}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        initialNumToRender={12}
      />
    </SafeAreaView>
  );
}

function Separator() {
  return <View style={{ height: spacing.md }} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  header: { gap: spacing.md, marginBottom: spacing.md },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
  },
  searchInput: { flex: 1, minHeight: 48, fontSize: 16, color: colors.text },
  found: { fontSize: 14, color: colors.textMuted },
});
