// Smoke e2e against a running `npm run dev` (BASE defaults to wrangler's port): the title
// draws, a tap dives into the pond, a run starts and gets a token, and the board API answers.
import { chromium } from "playwright";
import assert from "node:assert/strict";

const BASE = process.env.BASE || "http://localhost:8787";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 405, height: 540 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
const lit = () => page.evaluate(() => {
  const c = document.getElementById("c"), d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
  let n = 0; for (let i = 0; i < d.length; i += 4) n += d[i] > 128; return n;
});
try {
  await page.goto(BASE);
  await page.waitForTimeout(800);
  assert.ok((await lit()) > 300, "title animation draws");
  const start = page.waitForResponse((r) => r.url().endsWith("/api/start"));
  await page.mouse.click(200, 300);
  assert.ok((await (await start).json()).token, "a run gets a signed token");
  await page.waitForTimeout(2600);
  assert.ok((await lit()) > 20, "the pond and fish draw");
  const scores = await (await fetch(BASE + "/api/scores")).json();
  assert.ok(Array.isArray(scores), "board API answers");
  assert.deepEqual(errors, []);
  console.log("e2e ok");
} finally {
  await browser.close();
}
