import { describe, expect, it } from "vitest";
import { getAdjacentChapters, getCourseChapters } from "@/lib/chapters";

const first = { id: "one", title: "Uno", position: 1, content: { lesson: "one" } };
const middle = { id: "two", title: "Due", position: 2, content: { lesson: "two" } };
const last = { id: "three", title: "Tre", position: 3, content: { lesson: "three" } };

describe("Navigazione tra capitoli", () => {
  it("collega il capitolo centrale ai due adiacenti", () => {
    expect(getAdjacentChapters([first, middle, last], middle.id)).toEqual({
      previous: first,
      next: last,
    });
  });

  it("omette il precedente sul primo e il successivo sull'ultimo", () => {
    expect(getAdjacentChapters([first, middle, last], first.id)).toEqual({
      previous: undefined,
      next: middle,
    });
    expect(getAdjacentChapters([first, middle, last], last.id)).toEqual({
      previous: middle,
      next: undefined,
    });
  });

  it("include la lezione compagna tra 1.4 e 1.5", () => {
    const parent = {
      id: "slide-14",
      title: "1.4",
      position: 4,
      content: { lesson: "cybersecurity-1-4" },
    };
    const following = {
      id: "slide-15",
      title: "1.5",
      position: 5,
      content: { lesson: "cybersecurity-1-5" },
    };
    const chapters = getCourseChapters("web", [following, parent]);
    const companion = chapters[1];

    expect(companion).toBeDefined();
    expect(getAdjacentChapters(chapters, parent.id).next).toBe(companion);
    expect(getAdjacentChapters(chapters, following.id).previous).toBe(companion);
    expect(companion ? getAdjacentChapters(chapters, companion.id) : undefined).toEqual({
      previous: parent,
      next: following,
    });
  });
});
