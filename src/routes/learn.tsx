import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/learn")({
  head: () => ({
    meta: [
      { title: "Learn & Prevent — SafePath" },
      {
        name: "description",
        content:
          "Short, calm readings on harassment, consent, digital safety, supporting a friend, bystander intervention and emergency preparedness.",
      },
      { property: "og:title", content: "Learn & Prevent — SafePath" },
      { property: "og:description", content: "Short readings and scenarios on safety and prevention." },
    ],
  }),
  component: LearnPage,
});

type ScenarioOption = { label: string; feedback: string; correct?: boolean };
type Scenario = { question: string; options: ScenarioOption[] };
type Article = {
  id: string;
  slug: string;
  title: string;
  topic: string;
  summary: string;
  body: string;
  reading_minutes: number;
  scenario: Scenario | null;
  is_sample: boolean;
};

function ScenarioBlock({ scenario }: { scenario: Scenario }) {
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div className="mt-4 rounded-xl border border-border bg-muted px-4 py-4">
      <p className="eyebrow">Scenario</p>
      <p className="mt-1.5 text-[14px] font-medium text-foreground">{scenario.question}</p>
      <ul className="mt-3 space-y-2">
        {scenario.options.map((option, index) => (
          <li key={option.label}>
            <button
              type="button"
              onClick={() => setPicked(index)}
              aria-pressed={picked === index}
              className={`w-full rounded-lg border px-3 py-3 text-left text-[14px] ${
                picked === index ? "border-primary bg-card font-medium" : "border-border bg-card"
              } text-foreground`}
            >
              {option.label}
            </button>
          </li>
        ))}
      </ul>
      {picked !== null && (
        <p className="mt-3 text-[13px] leading-relaxed text-foreground">
          {scenario.options[picked]?.feedback}
        </p>
      )}
    </div>
  );
}

function LearnPage() {
  const [open, setOpen] = useState<string | null>(null);

  const articles = useQuery({
    queryKey: ["educational_content"],
    queryFn: async (): Promise<Article[]> => {
      const { data, error } = await supabase
        .from("educational_content")
        .select("id,slug,title,topic,summary,body,reading_minutes,scenario,is_sample")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as unknown as Article[];
    },
  });

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Learn &amp; prevent</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Short readings you can leave at any time. Nothing is tracked and nothing is marked as read.
      </p>

      <p className="mt-4 rounded-xl border border-dashed border-clay/50 px-4 py-3 text-[12px] leading-relaxed text-clay">
        Demonstration content written for a prototype. It is general information, not advice, and should be reviewed by
        qualified specialists before real use.
      </p>

      {articles.isLoading && (
        <ul className="mt-4 space-y-2.5">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="surface h-24 animate-pulse bg-muted" />
          ))}
        </ul>
      )}

      {articles.isError && (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">These readings could not be loaded.</p>
          <button
            type="button"
            onClick={() => articles.refetch()}
            className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      )}

      {articles.data && articles.data.length === 0 && (
        <div className="surface mt-4 px-4 py-6 text-[15px] text-foreground">No readings yet.</div>
      )}

      <ul className="mt-4 space-y-2.5">
        {(articles.data ?? []).map((article) => {
          const expanded = open === article.slug;
          return (
            <li key={article.id} className="surface px-4 py-4">
              <button
                type="button"
                onClick={() => setOpen(expanded ? null : article.slug)}
                aria-expanded={expanded}
                className="w-full text-left"
              >
                <p className="eyebrow">{article.reading_minutes} min read</p>
                <h2 className="mt-1 font-display text-[19px] leading-snug text-foreground">{article.title}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{article.summary}</p>
                <span className="mt-2 inline-block text-[13px] font-semibold text-brand-deep underline">
                  {expanded ? "Close" : "Read"}
                </span>
              </button>

              {expanded && (
                <div className="mt-3 border-t border-border pt-3">
                  {article.body.split("\n\n").map((para) => (
                    <p key={para.slice(0, 24)} className="mb-3 text-[14px] leading-relaxed text-foreground">
                      {para}
                    </p>
                  ))}
                  {article.scenario && <ScenarioBlock scenario={article.scenario} />}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </AppShell>
  );
}
