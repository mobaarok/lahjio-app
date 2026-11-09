// Buttons to choose the interface language
import { StyleSheet, View } from "react-native";
import { spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";
import { LOCALES } from "@/i18n/locales";
import { Chip } from "./ui";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.row}>
      {LOCALES.map((l) => (
        <Chip key={l.code} label={l.label} selected={locale === l.code} onPress={() => setLocale(l.code)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
});
