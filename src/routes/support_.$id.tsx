import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/support_/$id")({
  head: () => ({
    meta: [
      { title: "Organisation contact — SafePath" },
      { name: "description", content: "Contact options for a South African support organisation." },
      { property: "og:title", content: "Organisation contact — SafePath" },
      { property: "og:description", content: "Phone, website and official contact page for a support organisation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function statusLabel(s: string) {
  if (s === "verified") return "Verified";
  if (s === "checked_online") return "Checked online";
  return "Sample";
}

function ContactPage() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["support_service", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_services")
        .select("*, service_categories(name)")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const s = q.data;
  return (
    <AppShell>
      <Link to="/support" className="text-[14px] font-medium text-primary">
        ← Back to directory
      </Link>
      {q.isLoading ? (
        <div className="surface mt-4 h-48 animate-pulse bg-muted" />
      ) : q.isError ? (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">This page could not be loaded.</p>
          <button type="button" onClick={() => q.refetch()} className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-foreground">
            Try again
          </button>
        </div>
      ) : !s ? (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">This organisation is no longer listed.</p>
        </div>
      ) : (
        <article className="mt-4">
          <p className="eyebrow">{s.service_categories?.name ?? s.category_slug}</p>
          <h1 className="mt-1 font-display text-[26px] leading-tight text-foreground">{s.name}</h1>
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">{s.description}</p>

          <dl className="surface mt-5 grid grid-cols-1 gap-3 px-4 py-4 text-[14px]">
            {s.phone && (<div><dt className="text-muted-foreground">Phone</dt><dd className="text-[18px] font-medium text-foreground">{s.phone}</dd></div>)}
            {s.email && (<div><dt className="text-muted-foreground">Email</dt><dd className="text-foreground">{s.email}</dd></div>)}
            {s.hours && (<div><dt className="text-muted-foreground">Hours</dt><dd className="text-foreground">{s.hours}</dd></div>)}
            {s.location && (<div><dt className="text-muted-foreground">Area served</dt><dd className="text-foreground">{s.location}</dd></div>)}
            <div>
              <dt className="text-muted-foreground">Status</dt>
              <dd className="text-foreground">
                {statusLabel(s.verification_status)} · {s.last_verified_at ?? "not yet checked"}
              </dd>
            </div>
          </dl>

          <div className="mt-4 space-y-2">
            {s.phone && (
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="flex min-h-12 items-center justify-center rounded-xl bg-primary text-[15px] font-medium text-primary-foreground">
                Call {s.phone}
              </a>
            )}
            {s.email && (
              <a href={`mailto:${s.email}`} className="flex min-h-12 items-center justify-center rounded-xl border border-border text-[15px] font-medium text-foreground">
                Email
              </a>
            )}
            {(s.contact_page_url || s.website) && (
              <a href={s.contact_page_url ?? s.website!} target="_blank" rel="noreferrer noopener" className="flex min-h-12 items-center justify-center rounded-xl border border-border text-[15px] font-medium text-foreground">
                Open official contact page
              </a>
            )}
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-muted-foreground">
            Details were taken from the organisation's official website
            {s.source_url && (<> (<a href={s.source_url} target="_blank" rel="noreferrer noopener" className="underline">source</a>)</>)}.
            Numbers can change, so check the official page if a call does not connect. Calling a service does not report
            anything on your behalf.
          </p>
        </article>
      )}
    </AppShell>
  );
}
