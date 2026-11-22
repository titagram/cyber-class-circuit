import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EmptyState } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { lessonRegistry } from "@/components/lessons/registry";
import {
  getAdjacentChapters,
  getCourseChapters,
  getLessonKey,
  getSourceChapter,
  getRequestParentId,
  getRequestCompanion,
} from "@/lib/chapters";
import { webTitles } from "@/content/lessons/web-module";

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
      const parentId = getRequestParentId(chapterId);

      const loadCurrentChapter = async () => {
        if (sourceChapter) return sourceChapter;
        const { data, error } = await supabase
          .from("chapters")
          .select("id, course_id, title, position, content")
          .eq("id", parentId ?? chapterId)
          .maybeSingle();
        if (error) throw error;
        if (!data) return null;
        if (parentId !== null) {
          if (getLessonKey(data.content) !== "cybersecurity-1-4") return null;
          return { ...data, ...getRequestCompanion(data) };
        }
        return data;
      };

      const currentChapter = await loadCurrentChapter();
      if (!currentChapter) return null;

      // The same RLS-controlled course read supplies only siblings visible to the caller.
      const { data: course, error } = await supabase
        .from("courses")
        .select("id, title, chapters(id, title, position, content)")
        .eq("id", currentChapter.course_id)
        .maybeSingle();
      if (error) throw error;
      if (!course) return null;

      return {
        ...currentChapter,
        courses: { id: course.id, title: course.title },
        siblings: getCourseChapters(course.id, course.chapters),
      };
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
  const { previous, next } = getAdjacentChapters(chapter.siblings, chapter.id);
  const displayTitle = (item: { content: typeof chapter.content; title: string }) =>
    webTitles[getLessonKey(item.content) ?? ""] ?? item.title;

  return (
    <div>
      <Link
        to={isAdmin ? "/corsi" : "/area-studente"}
        className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-accent"
      >
        <ArrowLeft className="h-4 w-4" />
        {chapter.courses.title}
      </Link>
      {Lesson ? (
        <Lesson />
      ) : (
        <EmptyState title={chapter.title}>
          Questo capitolo non ha ancora un contenuto interattivo disponibile.
        </EmptyState>
      )}
      <nav aria-label="Navigazione tra capitoli" className="mt-8 grid gap-3 border-t border-border pt-5 sm:grid-cols-2">
        {previous ? (
          <Button asChild variant="outline" className="h-auto justify-start px-4 py-3">
            <Link to="/capitoli/$chapterId" params={{ chapterId: previous.id }}>
              <ArrowLeft aria-hidden="true" className="shrink-0" />
              <span className="min-w-0 text-left">
                <span className="block text-xs text-muted-foreground">Precedente</span>
                <span className="block">{displayTitle(previous)}</span>
              </span>
            </Link>
          </Button>
        ) : null}
        {next ? (
          <Button asChild variant="outline" className="h-auto justify-start px-4 py-3 sm:col-start-2 sm:justify-end">
            <Link to="/capitoli/$chapterId" params={{ chapterId: next.id }}>
              <span className="min-w-0 text-left sm:text-right">
                <span className="block text-xs text-muted-foreground">Successivo</span>
                <span className="block">{displayTitle(next)}</span>
              </span>
              <ArrowRight aria-hidden="true" className="shrink-0" />
            </Link>
          </Button>
        ) : null}
      </nav>
    </div>
  );
}
