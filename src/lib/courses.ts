// Course helpers: which lessons are open, finished, and what to do next
import { contentLanguage, type LocaleCode } from "@/i18n/locales";
import type { Course, Lesson, LessonProgressMap } from "./types";

// Courses made for this interface language. Admins tick the languages on
// each course; old courses without the field show for everyone.
// Hindi and Urdu see the English courses (see content in i18n/locales.ts).
export function coursesForLocale(courses: Course[], locale: LocaleCode): Course[] {
  const language = contentLanguage(locale);
  return courses.filter((c) => c.languages?.includes(language) ?? true);
}

function isCompleted(lessonProgress: LessonProgressMap, lesson: Lesson): boolean {
  return lessonProgress[lesson.id]?.status === "completed";
}

export interface LessonState {
  lesson: Lesson;
  completed: boolean;
  unlocked: boolean;
}

// Lessons unlock in order: the first is always open, the rest open once the
// previous lesson is completed
export function lessonStates(course: Course, lessonProgress: LessonProgressMap): LessonState[] {
  return course.lessons.map((lesson, index) => {
    const completed = isCompleted(lessonProgress, lesson);
    const previousDone = index === 0 || isCompleted(lessonProgress, course.lessons[index - 1]);
    return { lesson, completed, unlocked: completed || previousDone };
  });
}

export function completedCount(course: Course, lessonProgress: LessonProgressMap): number {
  return course.lessons.filter((lesson) => isCompleted(lessonProgress, lesson)).length;
}

export function nextLesson(course: Course, lessonProgress: LessonProgressMap): Lesson | null {
  return lessonStates(course, lessonProgress).find((s) => s.unlocked && !s.completed)?.lesson ?? null;
}

// The course to suggest on the home screen: one already started, else the first
export function courseToContinue(courses: Course[], lessonProgress: LessonProgressMap): Course | null {
  const withLessons = courses.filter((c) => c.lessons.length > 0);
  const started = withLessons.find((c) => {
    const done = completedCount(c, lessonProgress);
    return done > 0 && done < c.lessons.length;
  });
  return started ?? withLessons.find((c) => nextLesson(c, lessonProgress)) ?? null;
}
