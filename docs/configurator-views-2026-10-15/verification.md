# Verification — configurator view extension

## Story

Choose a real catalogue brand/model/generation, then switch Exterior / Interior / Technology: the image must belong to that generation, the equipment filter must follow the same category, and an explicitly unreviewed vehicle detail must fall back without borrowing a cabin. Existing W177 behavior and project selection must remain intact.

## Local evidence, 15 October 2026

| Boundary | Result | Evidence |
| --- | --- | --- |
| Public compatibility data → registry | Pass | Live GET checks for six brands at 21:09:39 UTC: 14 generation records, 14 mapped sets. A5, Boxster, Cayman, GR86 / GT86 have no generation record. |
| Registry → actual assets | Pass | 42 distinct WebP paths including existing W177; RIFF/WEBP headers and size limits checked in Jest. New export: 39 files, 5,716,072 bytes total, largest 206,822 bytes. |
| Selection → stage and catalogue filter | Pass | Parameterized React integration tests for all 13 new groups; category query includes exact brand/model/chassis and view. |
| Mismatched phase/body/trim → fallback | Pass | Per-group lower/upper years, invalid/fractional years, unreviewed trim/body/generation; W177 tests retained. No real generation record → no dedicated set. |
| Unit/integration regression suite | Pass | `CI=true npm test -- --watch=false --runInBand`: **26 suites, 254 tests passed**, 41.338 s. |
| Scoped lint | Pass | ESLint on `vehicleViews.js`, `VehicleStage.jsx`, `Customize.test.js`, `vehicleViews.test.js`; exit 0. |
| Production build | Pass | CRA build with the existing public backend origin: **Compiled successfully**. No environment credentials read or changed. |
| Browser → actual rendered images | Pass | All 13 new generation groups selected through real UI with live read-only catalogue API proxy. All **39** category images loaded (`complete=true`, natural width 1671/1672). |
| Mobile stage | Pass | GR Yaris interior at 393×852 viewport: page width 383, stage frame width 350, all three controls fit. No horizontal overflow. |

Image review is an illustration-quality check against primary design references, not OEM certification of every small label, option or VIN. Screen UI and trim details remain illustrative.

## Release evidence

Production is not inferred from local success. After pushing the reviewed patch to `main`, verify the exact commit/deployment association, READY status, production alias, asset responses and a browser switch on the public site. The resulting deployment metadata and screenshots are saved with the PNG masters in the workspace `assets/configurator-views-all-2026-10-15/verification.md`.

The local proxy forwards real catalogue GETs and read-only fitment calculations; cart, contact and other writes are blocked. No order, cart write, customer message, schema change or generated fitment data is part of this work.
