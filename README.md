# RAIN POOL — the game

A 1-bit pixel fish dodging raindrops. It opens on the
[rain-pool](https://github.com/diogo7dias/fframes-fun/tree/main/videos/rain-pool) loop (a figure
turning in the rain), zooms into the water, and becomes a top view of the pond: you are the fish.
Each drop shows a shrinking ring where it will land, then splashes with a soft water plip. One
hit and you sink. Score is the time you stayed up; the best 10 go on a shared board with
3-letter initials.

- Steer: mouse (the fish follows), touch (drag anywhere, like a trackpad), or arrows / WASD.
- `M` or the speaker icon mutes.

## How it's built

- `public/index.html`: the whole game, one file, no build. A 135x180 1-bit canvas scaled up
  with crisp pixels, Bayer dither for every fade, Web Audio for the plips. The intro is a port
  of the fframes video (ray-marched figure, rain, ripples, stars).
- `src/worker.js`: a Cloudflare Worker that serves the page and the board API, on D1.
  `/api/start` signs a run token (HMAC with `SECRET`); `/api/score` takes initials and a score
  once per token and only if the score is no longer than the real time since the token.
- `schema.sql`: the `scores` table.

## Work on it

```sh
npm install
echo "SECRET=$(openssl rand -hex 32)" > .dev.vars
npm run dev          # local D1 + worker on http://localhost:8787
npm test             # score checks
npm run e2e          # smoke test against the dev server
npm run lint:ui      # lintapple
```

## Deploy (Cloudflare)

```sh
npx wrangler d1 create rain-pool-scores        # put the id into wrangler.jsonc
npx wrangler d1 execute DB --remote --file schema.sql
openssl rand -hex 32 | npx wrangler secret put SECRET
npm run deploy
```
