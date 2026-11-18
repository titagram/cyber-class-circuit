import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { EmptyState } from "@/components/PageHeader";
import { getLessonKey, lessonRegistry } from "@/components/lessons/registry";

export const Route = createFileRoute("/_authenticated/capitoli/$chapterId")({
  head: () => ({
    meta: [
      { title: "Slide 1.1: asset e Crime Triangle — Cybersecurity 101" },
      {
        name: "description",
        content:
          "Slide interattiva sugli asset da proteggere, sul Crime Triangle e sulla riduzione delle opportunità di attacco.",
      },
      { property: "og:title", content: "Slide 1.1: asset e Crime Triangle — Cybersecurity 101" },
      {
        property: "og:description",
        content:
          "Slide interattiva sugli asset da proteggere, sul Crime Triangle e sulla riduzione delle opportunità di attacco.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChapterPage,
});

function ChapterPage() {
  const { chapterId } = Route.useParams();
  const { data: chapter, isLoading } = useQuery({
    queryKey: ["chapter", chapterId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chapters")
        .select("id, course_id, title, content, courses(id, title)")
        .eq("id", chapterId)
        .maybeSingle();
      if (error) throw error;
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
        to="/corsi"
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
    </div>
  );
}
