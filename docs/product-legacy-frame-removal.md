# Legacy framed product-photo removal - 2026-10-21

The user requested removal of the old white inset photographs placed inside a
dark frame with red side lights, using photo 2 of the Porsche 911 spoiler as the
example. This is removal from storefront presentation, not deletion of sources.

## Audit

The anonymous public catalogue returned 40 products. All 165 currently selected
gallery views loaded successfully and were visually examined on seven contact
sheets. Ten matched the obsolete framed style:

- VW Golf 7 GTI grille
- Porsche 911 rear spoiler, black mirror caps and black diffuser
- Audi, Mercedes, Porsche and BMW door projectors
- Reverse camera HD
- CarPlay screen 12

The other 155 views are retained, including all 40 main photos, 30 reviewed seller
second views and 85 additional seller views. Genuine mounted-car shots are not
removed simply because they have a light background. No new image was generated.

The snapshot, downloaded inspection previews and contact sheets are outside the
frontend repository in `assets/legacy-gallery-audit-2026-10-21/`. The minimal
public slug/image snapshot is a regression fixture in
`src/lib/__fixtures__/productGalleryAudit.json`.

## Selection policy

`productLegacyFramedPhotos.json` records the ten exact excluded URLs, renamed
from the previous card-only exclusion registry. `productGallery` now removes
them wherever they occur, before detail thumbnails and card photos are selected.
It does not mutate API records, remove source files or ban future replacements.
The ten affected products keep their valid main photo without an empty second
thumbnail. Reviewed refreshes and additional views retain their existing order.

This supersedes the old card-only policy in `product-card-presentation.md`:
obsolete photos are now excluded from detail galleries too. Supplier validation,
prices, commercial status and fitment are unchanged.

## Verification boundary

Regression tests cover all 40 catalogue products, preserved source arrays, all
retained thumbnail selections, the ten exclusions at arbitrary positions and
later catalogue replacements. All 242 tests passed across eight regression
suites. The optimized production build and `git diff --check` also passed.
Visual app QA is unavailable: browser inventory returned no connected app or
browser. Contact-sheet review is direct image inspection, not a browser test.
Publication was authorized after these checks; commit/push and deployment results
are reported separately. No production database was changed.
