---
name: User Profile
description: User is building a fridge ingredient recognition app with a multi-step UI flow (Step1 -> Step2 -> Profile). Korean-language UI. Using OpenRouter API key, vanilla HTML/JS frontend with no framework.
type: user
---

User is building a Korean-language "fridge ingredient recognition" web app with a 3-step flow:
1. index.html — photo upload + AI ingredient detection
2. step2.html — recipe generation with options (servings, time, category)
3. profile.html — user profile with saved recipes

Tech stack: vanilla HTML/CSS/JS frontend, server-side API routes (/api/analyze-image, /api/generate-recipes, /api/profile/*), OpenRouter API key in .env.

Data is passed between steps via URL query params (ingredients as JSON in URLSearchParams), and user identity is persisted via localStorage (profileId).
