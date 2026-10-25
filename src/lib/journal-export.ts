export type JournalExportEntry = {
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

export function buildPoliceSummary(entries: JournalExportEntry[], selectedIds: string[], generatedAt: Date): string {
  const selected = entries.filter((entry) => selectedIds.includes(entry.id));
  if (selected.length === 0) throw new Error("Select at least one entry.");
  selected.sort((a, b) => {
    // Unknown incident dates follow dated entries; creation dates are not incident dates.
    const aDate = a.incident_date ?? "9999-12-31";
    const bDate = b.incident_date ?? "9999-12-31";
    return aDate.localeCompare(bDate) || (a.incident_time ?? "").localeCompare(b.incident_time ?? "") || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
  });
  return [
    "PRIVATE JOURNAL — SUMMARY FOR POLICE",
    `Exported at (UTC): ${generatedAt.toISOString()}`,
    `Entries included: ${selected.length}`,
    "Prepared from the account holder's saved journal. No information has been sent to police.",
    "This is a personal record, not a sworn affidavit, certified evidence, or an official police form.",
    "Statements below are reproduced as written; they have not been independently verified.",
    "Times of incidents are as entered, with no time zone assumed. Original entry creation times are shown in UTC.",
    "Attachments are not included. Keep originals separately if it is safe to do so.",
    "",
    ...selected.flatMap((entry, index) => [
      `ENTRY ${index + 1}: ${entry.title}`,
      `Entry reference: ${entry.id}`,
      `Incident date: ${entry.incident_date ?? "Not provided"}`,
      `Approximate time: ${entry.incident_time ?? "Not provided"}`,
      `Location: ${entry.location ?? "Not provided"}`,
      `People involved: ${entry.people_involved ?? "Not provided"}`,
      `Witnesses: ${entry.witnesses ?? "Not provided"}`,
      `Original entry created at (UTC): ${new Date(entry.created_at).toISOString()}`,
      "What happened (as written):",
      entry.description,
      "",
      "----------------------------------------",
      "",
    ]),
  ].join("\n");
}

export async function deliverJournalFile(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const file = new File([blob], filename, { type: blob.type });
  if (matchMedia("(pointer: coarse)").matches && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: "Private journal summary" });
      return;
    } catch (error) {
      if ((error as DOMException).name === "AbortError") return;
    }
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}