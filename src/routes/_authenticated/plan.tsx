import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/plan")({
  head: () => ({
    meta: [
      { title: "Emergency Plan — SafePath" },
      {
        name: "description",
        content:
          "Keep trusted contacts, important numbers, a message you can send quickly, a safety checklist and a safe meeting place.",
      },
      { property: "og:title", content: "Emergency Plan — SafePath" },
      { property: "og:description", content: "Your own plan, prepared calmly in advance." },
    ],
  }),
  component: PlanPage,
});

type Contact = { id: string; name: string; relationship: string | null; phone: string; notes: string | null };
type ChecklistItem = { label: string; done: boolean };
type Plan = {
  id?: string;
  prewritten_message: string;
  safe_location: string;
  emergency_numbers: { label: string; number: string }[];
  checklist: ChecklistItem[];
};

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { label: "Keep a charged phone within reach", done: false },
  { label: "Know two ways out of the building", done: false },
  { label: "Keep ID and key documents together", done: false },
  { label: "Agree a code word with someone you trust", done: false },
  { label: "Keep a small amount of cash aside", done: false },
];

function PlanPage() {
  const queryClient = useQueryClient();
  const [contact, setContact] = useState({ name: "", relationship: "", phone: "", notes: "" });
  const [contactError, setContactError] = useState("");
  const [plan, setPlan] = useState<Plan>({
    prewritten_message: "",
    safe_location: "",
    emergency_numbers: [],
    checklist: DEFAULT_CHECKLIST,
  });

  const contacts = useQuery({
    queryKey: ["emergency_contacts"],
    queryFn: async (): Promise<Contact[]> => {
      const { data, error } = await supabase
        .from("emergency_contacts")
        .select("id,name,relationship,phone,notes")
        .order("created_at");
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });

  const planQuery = useQuery({
    queryKey: ["emergency_plan"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("emergency_plans")
        .select("id,prewritten_message,safe_location,emergency_numbers,checklist")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const data = planQuery.data;
    if (!data) return;
    setPlan({
      id: data.id,
      prewritten_message: data.prewritten_message ?? "",
      safe_location: data.safe_location ?? "",
      emergency_numbers: (data.emergency_numbers as Plan["emergency_numbers"]) ?? [],
      checklist: ((data.checklist as ChecklistItem[]) ?? []).length
        ? (data.checklist as ChecklistItem[])
        : DEFAULT_CHECKLIST,
    });
  }, [planQuery.data]);

  const addContact = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: userId,
        name: contact.name.trim(),
        relationship: contact.relationship.trim() || null,
        phone: contact.phone.trim(),
        notes: contact.notes.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_contacts"] });
      setContact({ name: "", relationship: "", phone: "", notes: "" });
      toast.success("Contact saved.");
    },
    onError: () => setContactError("The contact could not be saved."),
  });

  const removeContact = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["emergency_contacts"] }),
  });

  const savePlan = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const { error } = await supabase.from("emergency_plans").upsert(
        {
          user_id: userId,
          prewritten_message: plan.prewritten_message.trim(),
          safe_location: plan.safe_location.trim(),
          emergency_numbers: plan.emergency_numbers,
          checklist: plan.checklist,
        },
        { onConflict: "user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emergency_plan"] });
      toast.success("Plan saved.");
    },
    onError: () => toast.error("The plan could not be saved."),
  });

  const submitContact = (event: React.FormEvent) => {
    event.preventDefault();
    setContactError("");
    if (contact.name.trim().length < 2) {
      setContactError("Add a name for this contact.");
      return;
    }
    if (contact.phone.trim().length < 5) {
      setContactError("Add a phone number.");
      return;
    }
    addContact.mutate();
  };

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Emergency plan</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        Prepared quietly in advance, so less has to be decided in a difficult moment.
      </p>
      <p className="mt-3 rounded-xl border border-clay/40 bg-muted px-4 py-3 text-[13px] leading-relaxed text-foreground">
        If you are in immediate danger, contact local emergency services when it is safe to do so. SafePath cannot call
        anyone for you and does not alert police or any organisation.
      </p>

      <section className="mt-7">
        <h2 className="font-display text-[22px] text-foreground">Trusted contacts</h2>
        {contacts.isLoading && <div className="surface mt-3 h-20 animate-pulse bg-muted" />}
        {contacts.data && contacts.data.length === 0 && (
          <p className="mt-3 text-[14px] text-muted-foreground">No contacts saved yet.</p>
        )}
        <ul className="mt-3 space-y-2.5">
          {(contacts.data ?? []).map((item) => (
            <li key={item.id} className="surface flex items-center justify-between gap-3 px-4 py-3">
              <div>
                <p className="text-[15px] font-medium text-foreground">{item.name}</p>
                <p className="text-[13px] text-muted-foreground">
                  {item.relationship ? `${item.relationship} · ` : ""}
                  {item.phone}
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`tel:${item.phone.replace(/\s/g, "")}`}
                  className="flex min-h-11 items-center rounded-xl bg-primary px-3 text-[13px] font-medium text-primary-foreground"
                >
                  Call
                </a>
                <button
                  type="button"
                  onClick={() => removeContact.mutate(item.id)}
                  aria-label={`Remove ${item.name}`}
                  className="min-h-11 rounded-xl border border-border px-3 text-[13px] text-muted-foreground"
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form onSubmit={submitContact} className="surface mt-3 space-y-3 px-4 py-4">
          <div>
            <label htmlFor="cname" className="eyebrow">
              Name
            </label>
            <input
              id="cname"
              value={contact.name}
              onChange={(e) => setContact({ ...contact, name: e.target.value })}
              className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
            />
          </div>
          <div>
            <label htmlFor="crel" className="eyebrow">
              Relationship (optional)
            </label>
            <input
              id="crel"
              value={contact.relationship}
              onChange={(e) => setContact({ ...contact, relationship: e.target.value })}
              className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
            />
          </div>
          <div>
            <label htmlFor="cphone" className="eyebrow">
              Phone
            </label>
            <input
              id="cphone"
              type="tel"
              value={contact.phone}
              onChange={(e) => setContact({ ...contact, phone: e.target.value })}
              className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
            />
          </div>
          {contactError && (
            <p role="alert" className="text-[13px] text-destructive">
              {contactError}
            </p>
          )}
          <button
            type="submit"
            disabled={addContact.isPending}
            className="min-h-12 w-full rounded-xl border border-border text-[15px] font-medium text-foreground disabled:opacity-50"
          >
            Add contact
          </button>
        </form>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-[22px] text-foreground">Your plan</h2>
        <div className="surface mt-3 space-y-4 px-4 py-4">
          <div>
            <label htmlFor="message" className="eyebrow">
              Message you can send quickly
            </label>
            <textarea
              id="message"
              rows={3}
              value={plan.prewritten_message}
              onChange={(e) => setPlan({ ...plan, prewritten_message: e.target.value })}
              placeholder="I need help. Please call me."
              className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] text-foreground"
            />
          </div>
          <div>
            <label htmlFor="safe" className="eyebrow">
              Safe meeting place (optional)
            </label>
            <input
              id="safe"
              value={plan.safe_location}
              onChange={(e) => setPlan({ ...plan, safe_location: e.target.value })}
              className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
            />
          </div>

          <fieldset>
            <legend className="eyebrow">Safety checklist</legend>
            <ul className="mt-2 space-y-2">
              {plan.checklist.map((item, index) => (
                <li key={item.label}>
                  <label className="flex min-h-11 items-center gap-3 text-[14px] text-foreground">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={() =>
                        setPlan({
                          ...plan,
                          checklist: plan.checklist.map((entry, i) =>
                            i === index ? { ...entry, done: !entry.done } : entry,
                          ),
                        })
                      }
                      className="size-5 rounded border-input"
                    />
                    {item.label}
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>

          <button
            type="button"
            onClick={() => savePlan.mutate()}
            disabled={savePlan.isPending}
            className="min-h-12 w-full rounded-xl bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {savePlan.isPending ? "Saving…" : "Save plan"}
          </button>
        </div>
      </section>
    </AppShell>
  );
}
