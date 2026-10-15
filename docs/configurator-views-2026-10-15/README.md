# Three-view configurator coverage — 15 October 2026

The approved W177 implementation is extended to the other **13 selectable generation groups** returned by the public compatibility API on this date. Each group has its own exterior, interior and technology asset. The existing exterior AI masters are retained. The 26 new interior/technology images are generated illustrations, not customer photographs or evidence of installed products.

## Scope and limits

- 14 selectable groups total including W177; no backend compatibility records or product fitment rules were changed.
- A5, Boxster, Cayman and GR86 / GT86 have no selectable generation records in the current API. No cabin is invented for those names.
- F30 / F35 and F32 / F36 are grouped by the catalogue. The exterior examples remain F30 sedan and F32 coupe; the captions say so. They do not promise an exact F35 or F36 body.
- Each new caption identifies an illustrative year/phase/transmission where relevant. Known incompatible years, body styles or trims use the existing generation fallback, not a different car's cabin. The year windows in `vehicleViews.js` are intentionally conservative, not assertions that every option in the image was standard throughout that window.
- Factory-style screen graphics, small button legends, materials and options remain illustrative, not an OEM specification sheet or VIN decoder. Purchase compatibility continues to come from the real catalogue/API, never the image.
- No overlays, product rendering, hotspots positioned on an unreviewed frame, or claim of 3D simulation were added.

## Generation and visual checks

Built-in image generation, one call per asset. The approved W177 interior is used only as a lighting/composition reference; every prompt specifies its own dashboard architecture. The Supra correction is generated without that style reference to avoid a BMW-like dashboard.

All final images were inspected visually before export. Technology views are generated from their corresponding accepted interior, not a generic dashboard. The review checks generation-specific dashboard layout, screen housing/placement, steering-wheel emblem, gear/control arrangement, left-hand drive, readable dark materials, no people/watermark/collage, and 16:9 composition.

Corrections before acceptance:

1. 991 interior: rejected first screen shape (too tall); corrected to a smaller landscape PCM before generating its technology view.
2. Supra: rejected the first over-generic BMW-like cabin; regenerated with the low asymmetric console and padded driver knee brace.
3. GR Yaris: replaced the first three-knob manual climate panel with a two-knob automatic panel and small center readout.

`sources.json` records the accepted generated PNG filenames and existing exterior master for each group. PNG masters are copied to the workspace `assets/configurator-views-all-2026-10-15` and the originals are left untouched. `scripts/encode-configurator-views.cjs` performs only WebP encoding (quality 88), no crop/retouch; each web asset must be below 500 KB.

## Primary design references (research only, no photographs copied)

- [BMW F32 launch, 2013](https://www.press.bmwgroup.com/usa/article/detail/T0142773EN_US/the-all-new-bmw-4-series-coupe?language=en_US)
- [BMW F3x equipment updates, 2017](https://www.press.bmwgroup.com/united-kingdom/article/detail/T0270978EN_GB/may-news-in-brief)
- [BMW G20 launch](https://www.press.bmwgroup.com/new-zealand/article/detail/T0288468EN/the-all-new-bmw-3-series-sedan?language=en)
- [Mercedes-Benz C-Class environmental/product report, W205](https://group.mercedes-benz.com/documents/sustainability/product/mercedes-benz-environmental-check-mb-c-class.pdf)
- [Audi A3 2016 update](https://audi.media-corner.ch/press/technologie-update-fuer-den-kompakten-bestseller-der-neue-audi-a3)
- [Audi A4 B9 launch, 29 June 2015](https://audi.media-corner.ch/press/die-neuen-audi-a4-und-a4-avant)
- [Porsche 991.2 PCM, 2015](https://newsroom.porsche.com/en/christophorus/porsche-communication-management-pcm-technology-infotainment-911-carrera-12109.html)
- [Porsche 992 launch, 2018](https://newsroom.porsche.com/en/products/porsche-911-new-eigth-generation-992-timeless-machine-design-icon-world-premiere-los-angeles-2018-16522.html)
- [Porsche Cayenne third generation report, 2017](https://download.newsroom.porsche.com/pdf/6e0d2671-c475-4c66-8ce0-ec6c32668e1a?print=)
- [Volkswagen Mk7 GTI, 2013](https://www.volkswagen-newsroom.com/en/new-golf-gti-international-press-presentation-2976/new-golf-gti-features-exterior-interior-and-options-3008)
- [Volkswagen Mk7 R interior](https://www.volkswagen-newsroom.com/de/der-neue-golf-r-2432/das-interieur-des-golf-r-2464)
- [Toyota GR Supra launch, 2019](https://media.toyota.co.uk/the-legend-returns-world-premiere-of-the-new-toyota-gr-supra-at-the-2019-north-american-international-auto-show/)
- [Toyota GR Yaris launch, 2020](https://newsroom.toyota.eu/gr-yaris-born-from-the-world-rally-championship/)

Test and deployment evidence is recorded in `verification.md` after the checks complete.
