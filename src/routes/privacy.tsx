import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { hashPin, readLockConfig, writeLockConfig, clearLockConfig } from "@/lib/safety";
import { toast } from "sonner";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { title: "Privacy & Safety — SafePath" },
      {
        name: "description",
        content:
          "How SafePath handles your information: minimal data, anonymous browsing, your own deletion controls, and an optional disguise code.",
      },
      { property: "og:title", content: "Privacy & Safety — SafePath" },
      { property: "og:description", content: "Minimal data, anonymous browsing and controls that belong to you." },
    ],
  }),
  component: PrivacyPage,
});

const PRINCIPLES = [
  ["We collect as little as possible", "Only what a feature needs to work. No profiles are public by default."],
  ["You can browse anonymously", "The directory, pathways and readings need no account and no name."],
  ["Private things stay private", "Journal entries and emergency plans are readable only by the account that wrote them. Administrators cannot see them."],
  ["Nothing is reported for you", "Documenting an incident does not report it. We never contact organisations or authorities on your behalf."],
  ["You can delete your own records", "Every entry, contact and plan can be deleted by you at any time."],
  ["No advertising, no tracking of sensitive activity", "We do not build profiles of what you read or search."],
  ["No location tracking", "Location is only ever text you choose to type."],
];

function PrivacyPage() {
  const [hasLock, setHasLock] = useState(false);
  const [pin, setPin] = useState("");
  const [duress, setDuress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setHasLock(Boolean(readLockConfig()));
  }, []);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (!/^\d{4,8}$/.test(pin) || !/^\d{4,8}$/.test(duress)) {
      setError("Both codes must be 4 to 8 digits.");
      return;
    }
    if (pin === duress) {
      setError("The two codes must be different.");
      return;
    }
    writeLockConfig({
      enabled: true,
      unlockHash: await hashPin(pin),
      duressHash: await hashPin(duress),
    });
    setHasLock(true);
    setPin("");
    setDuress("");
    window.dispatchEvent(new Event("safepath:lock-updated"));
    toast.success("Disguise set up. Next time this device opens SafePath, it shows a calculator.");
  };

  const remove = () => {
    clearLockConfig();
    setHasLock(false);
    window.dispatchEvent(new Event("safepath:lock-updated"));
    toast.success("Disguise turned off on this device.");
  };

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Privacy &amp; safety</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        In plain language: what we do, what we never do, and what you control.
      </p>

      <ul className="mt-5 space-y-2.5">
        {PRINCIPLES.map(([title, body]) => (
          <li key={title} className="surface px-4 py-4">
            <h2 className="font-display text-[17px] text-foreground">{title}</h2>
            <p className="mt-1 text-[14px] leading-relaxed text-muted-foreground">{body}</p>
          </li>
        ))}
      </ul>

      <section className="mt-8">
        <h2 className="font-display text-[22px] text-foreground">Disguise this app</h2>
        <p className="mt-2 text-[14px] leading-relaxed text-muted-foreground">
          You can make SafePath open as a plain calculator on this device. Type your unlock code and press{" "}
          <span className="font-medium text-foreground">=</span> to open the app. Typing your distress code instead
          keeps the calculator on screen, so nothing of SafePath is shown.
        </p>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          The codes are stored only in this browser, never sent anywhere, and cannot be recovered if forgotten. This
          reduces what a person nearby can see. It cannot make you safe on its own.
        </p>

        {hasLock ? (
          <div className="surface mt-4 px-4 py-4">
            <p className="text-[14px] text-foreground">The disguise is on for this browser.</p>
            <button
              type="button"
              onClick={remove}
              className="mt-3 min-h-11 rounded-xl border border-border px-4 text-[14px] font-medium text-foreground"
            >
              Turn off disguise
            </button>
          </div>
        ) : (
          <form onSubmit={save} className="surface mt-4 space-y-4 px-4 py-4">
            <div>
              <label htmlFor="pin" className="eyebrow">
                Unlock code
              </label>
              <input
                id="pin"
                inputMode="numeric"
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] tracking-[0.3em] text-foreground"
              />
            </div>
            <div>
              <label htmlFor="duress" className="eyebrow">
                Distress code
              </label>
              <input
                id="duress"
                inputMode="numeric"
                autoComplete="off"
                value={duress}
                onChange={(e) => setDuress(e.target.value)}
                className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] tracking-[0.3em] text-foreground"
              />
            </div>
            {error && (
              <p role="alert" className="text-[13px] text-destructive">
                {error}
              </p>
            )}
            <button
              type="submit"
              className="min-h-12 w-full rounded-xl bg-primary text-[15px] font-medium text-primary-foreground"
            >
              Turn on disguise
            </button>
          </form>
        )}
      </section>

      <p className="mt-6 text-[12px] leading-relaxed text-muted-foreground">
        This is a prototype built for a hackathon. Sample organisations and sample readings are labelled as
        demonstration data and must be verified before any real use.
      </p>
    </AppShell>
  );
}
