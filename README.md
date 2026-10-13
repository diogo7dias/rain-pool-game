# RAIN POOL — the game

A 1-bit pixel fish dodging raindrops. It opens on the
[rain-pool](https://github.com/diogo7dias/fframes-fun/tree/main/videos/rain-pool) loop (a figure
turning in the rain), zooms into the water, and becomes a top view of the pond: you are the fish.
Each drop warns two ways: its shadow fills from sparse to solid, and a ring shrinks onto the
shadow's edge; it lands, with a soft water plip, when the ring meets the
edge. One hit and you sink. Enemies join as you survive, each with a little cunning (rules, no AI):

- **Hunter**: aims where you're heading, flanks with others, shivers, lunges straight, rests.
- **Puffer**: drifts toward you and puffs into a spiky ball when you come close.
- **Eel**: a long, slow-turning serpent; its whole body is deadly.
- **Piranha school**: six tiny fish that flock and home in ahead of you.

Drops kill enemies too (a school loses one fish at a time), and two different enemies that touch
both die. Score is the time you stayed up; the best 10 go on a shared board with
3-letter initials.

- Steer: mouse (the fish follows), touch (drag anywhere, like a trackpad), or arrows / WASD.
- `M` or the speaker icon mutes.

## How it's built

- `public/index.html`: the whole game, one file, no build. A 135x180 1-bit canvas scaled up
  with crisp pixels, Bayer dither for every fade, Web Audio for the plips. The intro is a port
  of the fframes video (ray-marched figure, rain, ripples, stars).
- `src/worker.js`: a Cloudflare Worker that serves the page and the board API, on Workers KV
  (one key holds the top 10; used run tokens are keys that expire).
  `/api/start` signs a run token (HMAC with `SECRET`); `/api/score` takes initials and a score
  once per token and only if the score is no longer than the real time since the token.

## Work on it

```sh
npm install
echo "SECRET=$(openssl rand -hex 32)" > .dev.vars
npm run dev          # worker + local KV on http://localhost:8787
npm test             # score checks
npm run e2e          # smoke test against the dev server
npm run lint:ui      # lintapple
```

## Deploy (Cloudflare)

The KV namespace (`SCORES`) and the `SECRET` already exist on the account. To redeploy:

```sh
npm run deploy
```

From scratch: `npx wrangler kv namespace create SCORES` (put the id in `wrangler.jsonc`), then
`openssl rand -hex 32 | npx wrangler secret put SECRET`, then `npm run deploy`.
