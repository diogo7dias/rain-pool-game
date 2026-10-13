// The high-score API: /api/start hands out a signed run token, /api/score accepts a score
// no longer than the real time since that token, once per token; /api/scores is the top 10.
const enc = new TextEncoder();
const MAX_MS = 2 * 60 * 60 * 1000;
const SLACK_MS = 2000;

async function sign(secret, msg) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(msg)));
  return btoa(String.fromCharCode(...sig)).replace(/[+/=]/g, (c) => ({ "+": "-", "/": "_", "=": "" })[c]);
}

export async function makeToken(secret, now) {
  const body = `${now}.${crypto.randomUUID()}`;
  return `${body}.${await sign(secret, body)}`;
}

/** The error for a submission, or null when it is acceptable. */
export async function checkScore(secret, { token, initials, ms }, now) {
  if (typeof initials !== "string" || !/^[A-Z]{3}$/.test(initials)) return "bad initials";
  if (!Number.isInteger(ms) || ms < 0 || ms > MAX_MS) return "bad score";
  const parts = typeof token === "string" ? token.split(".") : [];
  if (parts.length !== 3 || (await sign(secret, `${parts[0]}.${parts[1]}`)) !== parts[2]) return "bad token";
  const start = Number(parts[0]);
  if (!(start <= now) || now - start > MAX_MS) return "expired token";
  if (ms > now - start + SLACK_MS) return "score longer than the run";
  return null;
}

const top = (db) => db.prepare("SELECT initials, ms FROM scores ORDER BY ms DESC, created ASC LIMIT 10").all().then((r) => r.results);
const json = (data, status = 200) => Response.json(data, { status, headers: { "cache-control": "no-store" } });

export default {
  async fetch(req, env) {
    const { pathname } = new URL(req.url);
    if (pathname === "/api/scores" && req.method === "GET") return json(await top(env.DB));
    if (pathname === "/api/start" && req.method === "POST") return json({ token: await makeToken(env.SECRET, Date.now()) });
    if (pathname === "/api/score" && req.method === "POST") {
      const sub = await req.json().catch(() => ({}));
      const now = Date.now();
      const err = await checkScore(env.SECRET, sub, now);
      if (err) return json({ error: err }, 400);
      const ins = await env.DB.prepare("INSERT OR IGNORE INTO scores (initials, ms, token, created) VALUES (?, ?, ?, ?)")
        .bind(sub.initials, sub.ms, sub.token, now).run();
      if (!ins.meta.changes) return json({ error: "token already used" }, 409);
      const { rank } = await env.DB.prepare("SELECT COUNT(*) + 1 AS rank FROM scores WHERE ms > ?").bind(sub.ms).first();
      return json({ rank, top: await top(env.DB) });
    }
    if (pathname.startsWith("/api/")) return json({ error: "not found" }, 404);
    return env.ASSETS.fetch(req);
  },
};
