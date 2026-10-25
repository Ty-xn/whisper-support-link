import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ChevronRight, FileText, Lock, ShieldCheck, Wallet, ScanFace, Landmark, CreditCard } from "lucide-react";
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

const DOCS = ["Statement — September 2026", "Statement — August 2026", "Tax certificate 2025/26", "Proof of account", "Safe Vault Documents"];

function FnbDemo() {
  const [tab, setTab] = useState<"home" | "docs" | "security">("home");
  const [pinInfo, setPinInfo] = useState(false);
  const [loanOpen, setLoanOpen] = useState(false);
  const [mockComplete, setMockComplete] = useState(false);
  const [document, setDocument] = useState<string | null>(null);
  const [payment, setPayment] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-muted">
      <div className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-2 bg-clay px-4 py-2 text-[13px] font-semibold text-primary-foreground">
        <span>DEMO — Simulated FNB integration (not a real bank)</span>
        <Button asChild variant="secondary" className="min-h-10 shrink-0"><Link to="/">
          <ArrowLeft className="size-4" aria-hidden="true" /> Exit Demo Mode
        </Link></Button>
      </div>

      <header className="bg-bank px-4 pb-6 pt-5 text-bank-foreground">
        <div className="mx-auto max-w-[560px]">
          <div className="mb-5 flex items-center gap-3"><Landmark className="size-7" aria-hidden="true" /><h1 className="font-sans text-xl font-semibold">FNB Banking <span className="text-sm font-normal">· Simulation</span></h1></div>
          <p className="text-[13px] opacity-80">Good evening, Demo User</p>
          <p className="mt-4 text-[13px] opacity-80">Easy Smart Account ···· 4821</p>
          <p className="font-display text-[34px] leading-tight">R 12 384.55</p>
          <p className="text-[12px] opacity-80">Available balance (dummy data)</p>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-bank-foreground/30 pt-3 text-sm"><span>Savings pocket ···· 9012</span><span className="shrink-0 font-semibold">R 3 250.00</span></div>
        </div>
      </header>

      <nav className="mx-auto flex max-w-[560px] gap-1 px-4 pt-3" aria-label="Banking menu">
        {(["home", "docs", "security"] as const).map((t) => (
          <Button
            key={t}
            type="button"
            variant="ghost"
            aria-pressed={tab === t}
            onClick={() => setTab(t)}
            className={`h-auto min-h-12 min-w-0 flex-1 whitespace-normal px-2 text-[13px] font-semibold ${tab === t ? "bg-background text-foreground" : "text-muted-foreground"}`}
          >
            {t === "home" ? "Accounts" : t === "docs" ? "Statements & Documents" : "Security"}
          </Button>
        ))}
      </nav>

      <main className="mx-auto max-w-[560px] space-y-3 px-4 py-4">
        {tab === "home" && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" className="min-h-16" onClick={() => setPayment("Send eWallet")}><Wallet className="text-bank" aria-hidden="true" />Send eWallet</Button>
              <Button variant="outline" className="min-h-16" onClick={() => setPayment("Pay")}><CreditCard className="text-bank" aria-hidden="true" />Pay</Button>
            </div>
            <Button variant="outline" className="min-h-14 w-full justify-start" onClick={() => { setMockComplete(false); setLoanOpen(true); }}><Landmark className="text-bank" aria-hidden="true" /><span className="flex-1 text-left">Apply for Loan</span><ChevronRight aria-hidden="true" /></Button>
            <section className="surface px-4 py-3">
              <h2 className="eyebrow mb-2">Recent transactions</h2>
              <ul>
                {TX.map((t) => (
                  <li key={t.n} className="flex justify-between gap-3 border-b border-border py-2.5 text-[14px] last:border-0">
                    <span><span className="block text-foreground">{t.n}</span><span className="text-[12px] text-muted-foreground">{t.d}</span></span>
                    <span className={`shrink-0 ${t.a.startsWith("+") ? "text-bank" : "text-foreground"}`}>{t.a}</span>
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
                <Button
                  asChild={d === "Safe Vault Documents"}
                  variant="ghost"
                  onClick={d === "Safe Vault Documents" ? undefined : () => setDocument(d)}
                  className="h-auto min-h-14 w-full justify-start gap-3 whitespace-normal rounded-none border-b border-border px-0 text-left text-[14px] text-foreground"
                >
                  {d === "Safe Vault Documents" ? <Link to="/journal"><FileText className="text-muted-foreground" aria-hidden="true" /><span className="flex-1">{d}</span><ChevronRight className="text-muted-foreground" aria-hidden="true" /></Link> : <>
                  <FileText className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="flex-1">{d}</span>
                  <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
                  </>}
                </Button>
              </li>
            ))}
          </ul>
        )}

        {tab === "security" && (
          <ul className="surface px-4 py-1">
            <li className="flex min-h-14 items-center gap-3 border-b border-border text-[14px]"><Lock className="size-4" aria-hidden="true" /> Change app PIN</li>
            <li>
              <Button variant="ghost" onClick={() => setPinInfo(true)} className="min-h-14 w-full justify-start px-0 text-left text-[14px] font-semibold text-foreground">
                <ShieldCheck className="size-4 text-bank" aria-hidden="true" /> <span className="flex-1">Duress PIN Setup</span>
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            </li>
          </ul>
        )}
      </main>

      <Dialog open={pinInfo} onOpenChange={setPinInfo}>
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
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
            <li>Concept only: a secondary PIN could silently alert designated responders, with prior consent and a live response-service integration.</li>
          </ul>
          <p className="text-[13px] font-semibold text-foreground">This demo does not mask a live account, send alerts or dispatch responders. It cannot guarantee safety.</p>
          <p className="text-[13px] text-muted-foreground">
            In SafePath today, a working distress code is set up in Privacy &amp; safety.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" className="min-h-12" onClick={() => setPinInfo(false)}>Close</Button>
            <Button asChild className="min-h-12"><Link to="/privacy">Set up distress code</Link></Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={loanOpen} onOpenChange={setLoanOpen}>
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Loan application · Mock liveness check</DialogTitle>
            <DialogDescription>Hackathon simulation only. No loan is submitted and no camera or identity data is collected.</DialogDescription>
          </DialogHeader>
          <div className="flex aspect-[2/1] items-center justify-center rounded-lg border border-dashed border-bank bg-muted"><ScanFace className="size-16 text-bank" aria-hidden="true" /></div>
          <p className="text-sm font-semibold text-foreground">{mockComplete ? "Mock result: application paused for a private review" : "Simulated verification against the SAFPS framework to block coerced debt"}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">{mockComplete ? "In this scenario, the application is held for a confidential conversation with the customer. This is a scripted outcome, not a fraud or coercion finding." : "Concept: a liveness step and a separate, confidential consent review before lending. Liveness alone cannot establish consent or detect coercion."}</p>
          <p className="text-sm text-muted-foreground">No connection to FNB or SAFPS. No real verification, lending decision, alert or protection is performed.</p>
          <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => setLoanOpen(false)}>Close</Button>{!mockComplete && <Button onClick={() => setMockComplete(true)}><ScanFace aria-hidden="true" />Run mock check</Button>}</div>
        </DialogContent>
      </Dialog>
      <Dialog open={document !== null || payment !== null} onOpenChange={(open) => { if (!open) { setDocument(null); setPayment(null); } }}>
        <DialogContent className="w-[calc(100%-2rem)] rounded-lg"><DialogHeader><DialogTitle>{document ?? payment}</DialogTitle><DialogDescription>{document ? "Sample document placeholder. No real bank records are available in this demo." : "Demo only. No money is sent and no payment details are collected."}</DialogDescription></DialogHeader><Button variant="outline" onClick={() => { setDocument(null); setPayment(null); }}>Close</Button></DialogContent>
      </Dialog>
    </div>
  );
}
