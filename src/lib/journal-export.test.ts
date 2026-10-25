import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { buildPoliceSummary, type JournalExportEntry } from "./journal-export";

const entry: JournalExportEntry = {
  id: "earlier", title: "Incident", incident_date: "2026-10-20", incident_time: "09:15",
  location: "Office", description: "My own words.\nSecond line stays unchanged.",
  people_involved: "Person A", witnesses: "Person B", created_at: "2026-10-25T10:00:00Z",
};
const now = new Date("2026-10-25T11:00:00Z");

describe("police journal export", () => {
  test("includes only the entries the user selected", () => {
    const hidden = { ...entry, id: "excluded", description: "PRIVATE UNSELECTED ACCOUNT" };
    const result = buildPoliceSummary([entry, hidden], [entry.id], now);
    assert.ok(result.includes(entry.description));
    assert.ok(!result.includes(hidden.description));
    assert.ok(!result.includes("Entry reference: excluded"));
  });
  test("preserves original descriptions and factual fields without rewriting", () => {
    const result = buildPoliceSummary([entry], [entry.id], now);
    for (const value of [entry.description, "Office", "Person A", "Person B", "2026-10-20", "09:15", "2026-10-25T10:00:00.000Z"]) {
      assert.ok(result.includes(value));
    }
  });
  test("orders incident dates chronologically and does not infer missing dates", () => {
    const unknown = { ...entry, id: "unknown", incident_date: null, incident_time: null };
    const later = { ...entry, id: "later", incident_date: "2026-10-24" };
    const result = buildPoliceSummary([unknown, later, entry], ["unknown", "later", "earlier"], now);
    assert.ok(result.indexOf("Entry reference: earlier") < result.indexOf("Entry reference: later"));
    assert.ok(result.indexOf("Entry reference: later") < result.indexOf("Entry reference: unknown"));
    assert.ok(result.includes("Incident date: Not provided"));
  });
  test("rejects exports with no selected saved entries", () => {
    assert.throws(() => buildPoliceSummary([entry], [], now));
    assert.throws(() => buildPoliceSummary([entry], ["missing"], now));
  });
});