import { describe, expect, it } from "vitest";
import { cybersecurityCourseId, getCourseChapters, getSourceChapter } from "@/lib/chapters";

describe("Capitolo 2 nel catalogo del corso", () => {
  const storedChapter = {
    id: "10000000-0000-4000-8000-000000000101",
    title: "1.1 — Lezione dal database",
    position: 1,
    content: { lesson: "cybersecurity-1-1" },
  };

  it("accoda tutte le lezioni al solo corso Cybersecurity e risolve ciascun link", () => {
    const chapters = getCourseChapters(cybersecurityCourseId, [storedChapter]);
    expect(chapters.map((chapter) => chapter.position)).toEqual([1, 6, 7, 8, 9, 10, 11]);
    expect(chapters[0]).toBe(storedChapter);
    for (const chapter of chapters.slice(1)) {
      expect(getSourceChapter(chapter.id)).toEqual({
        ...chapter,
        course_id: cybersecurityCourseId,
      });
    }
    expect(getSourceChapter("cybersecurity-2-7")).toBeUndefined();
    expect(getCourseChapters("another-course", [storedChapter])).toEqual([storedChapter]);
  });

  it("mantiene il capitolo dal database se esiste già per la stessa lezione", () => {
    const chapter = {
      ...storedChapter,
      position: 6,
      content: { lesson: "cybersecurity-2-1" },
    };
    const chapters = getCourseChapters(cybersecurityCourseId, [chapter]);
    expect(chapters).toHaveLength(6);
    expect(chapters[0]).toBe(chapter);
  });
});
