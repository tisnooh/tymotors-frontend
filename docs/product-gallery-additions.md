# Additional seller gallery views — completion, 2026-10-21

85 additional views across 25 products (58 previously packaged, 27 completed now).
No numerical gallery cap. Product photo 1 and the 29 previously approved photo 2
edits are unchanged; Audi A3 now has a newly confirmed second view. Prices, stock,
compatibility, draft status and database records are not modified.

## Preparation and review

The source angles come from the linked seller galleries, not newly imagined
reverse sides. The built-in imagegen tool edited the background in the previously
approved W205-v2 charcoal direction. Finished outputs were visually compared
against the seller views; this is not pixel identity, a technical fitment check,
or proof of product material. Actual physical markings are retained.

The exact source URLs, prompts, output hashes and review records are stored in
`product-gallery-additions-prompts.json`; the runtime selection is
`src/data/productGalleryAdditions.json`. Edited assets are under
`public/images/products/seller-gallery-natural/`. Unretouched source views are
archived separately under `public/images/products/seller-gallery-originals/`.
Only format conversion to WebP was performed during packaging.

All additional views use contain-fit in the main image and thumbnails to avoid
cropping off product details. Main and unrelated custom images keep their prior
fit. A later catalogue edit of image 2 still takes precedence over this legacy
gallery refresh. Existing custom views are retained; already selected source
views are reused without duplication.

## Included

| Product | Added views |
| --- | ---: |
| BMW F30/F32 mirror caps | 4 |
| BMW F30 M Performance spoiler | 4 |
| BMW F30 M Sport rear diffuser | 3 |
| BMW G20 gloss black grille | 2 |
| BMW G20 M Performance spoiler | 2 |
| BMW G20 mirror caps | 4 |
| Mercedes W205 AMG grille | 2 |
| Mercedes W205 mirror caps | 2 |
| Mercedes W205 rear spoiler | 7 |
| Audi A3 8V rear spoiler | 2 |
| Audi A4 B9 RS4 grille | 4 |
| Audi gloss black mirror caps | 10 |
| VW Golf 7 GTI/R spoiler | 4 |
| VW Golf 7 mirror caps | 3 |
| Toyota GR86 mirror caps | 6 |
| Toyota GR Supra rear spoiler | 4 |
| Toyota Supra diffuser | 2 |
| Toyota GR Yaris grille | 1 |
| Porsche Cayenne grille | 1 |
| Mercedes W205 Panamericana grille | 3 |
| Tire inflator | 1 |
| Toyota door projectors | 3 |
| Mercedes W177 side vents | 1 |
| VW Golf 7 R rear diffuser | 4 |
| Dashcam | 6 |

## Completion and exclusions

All 85 selected candidate views are now packaged. The 27 completion views use
versioned v2 files; all were viewed against their source, including the three
regenerated aperture corrections. The original 58 files were not overwritten.

The carbon mounted F30 diffuser view and other nonmatching material/variant
photos were excluded. Carbon views for the F30/G20 spoilers are included only
because the user explicitly accepted those seller photos previously.
Unconfirmed supplier references and products with no additional verified useful
view are unchanged. Ten products still require exact supplier evidence for a
new second photo: see `product-photo-completion.md`. This release does not claim
their supplier validation is finished.

## Verification boundary

The gallery helper, asset hashes, ordering, nonmutation, exclusions and product
detail interactions are covered by local tests. A successful push is not by itself
confirmation that a Vercel deployment has completed or that the mobile production
page has been checked.
