# Harmonix Web — Marketing site UI kit

A hi-fi recreation of `harmonix.fi` — the public-facing marketing site. Based
on `harmonix-web` (Remix codebase) with structure pulled from the New DS
Figma file's `Web` page.

This kit is a single-page scroll: hero → Earn/Stake/Swap → Core Technology →
Partners → FAQ → Footer.

## Sections

| Component | Source mapping |
|---|---|
| `Navbar` | `harmonix-web/app/components/common/navbar/Navbar.tsx` — floating pill nav, NextUI Navbar inside |
| `Hero` | `_index.tsx` + `MainBanner.tsx` + `SubtractIcon` — soft-light blend bg, Subtract orbit, MetaBadge |
| `EarnSection` | `Earn.tsx` — hover-to-activate step list, side card with selected strategy preview |
| `CoreTechnology` | `CoreTechnologySection.tsx` — 3 cards on the cream-blend background, middle card offset up |
| `PartnerSection` | `PartnerSection.tsx` — 5×2 grid of audited / integration partners |
| `FAQSection` | `FAQSection.tsx` — NextUI Accordion, FAQ pulled verbatim |
| `Footer` | `Footer.tsx` — BrandText giant wordmark + footer link columns |

## Things you can click / try

- **Hover the step numbers** in the Earn section — the card on the right
  swaps strategies live (Earn → Stake → Swap).
- **Click any FAQ row** — accordion open/close.
- **Hover a partner tile** — yellow lift.
- **All "Launch App" CTAs** are stubs (`href="#"`).

## Known visual deltas vs the real site

- Real site embeds a Twitter timeline + a TVL fetch — replaced with static
  numbers here.
- The 3 hero motion videos in About Us are not included (this kit covers the
  landing page only).
- Aeonik is the live face here; the real site uses Outfit/Poppins/Lato. Type
  metrics differ slightly.
