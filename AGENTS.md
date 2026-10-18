# rain-pool-game

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
