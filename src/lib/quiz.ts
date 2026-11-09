import { shuffled } from "./format";
import type { Item } from "./types";

// Three kinds of question:
// "ar-bn"  see Arabic, pick the meaning
// "bn-ar"  see the meaning, pick the Arabic
// "listen" hear the Arabic, pick the meaning
export const QUESTION_TYPES = ["ar-bn", "bn-ar", "listen"] as const;
export type QuestionType = (typeof QUESTION_TYPES)[number];

export interface Question {
  item: Item;
  type: QuestionType;
  options: Item[];
}

// Builds up to `count` questions from `items`. Wrong options come from `pool`,
// preferring the same type (word or phrase) so the choices look alike.
export function makeQuestions(items: Item[], pool: Item[], count = 10): Question[] {
  return shuffled(items)
    .slice(0, count)
    .map((item) => {
      const others = pool.filter(
        (o) => o.id !== item.id && o.bangla !== item.bangla && o.arabic !== item.arabic
      );
      const sameType = shuffled(others.filter((o) => o.type === item.type));
      const otherType = shuffled(others.filter((o) => o.type !== item.type));
      const wrongOptions = [...sameType, ...otherType].slice(0, 3);

      return {
        item,
        type: QUESTION_TYPES[Math.floor(Math.random() * QUESTION_TYPES.length)],
        options: shuffled([item, ...wrongOptions]),
      };
    });
}
