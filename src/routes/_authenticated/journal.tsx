import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { buildPoliceSummary, deliverJournalFile } from "@/lib/journal-export";

export const Route = createFileRoute("/_authenticated/journal")({
  head: () => ({
    meta: [
      { title: "Private Journal — SafePath" },
      {
        name: "description",
        content:
          "Write down what happened, in your own words and your own time. Entries are private to you and are never reported for you.",
      },
      { property: "og:title", content: "Private Journal — SafePath" },
      { property: "og:description", content: "A private record only you can read." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: JournalPage,
});

type Entry = {
  id: string;
  title: string;
  incident_date: string | null;
  incident_time: string | null;
  location: string | null;
  description: string;
  people_involved: string | null;
  witnesses: string | null;
  created_at: string;
};

type FormState = {
  title: string;
  incident_date: string;
  incident_time: string;
  location: string;
  description: string;
  people_involved: string;
  witnesses: string;
};

const EMPTY: FormState = {
  title: "",
  incident_date: "",
  incident_time: "",
  location: "",
  description: "",
  people_involved: "",
  witnesses: "",
};

function JournalPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [editing, setEditing] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [showPoliceExport, setShowPoliceExport] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const entries = useQuery({
    queryKey: ["journal_entries"],
    queryFn: async (): Promise<Entry[]> => {
      const { data, error: queryError } = await supabase
        .from("journal_entries")
        .select("id,title,incident_date,incident_time,location,description,people_involved,witnesses,created_at")
        .order("created_at", { ascending: false });
      if (queryError) throw queryError;
      return (data ?? []) as Entry[];
    },
  });

  const save = useMutation({
    mutationFn: async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error("Not signed in");
      const payload = {
        user_id: userId,
        title: form.title.trim(),
        incident_date: form.incident_date || null,
        incident_time: form.incident_time || null,
        location: form.location.trim() || null,
        description: form.description.trim(),
        people_involved: form.people_involved.trim() || null,
        witnesses: form.witnesses.trim() || null,
      };
      if (editing) {
        const { error: updateError } = await supabase
          .from("journal_entries")
          .update(payload)
          .eq("id", editing);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from("journal_entries").insert(payload);
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      setForm(EMPTY);
      setEditing(null);
      setShowForm(false);
      toast.success("Saved. This is stored privately and has not been reported.");
    },
    onError: () => setError("The entry could not be saved. Please try again."),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error: deleteError } = await supabase.from("journal_entries").delete().eq("id", id);
      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal_entries"] });
      toast.success("Entry deleted.");
    },
    onError: () => toast.error("The entry could not be deleted."),
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    if (form.title.trim().length < 2) {
      setError("Give the entry a short title.");
      return;
    }
    if (form.description.trim().length < 5) {
      setError("Add a short description of what happened.");
      return;
    }
    save.mutate();
  };

  const exportEntries = () => {
    const list = entries.data ?? [];
    if (list.length === 0) return;
    const text = list
      .map((entry) =>
        [
          entry.title,
          `Date: ${entry.incident_date ?? "not given"}${entry.incident_time ? ` ${entry.incident_time}` : ""}`,
          `Location: ${entry.location ?? "not given"}`,
          `People involved: ${entry.people_involved ?? "not given"}`,
          `Witnesses: ${entry.witnesses ?? "not given"}`,
          "",
          entry.description,
          "",
          "----",
        ].join("\n"),
      )
      .join("\n");
    void deliverJournalFile(text, "safepath-journal.txt").catch(() => toast.error("The download could not be prepared. Please try again."));
  };

  const startEdit = (entry: Entry) => {
    setEditing(entry.id);
    setShowForm(true);
    setForm({
      title: entry.title,
      incident_date: entry.incident_date ?? "",
      incident_time: entry.incident_time ?? "",
      location: entry.location ?? "",
      description: entry.description,
      people_involved: entry.people_involved ?? "",
      witnesses: entry.witnesses ?? "",
    });
  };

  const field = (
    key: keyof FormState,
    label: string,
    type: "text" | "date" | "time" | "textarea",
    optional = false,
  ) => (
    <div>
      <label htmlFor={key} className="eyebrow">
        {label}
        {optional ? " (optional)" : ""}
      </label>
      {type === "textarea" ? (
        <textarea
          id={key}
          rows={5}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="mt-2 w-full rounded-xl border border-input bg-background px-4 py-3 text-[15px] text-foreground"
        />
      ) : (
        <input
          id={key}
          type={type}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="mt-2 min-h-12 w-full rounded-xl border border-input bg-background px-4 text-[15px] text-foreground"
        />
      )}
    </div>
  );

  return (
    <AppShell>
      <h1 className="font-display text-[28px] leading-tight text-foreground">Private journal</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
        A record in your own words, kept only for you. Write as little or as much as you want.
      </p>
      <p className="mt-3 rounded-xl border border-border bg-muted px-4 py-3 text-[13px] leading-relaxed text-foreground">
        Documenting an incident does not automatically report it. Nothing here is shared with any organisation or
        authority, and administrators cannot see it.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setForm(EMPTY);
            setShowForm(!showForm);
          }}
          className="min-h-12 flex-1 rounded-xl bg-primary text-[15px] font-medium text-primary-foreground"
        >
          {showForm ? "Close" : "New entry"}
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={exportEntries}
          disabled={(entries.data ?? []).length === 0}
          className="min-h-12 flex-1 rounded-xl border border-border text-[15px] font-medium text-foreground disabled:opacity-50"
        >
          <Download aria-hidden="true" /> Export
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!entries.data?.length || entries.isError || entries.isFetching}
          className="min-h-12 w-full whitespace-normal text-[15px]"
          onClick={() => {
            setSelectedIds([]);
            setShowPoliceExport(true);
          }}
        >
          <FileText aria-hidden="true" /> Export for police
        </Button>
      </div>

      <Dialog open={showPoliceExport} onOpenChange={setShowPoliceExport}>
        <DialogContent className="max-h-[85dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle>Export for police</DialogTitle>
            <DialogDescription className="mt-2 leading-relaxed">
              Choose the saved entries to include in a text summary. Nothing is sent to police.
              This is not an affidavit or certified evidence. Attachments are not included.
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm leading-relaxed text-muted-foreground">
            The downloaded file is no longer protected by SafePath. It may be visible in your downloads or on a shared device.
            Only save or share it when it is safe for you.
          </p>
          <fieldset className="space-y-3">
            <legend className="mb-3 text-sm font-medium">Entries to include</legend>
            {(entries.data ?? []).map((entry) => (
              <label key={entry.id} className="flex min-h-12 cursor-pointer items-start gap-3 border-b border-border py-2">
                <input
                  type="checkbox"
                  className="mt-1 size-5 shrink-0 accent-primary"
                  checked={selectedIds.includes(entry.id)}
                  onChange={(event) => setSelectedIds((current) => event.target.checked ? [...current, entry.id] : current.filter((id) => id !== entry.id))}
                />
                <span className="min-w-0 break-words text-sm text-foreground">
                  {entry.title}
                  <span className="mt-1 block text-xs text-muted-foreground">{entry.incident_date ?? "Incident date not provided"}</span>
                </span>
              </label>
            ))}
          </fieldset>
          <div className="flex flex-wrap justify-end gap-2">
            <Button variant="outline" className="min-h-12" onClick={() => setShowPoliceExport(false)}>Cancel</Button>
            <Button
              className="min-h-12 whitespace-normal"
              disabled={!selectedIds.some((id) => entries.data?.some((entry) => entry.id === id)) || entries.isError || entries.isFetching}
              onClick={() => {
                try {
                  const text = buildPoliceSummary(entries.data ?? [], selectedIds, new Date());
                  void deliverJournalFile(text, "journal-summary.txt").catch(() => toast.error("The download could not be prepared. Please try again."));
                } catch {
                  toast.error("Choose at least one saved entry to export.");
                }
              }}
            >
              <Download aria-hidden="true" /> Download summary
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {showForm && (
        <form onSubmit={submit} className="surface mt-4 space-y-4 px-4 py-4">
          {field("title", "Title", "text")}
          {field("incident_date", "Date", "date", true)}
          {field("incident_time", "Approximate time", "time", true)}
          {field("location", "Location", "text", true)}
          {field("description", "What happened", "textarea")}
          {field("people_involved", "People involved", "text", true)}
          {field("witnesses", "Witnesses", "text", true)}
          {error && (
            <p role="alert" className="text-[13px] text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={save.isPending}
            className="min-h-12 w-full rounded-xl bg-primary text-[15px] font-medium text-primary-foreground disabled:opacity-50"
          >
            {save.isPending ? "Saving…" : editing ? "Save changes" : "Save entry"}
          </button>
        </form>
      )}

      {entries.isLoading && <div className="surface mt-4 h-28 animate-pulse bg-muted" />}

      {entries.isError && (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">Your entries could not be loaded.</p>
          <button
            type="button"
            onClick={() => entries.refetch()}
            className="mt-3 min-h-11 rounded-xl bg-primary px-4 text-[14px] font-medium text-primary-foreground"
          >
            Try again
          </button>
        </div>
      )}

      {entries.data && entries.data.length === 0 && !showForm && (
        <div className="surface mt-4 px-4 py-6">
          <p className="text-[15px] text-foreground">Nothing written yet.</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            You can start whenever you are ready, and delete anything at any time.
          </p>
        </div>
      )}

      <ul className="mt-4 space-y-2.5">
        {(entries.data ?? []).map((entry) => (
          <li key={entry.id} className="surface px-4 py-4">
            <p className="eyebrow">{entry.incident_date ?? new Date(entry.created_at).toLocaleDateString()}</p>
            <h2 className="mt-1 font-display text-[18px] text-foreground">{entry.title}</h2>
            <p className="mt-1.5 whitespace-pre-wrap text-[14px] leading-relaxed text-muted-foreground">
              {entry.description}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => startEdit(entry)}
                className="min-h-11 flex-1 rounded-xl border border-border text-[14px] font-medium text-foreground"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove.mutate(entry.id)}
                className="min-h-11 flex-1 rounded-xl border border-border text-[14px] font-medium text-destructive"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
