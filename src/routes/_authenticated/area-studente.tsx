import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { HudPanel } from "@/design-system/nightrunner";
import { EmptyState, PageHeader } from "@/components/PageHeader";
import { getLessonKey, lessonRegistry } from "@/components/lessons/registry";

export const Route = createFileRoute("/_authenticated/area-studente")({
  head: () => ({
    meta: [
      { title: "I miei corsi — Cybersecurity 101" },
      { name: "description", content: "Corsi e capitoli assegnati alla tua classe su Cybersecurity 101." },
      { property: "og:title", content: "I miei corsi — Cybersecurity 101" },
      { property: "og:description", content: "Corsi e capitoli assegnati alla tua classe su Cybersecurity 101." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StudentAreaPage,
});

function StudentAreaPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["student-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, chapters(id, title, position, content)")
        .order("title");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div>
      <PageHeader title="I miei corsi" subtitle="Corsi e capitoli assegnati alla tua classe." />
      {isLoading ? (
        <p className="text-muted-foreground">Caricamento…</p>
      ) : !data?.length ? (
        <EmptyState title="Nessun corso assegnato">
          Quando l'amministratore collegherà un corso alla tua classe, lo troverai qui.
        </EmptyState>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((course) => {
            const chapters = [...course.chapters].sort((a, b) => a.position - b.position);
            return (
              <HudPanel key={course.id} heading={course.title}>
                {course.description && <p className="mb-3 text-sm text-muted-foreground">{course.description}</p>}
                <ol className="list-decimal space-y-2 pl-5 text-sm">
                  {chapters.map((chapter) => {
                    const lessonKey = getLessonKey(chapter.content);
                    const hasInteractiveLesson = lessonKey ? Boolean(lessonRegistry[lessonKey]) : false;
                    return (
                      <li key={chapter.id} className="pl-1">
                        {hasInteractiveLesson ? (
                          <Link
                            to="/capitoli/$chapterId"
                            params={{ chapterId: chapter.id }}
                            className="inline-flex items-center gap-1.5 text-accent underline-offset-4 hover:underline"
                          >
                            {chapter.title}
                            <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                          </Link>
                        ) : (
                          chapter.title
                        )}
                      </li>
                    );
                  })}
                </ol>
                {!chapters.length && <p className="text-sm text-muted-foreground">Nessun capitolo disponibile.</p>}
              </HudPanel>
            );
          })}
        </div>
      )}
    </div>
  );
}
