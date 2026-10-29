# Harmonix Brand Kit

Brand assets and motion building blocks for [Harmonix Finance](https://harmonix.fi): logos, token
marks, colours and type tokens, the design system snapshot, the animated mesh background, the 3D
metal coin, and the Remotion compositions behind Harmonix's X videos.

## What is here

| Folder | Contents |
|---|---|
| `brand.json` | Brand tokens in the [motion-studio](https://github.com/maxvu159/motion-studio) format (colours, type, mesh palette, rules) |
| `logos/harmonix/` | Harmonix mark, wordmark, vertical lockups — SVG + PNG, green / lime / white / black |
| `logos/tokens/` | HAR, haHYPE, hakHYPE token marks, plus engraved 3D maps for the coin |
| `logos/cards/`, `logos/mark/` | Texture maps (base / normal / ORM) for the 3D vault cards and the 3D logo |
| `logos/partners/` | Partner and protocol logos used in videos (third-party, see NOTICE) |
| `logos/tickers/` | Stock ticker logos used for HIP-3 videos (third-party, see NOTICE) |
| `media-kit/` | Official Harmonix media kit and `harmonix_brand_guidelines.pdf` |
| `design-system/` | Colours and type CSS, component previews, UI kits, backgrounds, illustrations |
| `remotion/` | Remotion 4 project: mesh background, 3D coin, 3D cards, stat cards, APR bars, buyback |
| `scripts/` | Generate engraving / card / mark texture maps, final encode for X |
| `docs/` | How each piece was built and tuned (mesh background, coin, scene grammar, teardown) |

## Fonts

Aeonik is licensed and **not included**. Put `Aeonik-*.otf` into `design-system/fonts/` before
rendering (see the README there).

## Render a video

```bash
cd remotion
npm ci
npx remotion studio                       # browse every composition
npx remotion render src/index.ts haUSDC out/haUSDC.mp4
npx remotion render src/index.ts CoinTest out/coin.mp4 --gl=angle   # Three.js needs ANGLE
```

Compositions: `haUSDC`, `PTHaHype`, `CardsLoop`, `Buyback`, `AprBars`, `CoinTest`, `CardTest`,
`AuroraTest` (mesh background alone), plus font checks. `src/Aurora.tsx` is the reusable mesh
background; `src/CoinTest.tsx` + `src/metalEnv.ts` the metal coin.

For X: render at `--scale=2`, then `scripts/finish.sh` downsamples with grain and chroma settings
that avoid banding on the teal background.

## Use with motion-studio

```bash
git clone https://github.com/maxvu159/motion-studio && cd motion-studio
git clone https://github.com/maxvu159/harmonix-brand-kit brands/harmonix
# add Aeonik to brands/harmonix/design-system/fonts/, then:
cd engines/remotion && npm run brand -- harmonix
```

## Texture maps for a new token

```bash
uv run --with numpy --with pillow --with scipy scripts/make_engrave_maps.py logo.svg out/eng-<token> --enamel '#173132'
```

See `docs/coin-3d.md` for material values and why they are what they are.

## Usage

See [NOTICE.md](NOTICE.md). The Harmonix name and marks belong to Harmonix; third-party logos belong
to their owners.
