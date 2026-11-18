import type { ComponentType } from "react";
import { Cybersecurity11Slide } from "./Cybersecurity11Slide";
import { Cybersecurity12Slide } from "./Cybersecurity12Slide";
import { Cybersecurity13Slide } from "./Cybersecurity13Slide";
import { Cybersecurity14Slide } from "./Cybersecurity14Slide";
import { Cybersecurity15Slide } from "./Cybersecurity15Slide";
import { cryptoLessonIds } from "@/content/lessons/chapter2";
import { Chapter2Lesson } from "./chapter2/Chapter2Lesson";

const chapter2Lessons = Object.fromEntries(
  cryptoLessonIds.map((id) => [
    id,
    function CryptoChapter() {
      return <Chapter2Lesson id={id} />;
    },
  ]),
);

export const lessonRegistry: Record<string, ComponentType> = {
  "cybersecurity-1-1": Cybersecurity11Slide,
  "cybersecurity-1-2": Cybersecurity12Slide,
  "cybersecurity-1-3": Cybersecurity13Slide,
  "cybersecurity-1-4": Cybersecurity14Slide,
  "cybersecurity-1-5": Cybersecurity15Slide,
  ...chapter2Lessons,
};
