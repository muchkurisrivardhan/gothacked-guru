# gothacked.guru

**Live site: [muchkurisrivardhan.github.io/gothacked-guru](https://muchkurisrivardhan.github.io/gothacked-guru/)**

An anonymous guide for people navigating Indian cyber scams — pick "what happened," drill through a node tree
(category → scam → step-by-step guide), and find exactly what evidence to gather and where to file a complaint.

## Running it locally

```
npm install
npm run dev
```

This starts two processes:
- **Vite** on http://localhost:5173 — the site itself
- **Local API** on http://localhost:3001 — anonymous, aggregate view counters only (no IP/cookie/personal data)

Visit `http://localhost:5173/?admin=1` to see aggregate "most viewed scam" stats (dev-only, no auth — do not
expose this route in production without adding auth).

## IMPORTANT — before this goes live

Every scam entry in [`src/data/scams.ts`](src/data/scams.ts) is marked `verified: false` and shows a
"NEEDS VERIFICATION" badge. The helpline numbers (1930, 181, 1098), portal URLs ([cybercrime.gov.in](https://cybercrime.gov.in),
[sachet.rbi.org.in](https://sachet.rbi.org.in), [scores.sebi.gov.in](https://scores.sebi.gov.in), [ncwapps.nic.in](https://ncwapps.nic.in)) and step-by-step procedures were compiled from public
knowledge, not independently confirmed. **Please verify each one against the official source before removing
the badge or publishing.** Wrong helpline info here could genuinely hurt someone relying on it.

## What's built (first pass)

- 5 categories, 8 fully-guided scams, 5 "coming soon" stubs sketching out the rest of the top-50 shape
- Radial node-tree navigation (click a node to drill in, click center to go back up)
- Fuzzy, natural-language search that jumps straight to a matching scam
- Full guide per scam: warning signs, immediate steps, evidence checklist, filing steps, complaint channels
- "Quick exit" button (redirects instantly, common on safety-sensitive sites)
- No accounts, no personal tracking — only anonymous aggregate view counts per scam

## Deploying

```
npm run build   # outputs static site to dist/
```

Deploy `dist/` to any static host — `netlify.toml` is included (Netlify picks it up automatically;
Vercel/Cloudflare Pages auto-detect Vite). The view-counter API is optional: on a static host the
counter silently no-ops. To keep it, run `node server/index.js` behind a reverse proxy that maps `/api/*`.
The `/?admin=1` stats page is dev-only and never ships in the production build.

## Next steps

1. Verify the content in `scams.ts` (helplines, URLs, procedures) and flip `verified: true` once confirmed.
2. Fill in the remaining scams toward 50 — follow the existing `ScamNode`/`ScamDetail` shape.
3. If keeping the view counter in production, move it off the flat JSON file.
