import type { ComponentType } from "react";
import type { Json } from "@/integrations/supabase/types";
import { Cybersecurity11Slide } from "./Cybersecurity11Slide";

export const lessonRegistry: Record<string, ComponentType> = {
  "cybersecurity-1-1": Cybersecurity11Slide,
};

export function getLessonKey(content: Json): string | null {
  if (!content || typeof content !== "object" || Array.isArray(content) || !("lesson" in content)) {
    return null;
  }
  return typeof content["lesson"] === "string" ? content["lesson"] : null;
}
