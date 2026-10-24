import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Find Support — SafePath" },
      {
        name: "description",
        content:
          "Search a directory of support organisations by category and location: crisis lines, counselling, legal help, safe accommodation and more.",
      },
      { property: "og:title", content: "Find Support — SafePath" },
      { property: "og:description", content: "Search support organisations by category and location." },
    ],
  }),
  component: SupportPage,
});

type Service = {
  id: string;
  name: string;
  category_slug: string;
  description: string;
  location: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  hours: string | null;
  verification_status: string;
  last_verified_at: string | null;
  is_sample: boolean;
};

type Category = { slug: string; name: string };

function SupportPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  const categories = useQuery({
    queryKey: ["service_categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("service_categories")
        .select("slug,name")
        .order("sort_order");
      if (error) throw error;
      return data ?? [];
    },
  });

  const services = useQuery({
    queryKey: ["support_services"],
    queryFn: async (): Promise<Service[]> => {
      const { data, error } = await supabase
        .from("support_services")
        .select(
          "id,name,category_slug,description,location,phone,email,website,hours,verification_status,last_verified_at,is_sample",
        )
        .order("name");
      if (error) throw error;
      return (data ?? []) as Service[];
    },
  });

  const categoryName = useMemo(() => {
    const map = new Map((categories.data ?? []).map((c) => [c.slug, c.name]));
    return (slug: string) => map.get(slug) ?? slug;
  }, [categories.data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (services.data ?? []).filter((s) => {
      if (category !== "all" && s.category_slug !== category) return false;
      if (!q) return true;
      return [s.name, s.description, s.location ?? "", categoryName(s.category_slug)]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [services.data, query, category, categoryName]);

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Find trusted support</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Browse or search. You do not need an account, and nothing you search is stored.
      </p>

      <div className="mt-5">
        <label htmlFor="q" className="eyebrow">
          Search
        </label>
        <input
          id="q"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Organisation, service or place"
          className="mt-2 min-h-12 w-full rounded-xl border border-input bg-card px-4 text-[15px] text-foreground placeholder:text-muted-foreground"
        />
      </div>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ slug: "all", name: "All" }, ...(categories.data ?? [])].map((c) => {
          const active = category === c.slug;
          return (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              aria-pressed={active}
              className={`min-h-11 shrink-0 rounded-full border px-4 text-[13px] font-medium ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>

      <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
        South African organisations. Details were checked against each organisation's official website on the date
        shown. Numbers can change — use the official contact page if a call does not connect.
      </p>

      {services.isLoading ? (
        <ul className="mt-4 space-y-2.5">
          {[0, 1, 2].map((i) => (
            <li key={i} className="surface h-40 animate-pulse bg-muted" />
          ))}
        </ul>
      ) : services.isError ? (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">The directory could not be loaded.</p>
          <button
            type="button"
            onClick={() => services.refetch()}
            className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">No services match that search.</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Try a different word, or clear the category filter.
          </p>
        </div>
      ) : (
        <ul className="mt-4 space-y-2.5">
          {filtered.map((s) => (
            <li key={s.id} className="surface px-4 py-4">
              <p className="eyebrow">{categoryName(s.category_slug)}</p>
              <div className="mt-1 flex items-start justify-between gap-3">
                <h2 className="font-display text-[19px] leading-snug text-foreground">{s.name}</h2>
                <span className="shrink-0 rounded-md bg-muted px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {s.verification_status === "verified" ? "Verified" : "Sample"}
                </span>
              </div>
              <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">{s.description}</p>
              <dl className="mt-3 grid grid-cols-2 gap-y-2 text-[13px]">
                {s.location && (
                  <div>
                    <dt className="text-muted-foreground">Location</dt>
                    <dd className="text-foreground">{s.location}</dd>
                  </div>
                )}
                {s.hours && (
                  <div>
                    <dt className="text-muted-foreground">Hours</dt>
                    <dd className="text-foreground">{s.hours}</dd>
                  </div>
                )}
                {s.phone && (
                  <div>
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd className="text-foreground">{s.phone}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-muted-foreground">Last verified</dt>
                  <dd className="text-foreground">{s.last_verified_at ?? "Not verified"}</dd>
                </div>
              </dl>
              <div className="mt-4 flex gap-2">
                {s.phone && (
                  <a
                    href={`tel:${s.phone.replace(/\s/g, "")}`}
                    className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-primary text-[14px] font-medium text-primary-foreground"
                  >
                    Call
                  </a>
                )}
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="flex min-h-11 flex-1 items-center justify-center rounded-xl border border-border text-[14px] font-medium text-foreground"
                  >
                    Website
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  );
}
