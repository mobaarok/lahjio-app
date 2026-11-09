// Privacy and terms pages: a subtitle, then titled sections (same text as the website)
import { StyleSheet, Text } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import type { MessageKey } from "@/i18n/messages";
import { Screen } from "./Screen";
import { Card } from "./ui";

export function PolicyPage({ subtitle, sections }: { subtitle: MessageKey; sections: [MessageKey, MessageKey][] }) {
  const { t } = useLocale();

  return (
    <Screen edges={["bottom"]}>
      <Text style={styles.subtitle}>{t(subtitle)}</Text>
      {sections.map(([title, text]) => (
        <Card key={title} style={styles.card}>
          <Text style={styles.title}>{t(title)}</Text>
          <Text style={styles.text}>{t(text)}</Text>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { fontSize: 15, color: colors.textMuted },
  card: { padding: spacing.xl, gap: spacing.sm },
  title: { fontSize: 17, fontWeight: "600", color: colors.text },
  text: { fontSize: 15, color: colors.textBody, lineHeight: 22 },
});
