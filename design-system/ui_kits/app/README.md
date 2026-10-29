# Harmonix App — UI kit

A hi-fi, click-thru recreation of the dark **Harmonix web app** (the
`harmonix-app` Next.js codebase + the `Yield-market` page from the New DS
Figma file).

This kit is a **visual fidelity** project, not a working dapp — wallet calls,
chart data, and APYs are mocked.

## What's in here

| File | Role |
|---|---|
| `index.html` | Entry. Loads React + Babel, mounts the app shell, routes between screens. Open this. |
| `app.css` | Dark UI styles — sidebar, topbar, banner, vault table, deposit panel. |
| `components/Shell.jsx` | `Icon`, `Sidebar`, `TopBar` — chrome shared by every screen. |
| `components/ScreenYieldMarkets.jsx` | Vault list (Hip-3 banner + tabs + 7-row table). |
| `components/ScreenVaultDetail.jsx` | Vault detail (KPI strip, performance chart, strategy block, sticky deposit panel). |
| `components/ScreenPortfolio.jsx` | Portfolio screen + a Swap screen as a bonus surface. |

## Click-thru

- **Sidebar** — switches the active screen. Yield Markets, Portfolio, Swap
  render; the others show a "lives in the real app" placeholder so we don't
  fake content for surfaces we haven't recreated.
- **Vault row** — opens vault detail.
- **Back** from detail — returns to Yield Markets.
- **Deposit button** in the detail panel — fires a brand-yellow toast.
- **Topbar** — connect-wallet toggles to a 0x-truncated identity pill.

## Source mapping (for handoff)

| In this kit | Real codebase |
|---|---|
| `Sidebar` | `harmonix-app/src/components/shared/Sidebar.tsx` |
| `ScreenYieldMarkets` table | `Yield-market/Home-Light/index.jsx` (Figma) — "Hip-3 Vaults" banner + table |
| `ScreenVaultDetail` deposit panel | `harmonix-app/src/components/vault/actions/*` |
| Wallet connect button | `harmonix-app/src/components/shared/WalletConnectButton.tsx` |
| Toast | `harmonix-app/src/hooks/useNotification.tsx` (notistack) |
