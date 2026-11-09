// The frame shared by the login, signup and password reset screens
import type { ReactNode } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "@/constants/theme";
import { Screen } from "./Screen";
import { Card } from "./ui";

export function AuthForm({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Screen edges={["bottom"]}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
        <Card style={styles.card}>{children}</Card>
      </Screen>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  title: { fontSize: 26, fontWeight: "700", color: colors.text },
  subtitle: { marginTop: spacing.xs, fontSize: 15, color: colors.textMuted },
  card: { padding: spacing.xl, gap: spacing.lg },
});
