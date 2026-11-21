import { chapter2, cryptoLessonIds } from "@/content/lessons/chapter2";
import { requestLesson } from "@/content/lessons/request-response";
import type { Json } from "@/integrations/supabase/types";

export const cybersecurityCourseId = "10000000-0000-4000-8000-000000000001";

type CourseChapter = {
  id: string;
  title: string;
  position: number;
  content: Json;
};

const sourceChapters = cryptoLessonIds.map((id, index) => ({
  id,
  course_id: cybersecurityCourseId,
  title: chapter2[id].title,
  position: 6 + index,
  content: { lesson: id },
}));

const sourceLessonOrder = new Map<string | null, number>(
  cryptoLessonIds.map((id, index) => [id, index]),
);

export function getLessonKey(content: Json): string | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) return null;
  return typeof content["lesson"] === "string" ? content["lesson"] : null;
}

export function getSourceChapter(id: string) {
  return sourceChapters.find((chapter) => chapter.id === id);
}

export function getCourseChapters(courseId: string, storedChapters: readonly CourseChapter[]) {
  const chapters = [...storedChapters];
  if (courseId === cybersecurityCourseId) {
    const storedLessonKeys = new Set(chapters.map((chapter) => getLessonKey(chapter.content)));
    chapters.push(
      ...sourceChapters.filter((chapter) => !storedLessonKeys.has(chapter.content.lesson)),
    );
    // Older stored lessons can share a position with a source lesson after adding 2.0.
    chapters.sort(
      (a, b) =>
        a.position - b.position ||
        (sourceLessonOrder.get(getLessonKey(a.content)) ?? -1) -
          (sourceLessonOrder.get(getLessonKey(b.content)) ?? -1),
    );
  } else {
    chapters.sort((a, b) => a.position - b.position);
  }

  const parent = chapters.find((c) => getLessonKey(c.content) === "cybersecurity-1-4");
  if (!parent) return chapters;
  const storedIndex = chapters.findIndex((c) => getLessonKey(c.content) === requestLesson.key);
  const next = storedIndex >= 0 ? chapters.splice(storedIndex, 1)[0] : undefined;
  chapters.splice(chapters.indexOf(parent) + 1, 0, next ?? getRequestCompanion(parent));
  return chapters;
}

// A companion follows the real 1.4 row, including when that chapter moves to another course.
export function getRequestCompanion(parent: { id: string; position?: number }) {
  return {
    id: parent.id + "~" + requestLesson.key,
    title: requestLesson.title,
    position: parent.position ?? 0,
    content: { lesson: requestLesson.key },
  };
}

export function getRequestParentId(id: string) {
  const suffix = "~" + requestLesson.key;
  return id.endsWith(suffix) ? id.slice(0, -suffix.length) : null;
}
