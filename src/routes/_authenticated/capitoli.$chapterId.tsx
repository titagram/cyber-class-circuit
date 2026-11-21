import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/PageHeader";
import { lessonRegistry } from "@/components/lessons/registry";
import {
  getLessonKey,
  getSourceChapter,
  getRequestParentId,
  getRequestCompanion,
} from "@/lib/chapters";

export const Route = createFileRoute("/_authenticated/capitoli/$chapterId")({
  head: () => ({
    meta: [
      { title: "Capitolo interattivo — Cybersecurity 101" },
      {
        name: "description",
        content: "Lezione interattiva del corso assegnato.",
      },
      { property: "og:title", content: "Capitolo interattivo — Cybersecurity 101" },
      {
        property: "og:description",
        content: "Lezione interattiva del corso assegnato.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChapterPage,
});

function ChapterPage() {
  const { chapterId } = Route.useParams();
  const { user, isAdmin } = useAuth();
  const { data: chapter, isLoading } = useQuery({
    queryKey: ["chapter", user?.id, chapterId],
    queryFn: async () => {
      const sourceChapter = getSourceChapter(chapterId);
      if (sourceChapter) {
        // Use the same RLS-controlled course lookup for source chapters and deep links.
        const { data: course, error } = await supabase
          .from("courses")
          .select("id, title")
          .eq("id", sourceChapter.course_id)
          .maybeSingle();
        if (error) throw error;
        return course ? { ...sourceChapter, courses: course } : null;
      }

      const parentId = getRequestParentId(chapterId);
      const { data, error } = await supabase
        .from("chapters")
        .select("id, course_id, title, content, courses(id, title)")
        .eq("id", parentId ?? chapterId)
        .maybeSingle();
      if (error) throw error;
      if (parentId !== null) {
        if (!data || getLessonKey(data.content) !== "cybersecurity-1-4") return null;
        return { ...data, ...getRequestCompanion(data) };
      }
      return data;
    },
  });

  if (isLoading) return <p className="text-muted-foreground">Caricamento…</p>;

  if (!chapter) {
    return (
      <div>
        <EmptyState title="Capitolo non trovato">
          Il capitolo potrebbe essere stato rimosso oppure il collegamento non è corretto.
        </EmptyState>
      </div>
    );
  }

  const lessonKey = getLessonKey(chapter.content);
  const Lesson = lessonKey ? lessonRegistry[lessonKey] : undefined;

  return (
    <div>
      <Link
        to={isAdmin ? "/corsi" : "/area-studente"}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        {chapter.courses?.title ?? "Corsi"}
      </Link>
      {Lesson ? (
        <Lesson />
      ) : (
        <EmptyState title={chapter.title}>
          Questo capitolo non ha ancora un contenuto interattivo disponibile.
        </EmptyState>
      )}
      {lessonKey === "cybersecurity-1-4" && (
        <Link
          to="/capitoli/$chapterId"
          params={{ chapterId: getRequestCompanion(chapter).id }}
          className="mt-4 inline-flex text-accent underline"
        >
          Prosegui · Dal clic al file: request e response →
        </Link>
      )}
    </div>
  );
}
