---
name: project_recipe_app
description: Fridge ingredient recognition → recipe recommendation app — design conventions, current state, and UX patterns agreed upon
type: project
---

App: 냉장고 재료 인식 → 레시피 추천 (Korean)
Stack: Node.js + Express backend, Vanilla JS/HTML/CSS frontend, OpenRouter API
Storage: JSON file (data/profiles.json) for MVP, localStorage for profileId

**Design system (do not contradict):**
- Primary color: #4f46e5 (indigo)
- Success/next action color: #059669 (green)
- Danger color: #dc2626 / btn-danger is now outlined (border: 1.5px solid #fca5a5, bg: none)
- Background: #f0f4f8
- Card style: white, border-radius 16px, box-shadow 0 4px 24px rgba(0,0,0,0.08)
- Font: Segoe UI
- Tag/pill style: #eef2ff background, #4338ca text, #c7d2fe border, border-radius 999px
- Stepper: 3-step ol with .stepper-circle/.stepper-label, completed=green, current=indigo with ring, connector line turns green when prior step completed

**Implementation state (as of 2026-03-26):**
- index.html (Step 1): Fully implemented — drag-and-drop zone, image preview, AI analysis, ingredient tag editing, toast/error feedback, sr-only live regions, mobile camera button
- step2.html (Step 2): Fully implemented — ingredient tag display from URL params, recipe condition form (servings stepper, time chip-radio, category select), skeleton loading cards, recipe card grid with save bookmark button, recipe detail modal, regenerate button
- profile.html (Step 3): Fully implemented — dual-screen (setup + main), avatar grid, nickname input, saved recipe grid, recipe detail modal, delete confirmation dialog, nickname inline edit, toast system

**Remaining UX issues (identified 2026-03-26 review):**
- index.html: drop zone aria-label not restored after dragleave to full original text (truncated version stored)
- index.html: analyzeBtn re-enables after error but aria-disabled attribute is removed redundantly (already handled by disabled attribute removal)
- step2.html: ingredient list passed via URL query string — no size validation; very large ingredient lists could exceed browser URL limits
- step2.html: stepper-connector CSS rule (.stepper-item.completed + .stepper-connector) does not work because connector is an <li> sibling, not a CSS adjacent sibling of .stepper-item — connector stays gray even when step 1 is completed (structural bug)
- step2.html: modal-close-btn inline style overrides design system (style="background:#e5e7eb;color:#374151") — should use a named class
- step2.html: "다른 레시피 추천받기" regen button does not announce count change via sr-announce on regeneration; the existing sr-announce only fires inside generateRecipes which does update it — actually fine on re-check
- step2.html: empty-note inside recipe-cards is a plain <p>, not inside a listitem — role mismatch with parent role="list"
- profile.html: confirm-overlay missing aria-describedby pointing to confirm-desc
- profile.html: setup-screen uses role="main" on a div inside a div, but main-screen's <main> is correct — dual-screen means two landmark regions compete
- profile.html: saveEdit() silently ignores network/server errors (no catch block, no error toast to user)
- profile.html: avatar selection uses aria-pressed on individual buttons inside a role="group" — acceptable pattern but ideally should be radiogroup with radio inputs (same pattern as chip-radio in step2)
- profile.html: nav-links "재료 인식" / "레시피 생성" links in profile.html point to / and /step2.html respectively — step2 link will arrive with no ingredients in URL, showing empty state without guidance
- All pages: stepper is a <nav> wrapping an <ol>, but the <li class="stepper-connector"> is a non-item list child (not .stepper-item) — mixes semantic roles inside the list

**Why:** Full re-review of all three files on 2026-03-26 against current code.
**How to apply:** Use these as the authoritative issue list. Do not re-report issues that are already solved (accessibility of drop zone, modal close aria-label, tag-del aria-label, confirmation dialog replacing window.confirm, btn-danger de-emphasis, focus-visible states).
