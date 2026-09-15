import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { askAssistant } from "@/lib/assistant.functions";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Support Assistant — SafePath" },
      {
        name: "description",
        content:
          "Ask general questions about your options and next steps. The assistant explains resources; it never reports anything for you.",
      },
      { property: "og:title", content: "Support Assistant — SafePath" },
      { property: "og:description", content: "General guidance on options and next steps, at your pace." },
    ],
  }),
  component: AssistantPage,
});

const EXAMPLES = [
  "What options do I have if I experience harassment at work?",
  "How can I support a friend who is being abused?",
  "What information should I document?",
];

type Message = { role: "user" | "assistant"; content: string };

function AssistantPage() {
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: Message[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setError("");
    setBusy(true);
    try {
      const result = await ask({ data: { messages: next.slice(-12) } });
      if (result.error) setError(result.error);
      else setMessages([...next, { role: "assistant", content: result.reply }]);
    } catch {
      setError("The assistant could not be reached. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Support assistant</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        General information about your options and how to organise next steps. It does not give legal or medical
        advice, does not decide what happened to you, and never reports anything.
      </p>
      <p className="mt-3 rounded-xl border border-border bg-muted px-4 py-3 text-[13px] leading-relaxed text-foreground">
        Share only what you want to. You can ask questions without describing anything personal.
      </p>

      {messages.length === 0 && (
        <div className="mt-5">
          <p className="eyebrow">You could ask</p>
          <ul className="mt-2 space-y-2">
            {EXAMPLES.map((example) => (
              <li key={example}>
                <button
                  type="button"
                  onClick={() => send(example)}
                  className="surface min-h-12 w-full px-4 py-3 text-left text-[14px] text-foreground"
                >
                  {example}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ul className="mt-5 space-y-2.5">
        {messages.map((message, index) => (
          <li
            key={`${index}-${message.content.slice(0, 12)}`}
            className={`surface px-4 py-3 ${message.role === "user" ? "bg-muted" : ""}`}
          >
            <p className="eyebrow">{message.role === "user" ? "You" : "Assistant"}</p>
            <p className="mt-1 whitespace-pre-wrap text-[14px] leading-relaxed text-foreground">{message.content}</p>
          </li>
        ))}
        {busy && <li className="surface animate-pulse px-4 py-6 text-[14px] text-muted-foreground">Thinking…</li>}
      </ul>

      {error && (
        <p role="alert" className="mt-3 text-[13px] text-destructive">
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-5"
      >
        <label htmlFor="message" className="eyebrow">
          Your question
        </label>
        <textarea
          id="message"
          rows={3}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
          className="mt-2 w-full rounded-xl border border-input bg-card px-4 py-3 text-[15px] text-foreground"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="mt-2 min-h-12 w-full rounded-xl bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send"}
        </button>
      </form>

      <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
        Conversations are not saved. Leaving this page clears them.
      </p>
    </AppShell>
  );
}
