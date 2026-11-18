import type { ComponentType } from "react";
import type { Json } from "@/integrations/supabase/types";
import { Cybersecurity11Slide } from "./Cybersecurity11Slide";
import { Cybersecurity12Slide } from "./Cybersecurity12Slide";
import { Cybersecurity13Slide } from "./Cybersecurity13Slide";
import { Cybersecurity14Slide } from "./Cybersecurity14Slide";
import { Cybersecurity15Slide } from "./Cybersecurity15Slide";

export const lessonRegistry: Record<string, ComponentType> = {
  "cybersecurity-1-1": Cybersecurity11Slide,
  "cybersecurity-1-2": Cybersecurity12Slide,
  "cybersecurity-1-3": Cybersecurity13Slide,
  "cybersecurity-1-4": Cybersecurity14Slide,
  "cybersecurity-1-5": Cybersecurity15Slide,
};

export function getLessonKey(content: Json): string | null {
  if (!content || typeof content !== "object" || Array.isArray(content) || !("lesson" in content)) {
    return null;
  }
  return typeof content["lesson"] === "string" ? content["lesson"] : null;
}
