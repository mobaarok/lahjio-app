// A sideways-scrolling row of filter chips, e.g. "All topics", "Greetings", ...
import { ScrollView, StyleSheet } from "react-native";
import { spacing } from "@/constants/theme";
import { Chip } from "./ui";

export interface ChipOption {
  value: string;
  label: string;
}

interface ChipRowProps {
  options: ChipOption[];
  selected: string;
  onSelect: (value: string) => void;
}

export function ChipRow({ options, selected, onSelect }: ChipRowProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      style={styles.scroll}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Bleeds to the screen edges so chips scroll under the side padding
  scroll: { marginHorizontal: -spacing.lg, flexGrow: 0 },
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
});
