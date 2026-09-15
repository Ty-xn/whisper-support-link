import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SafePath — Find help. Stay safe. Speak when you're ready." },
      {
        name: "description",
        content:
          "A calm, private place to find trusted support, document what happened, and plan for safety. No account needed to explore.",
      },
      { property: "og:title", content: "SafePath — Find help. Stay safe. Speak when you're ready." },
      {
        property: "og:description",
        content: "Private, trauma-informed support and prevention. Explore without creating an account.",
      },
    ],
  }),
  component: Home,
});

const OPTIONS = [
  {
    to: "/pathways",
    search: { need: "immediate" as const },
    number: "01",
    title: "I need immediate help",
    body: "Options for right now, at your pace.",
  },
  {
    to: "/support",
    number: "02",
    title: "Find trusted support",
    body: "A directory of support organisations.",
  },
  {
    to: "/journal",
    number: "03",
    title: "Document something privately",
    body: "A journal only you can open.",
  },
  {
    to: "/pathways",
    search: { need: "workplace" as const },
    number: "04",
    title: "I want legal or workplace guidance",
    body: "Understand your options first.",
  },
  {
    to: "/pathways",
    search: { need: "someone-else" as const },
    number: "05",
    title: "I want to support someone else",
    body: "Ways to be a steady presence.",
  },
  {
    to: "/learn",
    number: "06",
    title: "Learn about prevention",
    body: "Short readings and scenarios.",
  },
];

function Home() {
  return (
    <AppShell>
      <h1 className="font-display text-[32px] leading-[1.1] text-foreground">How can we help you today?</h1>
      <p className="mt-3 max-w-[38ch] text-[15px] leading-relaxed text-muted-foreground">
        Take your time. Nothing here is shared with anyone unless you choose to share it.
      </p>

      <ul className="mt-6 space-y-2.5">
        {OPTIONS.map((option) => (
          <li key={option.number}>
            <Link
              to={option.to}
              search={option.search as never}
              className="surface flex min-h-16 items-center gap-4 px-4 py-4"
            >
              <span className="font-display text-base text-brand">{option.number}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-semibold text-foreground">{option.title}</span>
                <span className="mt-0.5 block text-[13px] text-muted-foreground">{option.body}</span>
              </span>
              <span aria-hidden="true" className="text-muted-foreground">
                ›
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="surface mt-5 px-4 py-4">
        <p className="text-[14px] leading-relaxed text-foreground">
          You are in control of what you share. You can explore support without creating an account.
        </p>
        <Link to="/privacy" className="mt-2 inline-block text-[13px] font-semibold text-brand-deep underline">
          Privacy &amp; safety
        </Link>
      </div>

      <Link to="/assistant" className="surface mt-3 flex items-center gap-3 px-4 py-4">
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-foreground">SafePath assistant</span>
          <span className="mt-0.5 block text-[13px] text-muted-foreground">
            General information and help finding your next step.
          </span>
        </span>
        <span aria-hidden="true" className="text-muted-foreground">
          ›
        </span>
      </Link>

      <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
        Quick exit leaves this site for a weather page. It does not clear your browsing history and cannot guarantee
        your safety.
      </p>
    </AppShell>
  );
}
