// Shapes of the Firestore documents the app reads. Field names are snake_case,
// the same as on the website (see "Firestore data" in CLAUDE.md).

export type ItemType = "word" | "phrase";

export interface Item {
  id: string;
  type: ItemType;
  arabic: string;
  bangla: string;
  english?: string;
  bn_transliteration?: string;
  en_transliteration?: string;
  note_bn?: string;
  note_en?: string;
  category_ids?: string[];
  level?: string;
  audio?: string;
}

export interface Category {
  id: string;
  name_en?: string;
  name_bn?: string;
  order?: number;
}

export interface Lesson {
  id: string;
  title_bn?: string;
  title_en?: string;
  category_id?: string;
  item_ids?: string[];
  order?: number;
  is_free?: boolean;
}

export interface Course {
  id: string;
  title_bn?: string;
  title_en?: string;
  description_bn?: string;
  description_en?: string;
  type: string;
  level: string;
  languages?: string[];
  order?: number;
  is_free?: boolean;
  lessons: Lesson[];
}

export interface Content {
  version: number;
  items: Item[];
  categories: Category[];
  courses: Course[];
}

// users/{uid}/progress/{itemId}, with next_review_at in milliseconds
export interface ProgressEntry {
  known: boolean;
  box: number;
  times_correct: number;
  times_wrong: number;
  next_review_at: number | null;
}

// users/{uid}/lesson_progress/{lessonId}
export interface LessonProgressEntry {
  course_id: string;
  status: string;
  best_score: number;
}

// The streak, XP and goal fields of users/{uid}
export interface Profile {
  xp?: number;
  current_streak?: number;
  longest_streak?: number;
  last_active_date?: string;
  today_key?: string;
  today_count?: number;
  daily_goal?: number;
}

export type ProgressMap = Record<string, ProgressEntry>;
export type LessonProgressMap = Record<string, LessonProgressEntry>;
