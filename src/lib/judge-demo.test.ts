import { test } from "node:test";
import assert from "node:assert/strict";
import { isJudgeDemoUser, JUDGE_DEMO_EMAIL, JUDGE_DEMO_USER_ID } from "./judge-demo";

test("judge demo access is restricted to the separate dummy account", () => {
  assert.equal(isJudgeDemoUser({ id: JUDGE_DEMO_USER_ID, email: JUDGE_DEMO_EMAIL }), true);
  assert.equal(isJudgeDemoUser({ id: "real-user", email: JUDGE_DEMO_EMAIL }), false);
  assert.equal(isJudgeDemoUser({ id: JUDGE_DEMO_USER_ID, email: "real@example.com" }), false);
  assert.equal(isJudgeDemoUser(null), false);
});