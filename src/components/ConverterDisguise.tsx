import { useState } from "react";

const KEYS = ["7", "8", "9", "C", "4", "5", "6", "÷", "1", "2", "3", "×", "0", ".", "−", "+"];

/**
 * A plain, working calculator shown instead of SafePath.
 * Typing the unlock code and pressing "=" opens the app.
 * Typing the distress code and pressing "=" keeps the calculator open.
 */
export function ConverterDisguise({ onSubmitCode }: { onSubmitCode: (code: string) => void }) {
  const [display, setDisplay] = useState("0");
  const [expression, setExpression] = useState("");

  const append = (key: string) => {
    if (key === "C") {
      setDisplay("0");
      setExpression("");
      return;
    }
    const symbol = key === "÷" ? "/" : key === "×" ? "*" : key === "−" ? "-" : key;
    setExpression((prev) => prev + symbol);
    setDisplay((prev) => (prev === "0" && /[0-9.]/.test(key) ? key : prev + key));
  };

  const evaluate = () => {
    const digitsOnly = display.replace(/[^0-9]/g, "");
    if (digitsOnly.length >= 4 && /^[0-9]+$/.test(display)) {
      onSubmitCode(display);
    }
    try {
      if (!/^[0-9+\-*/.\s]+$/.test(expression)) throw new Error("bad");
      // eslint-disable-next-line no-new-func
      const result = Function(`"use strict";return (${expression})`)() as number;
      setDisplay(Number.isFinite(result) ? String(Math.round(result * 1e6) / 1e6) : "0");
    } catch {
      setDisplay("0");
    }
    setExpression("");
  };

  const isOp = (k: string) => ["÷", "×", "−", "+"].includes(k);
  return (
    <div className="flex min-h-[100dvh] items-stretch justify-center bg-background sm:items-center sm:p-6">
      <div className="flex w-full max-w-[400px] flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6 sm:rounded-3xl sm:border sm:border-border sm:bg-card sm:p-5 sm:shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Calculator</p>
        <div className="mt-4 flex min-h-[7rem] flex-1 items-end justify-end overflow-hidden rounded-2xl bg-muted px-5 py-5 sm:flex-none">
          <span
            aria-live="polite"
            className="block max-w-full truncate text-right font-display text-5xl tabular-nums text-foreground"
          >
            {display}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-3">
          {KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => append(key)}
              aria-label={key === "C" ? "Clear" : key}
              className={`aspect-square rounded-2xl text-2xl font-medium transition-colors active:scale-[0.97] ${
                isOp(key)
                  ? "bg-secondary text-secondary-foreground"
                  : key === "C"
                    ? "bg-muted text-muted-foreground"
                    : "border border-border bg-card text-foreground hover:bg-muted"
              }`}
            >
              {key}
            </button>
          ))}
          <button
            type="button"
            onClick={evaluate}
            aria-label="Equals"
            className="col-span-4 h-16 rounded-2xl bg-primary text-2xl font-medium text-primary-foreground active:opacity-90"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
