// Learner content: published items, categories, courses and lessons.
// Saved on the phone and downloaded again only when meta/content.version
// changes, so the app opens fast and works offline after the first load.
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentSnapshot,
} from "firebase/firestore";
import { db } from "./firebase";
import { byOrder } from "./format";
import { readJson, writeJson } from "./storage";
import type { Category, Content, Course, Item, Lesson } from "./types";

const CACHE_KEY = "lahjio-content-v1";

// Firestore timestamps can't be saved as JSON, and learners don't need them
function toPlain<T>(snapshot: DocumentSnapshot): T {
  const data: Record<string, unknown> = { id: snapshot.id, ...snapshot.data() };
  delete data.created_at;
  delete data.updated_at;
  return data as T;
}

// Only published documents: the Firestore rules reject other queries
function published(path: string, ...segments: string[]) {
  return getDocs(query(collection(db, path, ...segments), where("status", "==", "published")));
}

async function fetchPublished(): Promise<Omit<Content, "version">> {
  const [items, categories, courses] = await Promise.all([
    published("items"),
    getDocs(collection(db, "categories")),
    published("courses"),
  ]);

  const courseList = courses.docs.map((d) => toPlain<Course>(d)).sort(byOrder);
  const lessons = await Promise.all(
    courseList.map((course) => published("courses", course.id, "lessons"))
  );
  courseList.forEach((course, i) => {
    course.lessons = lessons[i].docs.map((d) => toPlain<Lesson>(d)).sort(byOrder);
  });

  // Learners only see topics that have published words
  const itemList = items.docs.map((d) => toPlain<Item>(d));
  const usedTopics = new Set(itemList.flatMap((item) => item.category_ids ?? []));

  return {
    items: itemList,
    categories: categories.docs
      .map((d) => toPlain<Category>(d))
      .filter((c) => usedTopics.has(c.id))
      .sort(byOrder),
    courses: courseList,
  };
}

export async function loadContent(): Promise<Content> {
  const cached = await readJson<Content>(CACHE_KEY);
  let version: number;

  try {
    const meta = await getDoc(doc(db, "meta", "content"));
    version = meta.exists() ? (meta.data().version as number) : 0;
  } catch (err) {
    if (cached) return cached; // offline: use the saved copy
    throw err;
  }

  if (cached && cached.version === version) return cached;

  const content: Content = { version, ...(await fetchPublished()) };
  await writeJson(CACHE_KEY, content);
  return content;
}
