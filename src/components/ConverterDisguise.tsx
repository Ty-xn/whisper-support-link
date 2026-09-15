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

  return (
    <div className="flex min-h-screen flex-col bg-background px-5 pb-8 pt-10">
      <p className="text-sm font-medium text-muted-foreground">Calculator</p>
      <div className="mt-6 rounded-xl border border-border bg-card px-5 py-8 text-right">
        <span className="break-all font-display text-4xl text-foreground">{display}</span>
      </div>
      <div className="mt-6 grid flex-1 grid-cols-4 gap-2.5">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => append(key)}
            className="min-h-14 rounded-xl border border-border bg-card text-lg font-medium text-foreground active:bg-muted"
          >
            {key}
          </button>
        ))}
        <button
          type="button"
          onClick={evaluate}
          className="col-span-4 min-h-14 rounded-xl bg-primary text-lg font-medium text-primary-foreground active:opacity-90"
        >
          =
        </button>
      </div>
    </div>
  );
}
