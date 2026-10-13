// node --test: the score checks that guard the global board.
import { test } from "node:test";
import assert from "node:assert/strict";
import { makeToken, checkScore } from "./src/worker.js";

const S = "test-secret";

test("accepts a score within the run's real time", async () => {
  const token = await makeToken(S, 1_000_000);
  assert.equal(await checkScore(S, { token, initials: "ABC", ms: 30_000 }, 1_031_000), null);
});

test("rejects scores longer than the run, forged tokens and bad initials", async () => {
  const token = await makeToken(S, 1_000_000);
  assert.equal(await checkScore(S, { token, initials: "ABC", ms: 60_000 }, 1_031_000), "score longer than the run");
  assert.equal(await checkScore("other", { token, initials: "ABC", ms: 1 }, 1_031_000), "bad token");
  const [, id, sig] = token.split(".");
  assert.equal(await checkScore(S, { token: `0.${id}.${sig}`, initials: "ABC", ms: 1 }, 1_031_000), "bad token");
  assert.equal(await checkScore(S, { token, initials: "abc", ms: 1 }, 1_031_000), "bad initials");
  assert.equal(await checkScore(S, { token, initials: "ABC", ms: 1.5 }, 1_031_000), "bad score");
});
