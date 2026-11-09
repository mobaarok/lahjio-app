// All interface languages. English is the reference: every language has the same keys.
import bn from "./bn";
import en from "./en";
import hi from "./hi";
import ur from "./ur";

export type MessageKey = keyof typeof en;
export type Messages = Record<MessageKey, string>;

export const messages: Record<string, Messages> = { bn, en, hi, ur };
