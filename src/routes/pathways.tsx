import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

type Search = { need: string };

export const Route = createFileRoute("/pathways")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    need: typeof search["need"] === "string" ? (search["need"] as string) : "",
  }),
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Referral Pathways — SafePath" },
      {
        name: "description",
        content:
          "Choose what you need and see optional next steps: emergency options, counselling, legal help, workplace guidance and documentation.",
      },
      { property: "og:title", content: "Referral Pathways — SafePath" },
      { property: "og:description", content: "Optional next steps based on what you need right now." },
    ],
  }),
  component: PathwaysPage,
});

type Pathway = {
  id: string;
  need_slug: string;
  need_label: string;
  step_title: string;
  step_description: string;
  category_slug: string | null;
  sort_order: number;
};

function PathwaysPage() {
  const { need } = Route.useSearch();

  const pathways = useQuery({
    queryKey: ["referral_pathways"],
    queryFn: async (): Promise<Pathway[]> => {
      const { data, error } = await supabase
        .from("referral_pathways")
        .select("id,need_slug,need_label,step_title,step_description,category_slug,sort_order")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as Pathway[];
    },
  });

  const needs = useMemo(() => {
    const map = new Map<string, string>();
    (pathways.data ?? []).forEach((p) => map.set(p.need_slug, p.need_label));
    return Array.from(map, ([slug, label]) => ({ slug, label }));
  }, [pathways.data]);

  const selected = needs.find((n) => n.slug === need);
  const steps = (pathways.data ?? []).filter((p) => p.need_slug === need);

  const resultsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (selected) resultsRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  }, [need, selected]);

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Referral pathways</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Tell us what you are looking for and we will show some options you may consider. Nothing is sent to anyone.
      </p>

      {pathways.isLoading && <div className="surface mt-5 h-32 animate-pulse bg-muted" />}

      {pathways.isError && (
        <div className="surface mt-5 px-4 py-6">
          <p className="text-[15px] text-foreground">These suggestions could not be loaded.</p>
          <button
            type="button"
            onClick={() => pathways.refetch()}
            className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      )}

      {pathways.data && selected && (
        <section ref={resultsRef} className="mt-5 scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="eyebrow">{selected.label}</p>
            <Link
              to="/pathways"
              search={{ need: "" }}
              className="min-h-11 text-[13px] font-semibold text-brand-deep underline"
            >
              Choose a different need
            </Link>
          </div>
          <h2 className="mt-1 font-display text-[22px] text-foreground">
            Here are some options you may consider
          </h2>

          {selected.slug === "immediate" && (
            <p className="mt-3 rounded-xl border border-border bg-muted px-4 py-3 text-[13px] leading-relaxed text-foreground">
              If you are in immediate danger, contact local emergency services when it is safe to do so. SafePath
              cannot contact them for you.
            </p>
          )}

          <ol className="mt-4 space-y-2.5">
            {steps.map((step, index) => (
              <li key={step.id} className="surface px-4 py-4">
                <p className="eyebrow">Option {index + 1}</p>
                <h3 className="mt-1 font-display text-[18px] text-foreground">{step.step_title}</h3>
                <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">
                  {step.step_description}
                </p>
                {step.category_slug && (
                  <Link
                    to="/support"
                    className="mt-3 inline-block text-[13px] font-semibold text-brand-deep underline"
                  >
                    See organisations in the directory
                  </Link>
                )}
              </li>
            ))}
          </ol>

          <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
            These are general suggestions, not legal or medical advice. You decide which, if any, to follow.
          </p>
        </section>
      )}

      {pathways.data && selected && (
        <section className="mt-8">
          <h2 className="eyebrow">Or look at something else</h2>
          <ul className="mt-3 space-y-2.5">
            {needs
              .filter((n) => n.slug !== selected.slug)
              .map((n) => (
                <li key={n.slug}>
                  <Link
                    to="/pathways"
                    search={{ need: n.slug }}
                    className="surface flex min-h-14 items-center justify-between px-4 py-3 text-[15px] text-foreground"
                  >
                    {n.label}
                    <span aria-hidden="true" className="text-muted-foreground">
                      ›
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      {pathways.data && !selected && (
        <ul className="mt-5 space-y-2.5">
          {needs.map((n) => (
            <li key={n.slug}>
              <Link
                to="/pathways"
                search={{ need: n.slug }}
                className="surface flex min-h-14 items-center justify-between px-4 py-3 text-[15px] text-foreground"
              >
                {n.label}
                <span aria-hidden="true" className="text-muted-foreground">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
