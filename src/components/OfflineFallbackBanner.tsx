import { useState } from "react";
import { toast } from "sonner";

const USSD_CODE = "*120*7867#";
const USSD_DIAL = "tel:*120*7867%23";
const TOLL_FREE = "0800 428 428";
const TOLL_FREE_DIAL = "tel:0800428428";

/**
 * Offline / zero-data fallback route to the national GBV Command Centre.
 * The USSD "Please Call Me" code is a Department of Social Development channel
 * (gbv.org.za, dsd.gov.za). It needs mobile signal, not data or an app.
 * Nothing here sends anything from the device — the user dials it themselves.
 */
export function OfflineFallbackBanner() {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(USSD_CODE);
      setCopied(true);
      toast("USSD code copied.");
    } catch {
      toast("Copying was blocked. Read the code off the screen instead.");
    }
  };

  return (
    <section
      aria-labelledby="offline-protocol-heading"
      className="mt-5 overflow-hidden rounded-2xl border border-brand-deep/40 bg-brand-deep text-primary-foreground"
    >
      <div className="px-4 py-4">
        <div className="flex items-start gap-2.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            className="mt-0.5 size-5 shrink-0"
          >
            <path d="M5 12.5a7 7 0 0 1 14 0" />
            <path d="M8.5 15.5a3.5 3.5 0 0 1 7 0" />
            <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
          </svg>
          <h2
            id="offline-protocol-heading"
            className="text-[11px] leading-snug font-semibold tracking-[0.14em] uppercase text-primary-foreground/95"
          >
            Load Shedding &amp; Zero-Data Offline Fallback Protocol
          </h2>
        </div>

        <p className="mt-3 font-display text-[30px] leading-none tracking-tight">{USSD_CODE}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-primary-foreground">
          GBV Command Centre <strong className="font-semibold">&ldquo;Please Call Me&rdquo;</strong> trigger. Dial it
          and a social worker calls you back, 24 hours a day.
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-primary-foreground/95">
          Runs on the ordinary voice network &mdash; no data, no airtime, no app, no smartphone, no account. It still
          needs mobile signal, and a code can be seen on your screen, so use it only when it is safe.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <a
            href={USSD_DIAL}
            className="flex min-h-11 items-center justify-center rounded-xl bg-primary-foreground px-4 text-[14px] font-medium text-brand-deep"
          >
            Dial {USSD_CODE}
          </a>
          <a
            href={TOLL_FREE_DIAL}
            className="flex min-h-11 items-center justify-center rounded-xl border border-primary-foreground/45 px-4 text-[14px] font-medium text-primary-foreground"
          >
            Call {TOLL_FREE}
          </a>
          <button
            type="button"
            onClick={copyCode}
            className="flex min-h-11 items-center justify-center rounded-xl border border-primary-foreground/45 px-4 text-[14px] font-medium text-primary-foreground"
          >
            {copied ? "Copied" : "Copy code"}
          </button>
        </div>

        <p className="mt-3 border-t border-primary-foreground/20 pt-3 text-[12px] leading-relaxed text-primary-foreground/95">
          No signal for the USSD menu? Text &ldquo;help&rdquo; to 31531, or add Skype contact HelpmeGBV. Availability of
          the USSD and &ldquo;Please Call Me&rdquo; options can differ by network &mdash; if one does not open, use the
          toll-free number. SafePath does not place these calls for you.
        </p>
      </div>
    </section>
  );
}
