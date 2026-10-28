import { test } from "node:test";
import assert from "node:assert/strict";
import { EXIT_DESTINATION, INACTIVITY_EXIT_MS, quickExit } from "./safety";

test("inactivity exit is set to exactly two minutes", () => {
  assert.equal(INACTIVITY_EXIT_MS, 120000);
});

test("Quick Exit clears the unlocked session and replaces the page with Google", () => {
  const original = Object.getOwnPropertyDescriptor(globalThis, "window");
  const removed: string[] = [];
  const destinations: string[] = [];
  Object.defineProperty(globalThis, "window", { configurable: true, value: {
    sessionStorage: { removeItem: (key: string) => removed.push(key) },
    location: { replace: (url: string) => destinations.push(url) },
  } });
  try {
    quickExit();
    assert.deepEqual(removed, ["safepath.session"]);
    assert.deepEqual(destinations, ["https://www.google.com"]);
    assert.equal(EXIT_DESTINATION, "https://www.google.com");
  } finally {
    if (original) Object.defineProperty(globalThis, "window", original);
    else Reflect.deleteProperty(globalThis, "window");
  }
});