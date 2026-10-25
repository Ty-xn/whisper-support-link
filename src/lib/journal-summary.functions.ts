import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SYSTEM_PROMPT = `You turn a person's private journal entries into a clear, neutral, date-ordered incident summary for them to review.
Rules:
- Order incidents by incident date (undated last). Use headings with the date and title.
- Use only facts written in the entries. Never invent, assume or infer details, motives, or outcomes.
- Neutral, factual tone. Attribute statements: "The writer records that...".
- Do not diagnose, label behaviour as a crime, or make legal conclusions.
- Note missing details (date, time, location) plainly.
- End with a short line: "Draft generated with AI from the writer's journal. Review and correct before use. Nothing has been reported."
Plain text only, no markdown tables.`;

export const summariseJournal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ ids: z.array(z.string().uuid()).min(1).max(30) }).parse(data))
  .handler(async ({ data, context }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { summary: "", error: "The summary tool is not available right now." };

    // Read as the signed-in user; row-level security limits this to their own entries.
    const { data: rows, error } = await context.supabase
      .from("journal_entries")
      .select("id,title,incident_date,incident_time,location,description,people_involved,witnesses")
      .in("id", data.ids);
    if (error || !rows?.length) return { summary: "", error: "Those entries could not be read." };

    const text = rows
      .map(
        (r) =>
          `TITLE: ${r.title}\nDATE: ${r.incident_date ?? "not given"}\nTIME: ${r.incident_time ?? "not given"}\nLOCATION: ${r.location ?? "not given"}\nPEOPLE: ${r.people_involved ?? "not given"}\nWITNESSES: ${r.witnesses ?? "not given"}\nDESCRIPTION:\n${r.description}`,
      )
      .join("\n\n---\n\n");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: text },
        ],
      }),
    });
    if (res.status === 429) return { summary: "", error: "The summary tool is busy. Try again shortly." };
    if (res.status === 402) return { summary: "", error: "AI usage credits have run out for this app." };
    if (!res.ok) return { summary: "", error: "A summary could not be created just now." };
    const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const summary = json.choices?.[0]?.message?.content?.trim() ?? "";
    return summary ? { summary, error: "" } : { summary: "", error: "A summary could not be created just now." };
  });
