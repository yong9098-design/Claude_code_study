---
name: Fridge Ingredient Recognition App — Architecture
description: Key architectural facts and performance constraints of the fridge-ingredient recognition app (Study-04)
type: project
---

Three-file Node.js/vanilla-JS app: server.js (Express), public/index.html (Step 1: image upload + ingredient recognition), public/step2.html (Step 2: recipe generation).

**Why this matters:** All performance optimization work should be scoped to these three files. No bundler, no framework — plain DOM manipulation.

Key constraints observed:
- OpenRouter model: google/gemma-3-27b-it:free (free tier — rate limits and latency are unpredictable)
- Image size cap: 10 MB enforced client-side only; server accepts up to 20 MB (express.json limit)
- DB: flat JSON file (data/profiles.json) read/written synchronously on every profile/recipe request — no connection pooling, no async I/O
- API timeout: 20 s for image analysis, 30 s for recipe generation — single retry on recipe generation only
- Image pipeline: full base64 passed client→server→OpenRouter with no resizing or compression step
- Ingredients passed between pages via URL query string (URLSearchParams) — no size guard

**How to apply:** When recommending optimizations, note that the free-tier model makes latency SLAs hard to guarantee. Focus on client-side image compression, async file I/O, and server-side input validation gaps.
