---
name: harmonix-design
description: Use this skill to generate well-branded interfaces and assets for Harmonix Finance — the DeFi yield-optimization platform building delta-neutral and stablecoin vaults on Hyperliquid. Contains essential design guidelines, colors, type, fonts, assets, and UI-kit components for prototyping the web app and marketing site.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available
files. The system has three layers you should know about up front:

1. **Foundations** — `colors_and_type.css` (CSS custom properties for the full
   palette, type scale, spacing, radii, shadows, and motion). Always import
   this first in any HTML artifact you produce.
2. **Brand assets** — `fonts/` (14 Aeonik weights), `assets/logos/` (square,
   circle, wordmark — green/yellow/white/black colorways),
   `assets/bg/` (the cream-blend gradient + photographic backgrounds),
   `assets/illustrations/` (flat strategy diagrams).
3. **UI kits** — `ui_kits/app/` (dark Next.js app: Yield Markets, Vault
   Detail, Portfolio, Swap) and `ui_kits/web/` (light Remix marketing site:
   Hero, Earn, Core Tech, Partners, FAQ, Footer). Read these for component
   patterns and copy tone.

When creating visual artifacts (slides, mocks, throwaway prototypes), copy
assets out of `assets/` and create static HTML files for the user to view.
Never re-draw logos or generate icons; always reference the existing files.
When working on production code, copy assets and read the rules in
`README.md` to become an expert in designing with this brand.

**House style cheat sheet** (full details in `README.md`):
- Primary `#173132` deep teal-green · secondary `#E2F6A1` light yellow ·
  cream `#F1F1EB` page bg · ink `#171918`
- Aeonik for everything; fall back to Poppins/Outfit/Inter on web
- Cards 16px radius, large containers 24/32, buttons & badges fully rounded
- Yellow is a CTA-only colour — never decorate with it
- Marketing = soft-light-blended cream-and-lime gradient; app = flat deep teal
- No emoji, no icon font, no glassmorphism, no neon gradients
- Tone is professional fintech: precise, never playful, never breathless

If the user invokes this skill without any other guidance, ask them what
they want to build or design (a marketing landing page, an app screen, a
slide deck, a pitch graphic, a partner-page block, etc), ask 1-2 clarifying
questions about audience and surface (web app vs marketing site vs both),
and act as an expert designer who outputs HTML artifacts *or* production
code, depending on the need.
