// Small building blocks used on every screen (the app version of the
// website's components/ui.jsx and lib/styles.js)
import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { colors, radius, shadow, spacing } from "@/constants/theme";
import { useLocale } from "@/context/LocaleContext";

// ---------- Text ----------

// Arabic text, always right to left
export function ArabicText({ style, children }: { style?: StyleProp<TextStyle>; children: ReactNode }) {
  return <Text style={[styles.arabic, style]}>{children}</Text>;
}

// ---------- Button ----------

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  title: string;
  variant?: ButtonVariant;
  size?: "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  icon,
  style,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: Boolean(isDisabled), busy: loading }}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        size === "lg" && styles.buttonLg,
        buttonVariants[variant],
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" || variant === "danger" ? colors.white : colors.primaryDark} />
      ) : (
        <>
          {icon}
          <Text style={[styles.buttonText, size === "lg" && styles.buttonTextLg, buttonTextVariants[variant]]}>
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

// ---------- Layout ----------

export function Card({ style, children }: { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// A card that opens something when pressed
export function PressableCard({
  style,
  children,
  ...rest
}: Omit<PressableProps, "style" | "children"> & { style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed, rest.disabled && styles.disabled, style]}
      {...rest}
    >
      {children}
    </Pressable>
  );
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.pageHeader}>
      <Text style={styles.pageTitle}>{title}</Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <View
      style={styles.progressTrack}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max, now: value }}
    >
      <View style={[styles.progressFill, { width: `${percent}%` }]} />
    </View>
  );
}

// ---------- Feedback ----------

export function Loading() {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

type Tone = "error" | "success" | "info";

export function Alert({ tone = "error", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <View style={[styles.alert, alertTones[tone]]} accessibilityRole="alert">
      <Text style={[styles.alertText, alertTextTones[tone]]}>{children}</Text>
    </View>
  );
}

// Full-screen error with a retry button
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useLocale();
  return (
    <View style={[styles.center, { padding: spacing.xxl, gap: spacing.lg }]}>
      <Alert>{message}</Alert>
      {onRetry ? <Button title={t("common.retry")} variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card style={styles.empty}>
      <Text style={styles.emptyTitle}>{title}</Text>
      {children ? <Text style={styles.emptyText}>{children}</Text> : null}
    </Card>
  );
}

type BadgeTone = "slate" | "emerald" | "amber" | "sky" | "red";

export function Badge({ tone = "slate", children }: { tone?: BadgeTone; children: ReactNode }) {
  return (
    <View style={[styles.badge, { backgroundColor: badgeColors[tone].bg }]}>
      <Text style={[styles.badgeText, { color: badgeColors[tone].fg }]}>{children}</Text>
    </View>
  );
}

// ---------- Inputs ----------

export function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && styles.pressed]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

interface FieldProps extends TextInputProps {
  label: string;
  hint?: string;
}

export function Field({ label, hint, style, ...rest }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textFaint}
        style={[styles.input, rest.multiline && styles.inputMultiline, style]}
        accessibilityLabel={label}
        {...rest}
      />
      {hint ? <Text style={styles.fieldHint}>{hint}</Text> : null}
    </View>
  );
}

// ---------- Styles ----------

const buttonVariants = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  ghost: { backgroundColor: "transparent" },
  danger: { backgroundColor: colors.red },
});

const buttonTextVariants = StyleSheet.create({
  primary: { color: colors.white },
  secondary: { color: colors.text },
  ghost: { color: colors.primaryDark },
  danger: { color: colors.white },
});

const alertTones = StyleSheet.create({
  error: { backgroundColor: colors.redSoft, borderColor: "#fecaca" },
  success: { backgroundColor: colors.primarySoft, borderColor: "#a7f3d0" },
  info: { backgroundColor: colors.skySoft, borderColor: "#bae6fd" },
});

const alertTextTones = StyleSheet.create({
  error: { color: "#b91c1c" },
  success: { color: colors.primaryDeep },
  info: { color: "#075985" },
});

const badgeColors: Record<BadgeTone, { bg: string; fg: string }> = {
  slate: { bg: colors.divider, fg: colors.textBody },
  emerald: { bg: "#d1fae5", fg: colors.primaryDeep },
  amber: { bg: "#fef3c7", fg: colors.amberText },
  sky: { bg: "#e0f2fe", fg: "#075985" },
  red: { bg: "#fee2e2", fg: "#991b1b" },
};

const styles = StyleSheet.create({
  arabic: { writingDirection: "rtl", color: colors.primaryDark, fontWeight: "700" },
  button: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  buttonLg: { minHeight: 52, paddingHorizontal: spacing.xl },
  buttonText: { fontSize: 15, fontWeight: "600" },
  buttonTextLg: { fontSize: 17 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.5 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  cardPressed: { borderColor: colors.primaryBorder },
  pageHeader: { marginBottom: spacing.lg },
  pageTitle: { fontSize: 26, fontWeight: "700", color: colors.text },
  pageSubtitle: { marginTop: spacing.xs, fontSize: 15, color: colors.textMuted },
  progressTrack: {
    flex: 1,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.divider,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.full, backgroundColor: colors.primary },
  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background },
  alert: { borderWidth: 1, borderRadius: radius.md, padding: spacing.md, alignSelf: "stretch" },
  alertText: { fontSize: 14, lineHeight: 20 },
  empty: { padding: spacing.xxl, alignItems: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: colors.text, textAlign: "center" },
  emptyText: { marginTop: spacing.sm, color: colors.textMuted, textAlign: "center", lineHeight: 20 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: { fontSize: 12, fontWeight: "600" },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: 14, fontWeight: "500", color: colors.textBody },
  chipTextSelected: { color: colors.white },
  field: { gap: 6 },
  fieldLabel: { fontSize: 14, fontWeight: "500", color: colors.textBody },
  fieldHint: { fontSize: 12, color: colors.textMuted },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  inputMultiline: { minHeight: 110, paddingTop: spacing.md, textAlignVertical: "top" },
});
