# Harmonix Design System

A working design-system snapshot reconstructed from the Harmonix codebases, the
"New DS HMN" Figma file, and the Harmonix brand kit.

> **Harmonix Finance** — a DeFi yield-optimization platform that turns
> sophisticated hedge-fund strategies (delta-neutral, option-wheel, basis trade)
> into automated, click-to-deposit vaults. The next-gen product lives on
> Hyperliquid (HIP-3 vaults, $HYPE staking, Harmonix Protection / HAR Staking,
> HMN token).
>
> Tagline: **"Reshaping Yield Optimization. Minimize Risk, Maximize Yield."**

---

## Sources used

All sources are read-only inputs; nothing here is canonical until reviewed.

| Source | Where | Role |
|---|---|---|
| `ui-code/harmonix-app/` | Local mount (Next.js 14, NextUI, Tailwind, wagmi/viem) | Production **app** — `https://app.harmonix.fi`. Sidebar, vault detail, portfolio, dashboard, points, swap, staking. |
| `ui-code/harmonix-web/` | Local mount (Remix + NextUI + Tailwind) | Production **marketing site** — `https://harmonix.fi`. Hero, "Earn / Stake / Swap" walkthrough, partners, FAQ. |
| `New DS HMN (Copy).fig` | Mounted as `.fig` virtual filesystem | The **next** design system the team is moving to. 6 pages, 115 frames. Strongest signal: `Yield-market/Home-Light`, `HMN-Stake/Home-Light`, `HMN/HMN`, `TGE/*`, `Web/Pro-Blocks-Examples-Landing-Page-1` (revamped marketing). |
| `uploads/Aeonik-*.otf` (14 weights) | Project `uploads/` → copied to `fonts/` | **Primary typeface** — the only typeface the brand owns. |
| `uploads/[Harmonix] Visual style Guideline.fig` | Project `uploads/` | Brand visual guideline `.fig` (not unpacked here — keep alongside the design system as the canonical guide). |
| `uploads/Logo Branding HMN.zip` | Project `uploads/` | Original logo pack (zipped); SVGs already extracted into `assets/logos/`. |
| `uploads/Launch-Gif-1170pxx.gif` | Project `uploads/` → `assets/Launch-Gif.gif` | "Launch app" hero motion graphic. |

