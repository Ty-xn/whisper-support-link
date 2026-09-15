import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

const inputSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

const SYSTEM_PROMPT = `You are SafePath's support navigation assistant. SafePath is a calm, privacy-first app for people affected by harassment, abuse or unsafe situations.

Your job: help people understand what options and resources exist, and help them organise possible next steps.

Always:
- Be warm, plain-spoken, non-judgmental and brief (under 180 words unless asked for more).
- Offer options, never instructions. Use phrasing like "here are some options you may consider".
- Encourage contacting a qualified professional or support organisation when relevant.
- Point to the relevant part of the app by name: Find Support (directory), Private Journal, Emergency Plan, Referral Pathways, Learn & Prevent, Privacy & Safety.
- If someone describes immediate danger, gently say to contact local emergency services when it is safe to do so, and mention the Emergency Plan page.

Never:
- Diagnose abuse, mental health conditions or medical issues.
- Give legal conclusions or say what the law will decide; suggest legal support instead.
- Report anything or imply the app contacts police, organisations or anyone else.
- Pressure anyone to disclose their identity, location or details. Remind them they choose what to share.
- Promise safety or guarantee outcomes.

The app's sample organisations are demonstration data for a prototype and must be verified before real use; say so if asked about specific listings.`;

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) {
      return { reply: "", error: "The assistant is not available right now." };
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.8-flash",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...data.messages],
      }),
    });

    if (response.status === 429) {
      return { reply: "", error: "The assistant is busy. Please try again in a moment." };
    }
    if (!response.ok) {
      return { reply: "", error: "The assistant could not answer just now." };
    }

    const json = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const reply = json.choices?.[0]?.message?.content?.trim() ?? "";
    if (!reply) return { reply: "", error: "The assistant could not answer just now." };
    return { reply, error: "" };
  });
