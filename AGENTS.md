# rain-pool-game

## Project memory (Notion)

- This repo's Notion project page: https://app.notion.com/p/404918442ce581e58010d8308034f002
- Before starting work, read it: what it is, status, key decisions and the latest Work log entries.
- After finishing, add a dated entry (YYYY-MM-DD, Europe/Lisbon) to its Work log, and update Status or Key decisions if they changed.
- Never put secrets, credentials or conversation transcripts in Notion.
- Notion is the shared memory across agents. See the Agent Operating Guide: https://app.notion.com/p/3fe918442ce58134b30fce2438660a20
- Hindsight is being retired. Do not write new memories there.

---

Rules for agents working here (CLAUDE.md is a symlink to this file).

- The look is the rain-pool video's: 1-bit white on black, 135x180 grid, dither instead of
  grey, no fonts beyond the 3x5 pixel font in `index.html`. Sounds are soft synthesised water
  plips and glassy taps, quiet, never music and never whooshes.
- Keep it one static `public/index.html` with no build step and no runtime dependencies.
- The score is survival time in ms; the Worker trusts nothing else. Any new scoring must keep a
  server-side bound like "no longer than the run".
- Before done: `npm test`, `npm run e2e` against `npm run dev`, `npm run lint:ui`.
- Deploying needs Diogo's OK.

## File size limit

- Keep every agent-authored file under 5,000 tokens (bytes / 4, about 20 KB). `.githooks/check-token-limit` blocks staged files over the limit (enable once per clone with `bin/install-git-hooks`); split oversized files by responsibility instead of using `--no-verify`, and list genuinely non-agent files in `.token-limit-ignore`.