The codebases also live at the following remotes (URLs are for reference — they
require the user's GitHub access):
- App: `github.com/harmonixfi/harmonix-app` (formerly `rock-onyx`)
- Web: `github.com/harmonixfi/harmonix-remix-web`
- Smart contracts: `github.com/harmonixfi/core-smart-contract`

---

## Product surface

Harmonix ships **two** front-end products and is in flight on a third:

1. **Marketing site** (`harmonix-web`, Remix) — light, gradient, Outfit/Poppins.
   Hero with `Subtract` orbit illustration, animated "Earn → Stake → Swap"
   step-list, partner grid, audit logos, FAQ accordion. Brand-led, motion-rich.

2. **Web app** (`harmonix-app`, Next.js) — dark teal UI with cream+yellow
   accents. Sidebar nav with grouped sections (Home / Harmonix / Products /
   Stats / Rewards). Surfaces: Yield Markets (vault list & detail), Stake,
   Swap, Portfolio, Dashboard, Referral, Points Reward, HAR Staking, Protection
   Vault.

3. **New DS HMN** (Figma) — an in-progress redesign. Same dark-teal/yellow brand
   but a more refined, "pro-blocks" component set (light page bg + dark teal
   header cards, Geist/Inter mix, tighter table aesthetic, plus a new TGE flow
   for the HMN token launch). This system anticipates that redesign — components
   here lean into the **new** look (`#173132` primary, `#E2F6A1` secondary,
   16/24/32 radii, Aeonik display + Poppins UI).

---

## Brand foundations (one-line cheat sheet)

- **Primary:** `#173132` deep teal-green — core ink / button surface
- **Secondary:** `#E2F6A1` light yellow-lime — accent / CTA on dark, hover on light
- **Off-white:** `#F1F1EB` — page bg for marketing site
- **Ink:** `#171918` — dark-green text on light surfaces
- **Mint:** `#97FCE4` — gradient companion (hero blend)
- **Success:** `#0ECB81` — APY+, deposit confirmed
- **Display type:** Aeonik Medium/Bold (with Outfit/Geist as web fallbacks)
- **UI type:** Aeonik Regular/Medium (with Poppins/Inter as web fallbacks)
- **Default radius:** 16px (cards), 9999px (buttons & badges)
- **Voice:** professional fintech, precision-first, never playful, never emoji.

---

## Content fundamentals

The Harmonix voice is **calm institutional fintech meets DeFi-native
precision** — confident but never breathless. It's the voice of a risk desk
trying to make hedge-fund strategy approachable, not the voice of a memecoin.

### Tone

- **Professional, never playful.** "Building efficient hedge fund on-chain
  derivatives pools." Not "Stack sats, anon."
- **Promise-and-proof structure.** A short value claim, then proof that
  legitimises it: an APY, a strategy name, an audit logo, a TVL figure.
- **Risk and yield are equally weighted.** Marketing never says "yield" without
  pairing it with "risk control" or "delta neutral" or "audited."
- **Quiet authority.** No exclamation marks, no all-caps headlines, no "🚀."

### Voice & person

- **Second person, mostly.** "Earn 7% APY," "Deposit your assets," "Connect your
  wallet." The product is doing the work for the reader.
- **First-person plural** appears in About / FAQ ("we", "our protocol") —
  signalling the team behind the strategies, never the user.
- **Imperative for CTAs.** Single verbs win: `Launch App`, `Get in touch`,
  `Deposit`, `Stake`, `Withdraw`, `Claim`, `Explore all vaults`.

### Casing

- **Title Case** for section heads, feature names, and product nouns:
  *Yield Markets*, *Delta Neutral Vault*, *Protection Vault*, *Core
  Technology*, *HAR Staking*.
- **Sentence case** for body copy and FAQ answers.
- **UPPER** rare and reserved for status tags (`ACTIVE`, `LIVE`, `OPEN`, `TGE`)
  and the brand wordmark.

### Vocabulary

| Use | Avoid |
|---|---|
| "Yield", "APY", "TVL", "PnL" | "Gains", "profits", "moon" |
| "Delta-neutral", "Option Wheel", "basis trade" | Generic "trading", "investing" |
| "Strategy", "vault", "position" | "Pool", "farm", "ape" |
| "Protocol", "platform", "on-chain" | "App", "site", "web3" (in marketing) |
| "Risk control", "drawdown", "hedged" | "Safe", "guaranteed" |
| "Hyperliquid", "$HYPE", "$HMN" | Tickers without `$` in copy |
| "Curated", "automated", "institutional-grade" | "Easy", "simple", "fast" |

### Sample copy (verbatim)

> **Hero (web):** *Reshaping Yield Optimization. Minimize Risk, Maximize
> Yield.*
> **Sub-hero (FAQ):** *Harmonix Finance is a DeFi platform that transforms
> sophisticated hedge fund strategies into accessible and easy-to-use
> automated vaults.*
> **Core values (FAQ):** *Building what we understand deeply and love the
> most · Sustainability in everything · Humble and honest · Risk control is
> everything.*
> **Vault card (Figma):** *Hip-3 Vaults — Discover the innovative features of
> Hip-3 vaults.*
> **Sidebar (app):** *Total assets — \$12.4M*

### Punctuation, numbers, and emoji

- **Numbers.** APYs are shown with one decimal: `10.68%`. TVL uses compact form
  (`$12.4M`, `$1.2B`). Use a hard `$` for USD and explicit ticker for crypto
  (`$HYPE`, `$HMN`, `$USDC`).
- **Dates.** ISO short form in tables (`2025-12-01`); long form in prose
  ("December 1, 2025").
- **No emoji** in marketing or product UI. Iconography only.
- **Em-dash** is fine for value props ("Delta Neutral — earn yield in any
  market"). **Avoid** ALL CAPS, multiple exclamation points, and Twitter-isms.

### Microcopy patterns

- **Empty states** are reassuring, never apologetic: "No active positions yet —
  start by exploring vaults."
- **Disclaimers** are short, plain, regulatory: "Not available in the U.S."
- **Loading** is silent — wave animation, no spinner text.
- **Confirmation** uses past tense + plain object: "Deposit confirmed —
  $250 USDC into Delta Neutral Vault."

---

## Visual foundations

This is the playbook for *what Harmonix actually looks like* in 2026 — the
distilled vocabulary across the marketing site, the web app, and the new
Figma DS.

### Palette behaviour

- **Two surfaces, one brand.** The marketing site lives on `#F1F1EB` cream
  with green/lime gradient blends. The app lives on `#0F2122` deep teal with
  the same lime as a single, surgical accent. Both are the same palette —
  just inverted contrast.
- **Yellow is precious.** `#E2F6A1` (lime/light-yellow) is the **only** call-to-
  action colour. It hits buttons, key numbers (APY), the active sidebar item,
  the logo glyph, and absolutely nothing else. Never decorate with it.
- **Greens cluster.** The app's "g80 → g10" green scale (`#07161D` → `#DAF4EC`)
  is used as a surface ladder: deeper green = deeper container. Never use
  pure black; the floor is `#07161D`.
- **Status separates.** `#0ECB81` (success) is the only acceptable "positive"
  green and only appears next to numeric deltas (`+12.4%`). It never replaces
  brand green.

### Typography

- **Display = Aeonik.** Hero headlines, big numbers, and brand statements use
  Aeonik Medium (500) for warmth or Aeonik Bold (700) for impact. Air/Thin
  weights appear in the "Visual Style Guideline" .fig for big poster moments
  (eg. "M I N I M I Z E   R I S K") but not in UI.
- **UI = Aeonik Regular/Medium.** Body, labels, table headers, captions.
  Fallback stack is Poppins → Inter → system.
- **Mono = JetBrains Mono.** Transaction hashes, wallet addresses, contract
  IDs. Always tabular-nums on numbers in tables.
- **Tight letter-spacing on big type** (`-0.02em`); normal on body. Never
  letterspace upper-case status pills past `+0.04em`.

### Backgrounds

- **Marketing pages** use a soft *blend background* — two overlapping linear
  gradients (`241,240,235→88,191,110` and `241,240,235→226,246,161`) over an
  `url('bg.png')` photo, blended with `soft-light, hue`. This is the only
  "decorative" background; it's the brand mood.
- **App pages** are flat. Surfaces are `#0F2122` body, `#07161D` sidebar,
  `#0B1E24` info cards, `#032620` for top-of-page "section banner" cards.
- **Hero illustrations** use the **Subtract orbit** SVG — a slow,
  semi-transparent figure-eight stroke in `#E2F6A1` over the green blend.
  It's the brand's signature shape (taken straight from the wordmark glyph).
- **No noise textures, no glassmorphism, no abstract waves**. The aesthetic
  is "Stripe-meets-Bloomberg," not generic crypto.

### Cards & containers

- **Default radius `16px`** for cards and table containers.
- **Large containers** (hero blocks, page section wrappers) go `32px`.
- **Buttons & pills** are fully rounded (`9999px`) — this is the brand's most
  recognisable shape.
- **The "vault card" mechanic.** On hover, vault cards perform a cubic
  *translate-and-clip* — a 10px depth offset peels off the corner. See
  `globals.css .vault-card` — it's the only ornamental motion in the app.
- **Border:** `1px solid #E4E4E7` on light, `1px solid #303341` on dark. No
  borders on filled green cards.
- **Inner shadows** are not used. Outer shadows are restrained: `0 1px 2px
  rgba(0,0,0,0.05)` is the workhorse.

### Layout rules

- **Marketing** is centered up to ~1400px (`lg:w-[1024px] xl:w-[1260px]
  2xl:w-[1400px]`), with a 24px floating pill navbar.
- **App** is a fixed 256px dark sidebar + fluid main column. Page padding is
  `24px` consistent on app pages.
- **Section rhythm** (marketing) alternates: cream hero → white feature →
  cream blend (Earn) → white feature again → cream FAQ. Never two cream
  sections in a row.

### Motion

- **Easing.** `cubic-bezier(0.16, 1, 0.3, 1)` for entry; `ease-out` for hover.
- **Durations.** `150ms` for hover/press, `250ms` for layout state, `500ms+`
  for entry. Anything longer is reserved for the Subtract orbit (slow drift).
- **Patterns** in the codebase:
  - **Framer entry.** `initial={{opacity:0, y:200}} whileInView={{opacity:1,
    y:0}} transition={{duration:0.5, delay:0.2}} viewport={{once:true}}`.
    Sections rise on scroll with a small stagger.
  - **Wave loader.** 10 dots, each `animation-delay: 0.0–0.9s`, scale 0→1→0.
    No spinners, ever.
  - **Vault-card cube hover.** clip-path morph + translate, 500ms.
  - **Blinking cursor.** 1s step-end opacity blink — used for "live" status
    indicators and inline data tickers.
- **No bouncy spring overshoots** in product UI. Springs are reserved for
  micro-interactions (the wave loader, the "step number" pop on the marketing
  Earn section).

### States

- **Hover, light surfaces.** Background swap to `#F8FEDA` (yellow-soft) for
  link/menu items; opacity reduction is *not* used.
- **Hover, dark surfaces.** Background swap to `#10272B` (g60) for sidebar
  items; active items get `#0ECB81`-adjacent yellow `#E2F6A1` text.
- **Press.** Subtle 50ms `transform: scale(0.98)` on primary buttons.
- **Focus.** 2px `#E2F6A1` ring at 2px offset on dark; `#173132` ring at
  2px offset on light. Never blue.
- **Disabled.** `opacity: 0.5; cursor: not-allowed`. Never gray-out.

### Transparency & blur

- **Used sparingly.** Only the floating navbar has `backdrop-blur` in the
  marketing site; the app uses solid surfaces.
- **Soft-light blending** is the brand's signature transparency: any time the
  marketing site needs a gradient over a photo, it's `mix-blend-mode:
  soft-light` at 50% opacity.
- **Drop shadows for glow** are used on partner logos (`filter: drop-shadow(0
  0 96px <partner-colour>)`) — never CSS `box-shadow`. Glow ≠ shadow.

### Imagery

- **Photography is warm-cream toned**, soft-light blended into the green
  gradient, never raw. Photos are atmosphere, not subject.
- **Illustrations** are flat, schematic diagrams (delta-neutral flow,
  option-wheel cycle) — see `assets/illustrations/*`. They explain strategy,
  not decorate.
- **3D & animated GIFs** are reserved for the "Launch App" CTA and select
  partner intros — see `assets/Launch-Gif.gif`.

---

## Iconography

- **Two icon families** are in active use:
  1. **Heroicons** (`@heroicons/react`) — 24-outline + 16-solid. Used
     throughout the app for nav, action icons, and inline UI. Stroke
     weight ~1.5px, outline-first, occasionally solid for emphasis.
  2. **Custom brand SVG icons** — hand-drawn marks for partner logos,
     chain logos, the "core technology" section illustrations
     (`YieldOptimization`, `BearMarketYield`, `PreciseExecution`), and
     decorative shapes (`Subtract`, `FooterLine`, `BrandText`). All live in
     `harmonix-web/app/components/icons/` and `harmonix-app/src/components/
     shared/icons/`.
- **Logos & partners.** Every protocol Harmonix integrates with (Pendle,
  EigenLayer, Renzo, KelpDAO, Hyperliquid, etc.) has its own SVG component —
  never a PNG. Audit logos (Verichain, Shieldify, Zenith) likewise.
- **No emoji.** Anywhere. The product UI substitutes status pills, the
  marketing site substitutes hand-rolled SVGs.
- **No icon font.** The codebases ship SVGs as React components, not as a
  font.
- **Unicode glyphs** are limited to currency (`$`, `€`), math (`±`, `→`), and
  arrows in dropdowns / CTAs.
- **Substitutions in this DS.** For generic UI icons not present in either
  codebase (search, settings, chevrons, etc.), we link **Lucide Icons** from
  CDN — it matches the existing Heroicons outline aesthetic at the same
  stroke weight. *Flagged for review: this is a substitution; replace with
  the codebase's chosen set when productionising.*

### Where each lives

```
assets/logos/                  Harmonix brand marks (square / circle / wordmark, 4 colour variants)
assets/Icon-Container.svg      The 13.13-radius "icon tile" backplate from the brand kit
assets/bg/                     Photographic + abstract backgrounds (bg.png, blur-logo.png, etc.)
assets/illustrations/          Flat strategy diagrams (delta-neutral, option-wheel, etc.)
```

---

## Index — files in this project

| File / Folder | What it is |
|---|---|
| `README.md` | This file. Read first. |
| `SKILL.md` | Cross-compatible Agent Skill front-matter so this works as a `claude-code` skill. |
| `colors_and_type.css` | CSS custom properties (colours, type, spacing, radii, shadows) + semantic classes. **Import this first** in any HTML artifact. |
| `fonts/` | All 14 Aeonik weights as `.otf`. |
| `assets/logos/` | Harmonix logo set: square, circle, wordmark (text); green / yellow / white / black variants. |
| `assets/bg/` | Brand backgrounds — `bg.png` (gradient photo), `blur-logo.png` (hero glow), staking banners. |
| `assets/illustrations/` | Strategy diagrams (delta-neutral, option-wheel, etc.). |
| `assets/Icon-Container.svg` | Brand-kit icon tile (rounded square) — drop any glyph inside. |
| `assets/Launch-Gif.gif` | Animated "launch app" hero graphic. |
| `preview/` | One HTML card per design-system concept (palettes, type specimens, components). **These power the Design System tab**, do not delete. |
| `ui_kits/app/` | Hi-fi recreation of the **Harmonix web app** (dark, Yield Markets / Vault Detail / Portfolio / Swap). Open `index.html`. |
| `ui_kits/web/` | Hi-fi recreation of the **Harmonix marketing site** (light, hero / Earn-Stake-Swap / Core Tech / Partners / FAQ / Footer). Open `index.html`. |
| `ui_kits/_kit.css` | Tiny shared reset both kits import after `colors_and_type.css`. |

---

## Caveats & known substitutions

- **Aeonik substitutions on the web.** Aeonik is loaded from local `.otf`
  files for HTML artifacts in this DS. The two production codebases
  currently use Google Fonts (Poppins / Outfit / Inter / Geist) and have not
  yet adopted Aeonik. When emitting production CSS for either codebase,
  keep Poppins/Outfit/Inter; Aeonik is the *brand* type, not yet the *web*
  type.
- **Lucide icons** are CDN-linked as a generic-UI substitute for icons the
  codebases don't expose. Replace with the codebase's own export when going
  to production.
- **The `[Harmonix] Visual style Guideline.fig` was not unpacked** — it lives
  in `uploads/` as the canonical reference and should be opened in Figma.
- **Aeonik metrics differ from Poppins/Inter.** Layouts pulled from the
  codebases will reflow slightly when Aeonik is the live face; visually
  verify column alignment in tables and CTAs.
