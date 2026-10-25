import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, FileText, Lock, ShieldCheck, Wallet } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/fnb-demo")({
  head: () => ({
    meta: [
      { title: "Simulated FNB Integration — SafePath demo" },
      { name: "description", content: "Hackathon mock-up showing SafePath hidden inside a banking app: duress PIN and a disguised safe vault." },
      { property: "og:title", content: "Simulated FNB Integration — SafePath demo" },
      { property: "og:description", content: "A mock banking screen with a duress PIN and a hidden safe vault for the private journal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: FnbDemo,
});

const TX = [
  { d: "24 Oct", n: "Checkers Hyper", a: "-R 642.30" },
  { d: "23 Oct", n: "Salary — ACME (Pty) Ltd", a: "+R 18 450.00" },
  { d: "22 Oct", n: "Vodacom Airtime", a: "-R 99.00" },
  { d: "21 Oct", n: "Engen Fuel", a: "-R 750.00" },
  { d: "20 Oct", n: "eWallet sent — 082 *** 4411", a: "-R 300.00" },
  { d: "19 Oct", n: "Netflix", a: "-R 199.00" },
];

const DOCS = ["Statement — September 2026", "Statement — August 2026", "Tax certificate 2025/26", "Proof of account", "Safe Vault Document"];

function FnbDemo() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<"home" | "docs" | "security">("home");
  const [pinInfo, setPinInfo] = useState(false);

  return (
    <div className="min-h-screen bg-muted">
      <div className="sticky top-0 z-40 flex items-center justify-between gap-2 bg-clay px-4 py-2 text-[13px] font-semibold text-primary-foreground">
        <span>DEMO — Simulated FNB integration (not a real bank)</span>
        <Link to="/" className="inline-flex min-h-9 items-center gap-1 rounded-full bg-background px-3 text-foreground">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to SafePath
        </Link>
      </div>

      <header className="bg-brand-deep px-4 pb-6 pt-5 text-primary-foreground">
        <div className="mx-auto max-w-[560px]">
          <p className="text-[13px] opacity-80">Good evening, Demo User</p>
          <p className="mt-4 text-[13px] opacity-80">Easy Smart Account ···· 4821</p>
          <p className="font-display text-[34px] leading-tight">R 12 384.55</p>
          <p className="text-[12px] opacity-80">Available balance (dummy data)</p>
        </div>
      </header>

      <nav className="mx-auto flex max-w-[560px] gap-1 px-4 pt-3" aria-label="Banking menu">
        {(["home", "docs", "security"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`min-h-11 flex-1 rounded-lg text-[13px] font-semibold ${tab === t ? "bg-background text-foreground" : "text-muted-foreground"}`}
          >
            {t === "home" ? "Accounts" : t === "docs" ? "Statements & Documents" : "Security"}
          </button>
        ))}
      </nav>

      <main className="mx-auto max-w-[560px] space-y-3 px-4 py-4">
        {tab === "home" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="surface flex items-center gap-3 px-4 py-4"><Wallet className="size-5 text-brand" aria-hidden="true" /><span className="text-[14px] font-semibold">Send eWallet</span></div>
              <div className="surface flex items-center gap-3 px-4 py-4"><FileText className="size-5 text-brand" aria-hidden="true" /><span className="text-[14px] font-semibold">Pay</span></div>
            </div>
            <section className="surface px-4 py-3">
              <h2 className="eyebrow mb-2">Recent transactions</h2>
              <ul>
                {TX.map((t) => (
                  <li key={t.n} className="flex justify-between border-b border-border py-2.5 text-[14px] last:border-0">
                    <span><span className="block text-foreground">{t.n}</span><span className="text-[12px] text-muted-foreground">{t.d}</span></span>
                    <span className={t.a.startsWith("+") ? "text-brand-deep" : "text-foreground"}>{t.a}</span>
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}

        {tab === "docs" && (
          <ul className="surface px-4 py-1">
            {DOCS.map((d) => (
              <li key={d}>
                <button
                  type="button"
                  onClick={() => d === "Safe Vault Document" && navigate({ to: "/journal" })}
                  className="flex min-h-14 w-full items-center gap-3 border-b border-border text-left text-[14px] text-foreground"
                >
                  <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">{d}</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                </button>
              </li>
            ))}
            <p className="py-3 text-[12px] text-muted-foreground">Demo note: "Safe Vault Document" quietly opens the private journal (sign-in required).</p>
          </ul>
        )}

        {tab === "security" && (
          <ul className="surface px-4 py-1">
            <li className="flex min-h-14 items-center gap-3 border-b border-border text-[14px]"><Lock className="size-4" aria-hidden="true" /> Change app PIN</li>
            <li>
              <button type="button" onClick={() => setPinInfo(true)} className="flex min-h-14 w-full items-center gap-3 text-left text-[14px] font-semibold text-foreground">
                <ShieldCheck className="size-4 text-brand" aria-hidden="true" /> <span className="flex-1">Duress PIN setup</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </button>
            </li>
          </ul>
        )}
      </main>

      <Dialog open={pinInfo} onOpenChange={setPinInfo}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-lg">
          <DialogHeader>
            <DialogTitle>Duress PIN (concept)</DialogTitle>
            <DialogDescription className="mt-2 leading-relaxed">
              A second PIN you can enter if someone forces you to open your banking app.
            </DialogDescription>
          </DialogHeader>
          <ul className="list-disc space-y-2 pl-5 text-[14px] leading-relaxed text-foreground">
            <li>The app opens normally, but shows a limited view with a low balance.</li>
            <li>Savings, a hidden escape fund and the safe vault stay out of sight.</li>
            <li>Large transfers can be paused for review, protecting your money from coercion.</li>
            <li>In a real product the bank could optionally alert a trusted contact you chose — this demo sends nothing.</li>
          </ul>
          <p className="text-[13px] text-muted-foreground">
            In SafePath today, a working distress code is set up in Privacy &amp; safety.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="min-h-12" onClick={() => setPinInfo(false)}>Close</Button>
            <Button asChild className="min-h-12"><Link to="/privacy">Set up distress code</Link></Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
