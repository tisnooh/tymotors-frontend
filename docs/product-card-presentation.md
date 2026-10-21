# Product card presentation coverage

The current 40-product catalogue has two explicit presentation policies:

- 30 products reuse the reviewed photo 2 selected by `productGallery` (natural-dark
  product shots or the preserved real mounted photographic context).
- 10 products still have an unreviewed legacy photo 2. Their cards retain photo 1
  rather than crossfading to that unreviewed image. These exact legacy URLs are
  recorded in `src/data/productCardUnreviewedPhotos.json`.

This is an interim presentation fallback, not 10 new photo edits or a completed
supplier-photo validation. No image is deleted or replaced in the product gallery.
Product detail galleries, prices, stock, compatibility and status remain unchanged.

The fallback applies only while photo 2 still matches the recorded legacy URL.
A later catalogue edit to photo 2 takes precedence, restoring the normal hover
without a code change. Do not apply a blanket ban to future products or uploads.

`productCardPhotos` centralizes this card-only selection. Card photos use contain
fit without zoom, and a single-image card never fades its main image on hover.

The Audi A3 grille now uses actual Mars Performance gallery photo 2, showing the
grille mounted on the source car. Its overlay was removed with built-in imagegen;
the original daylight and vehicle context are retained. Source, prompt and hash:
`product-photo-completion-prompts.json`. This is a visual source comparison, not
validation of the catalogue's fitment or supplier relationship.

## Previous local verification, before the Audi completion

- 170 tests pass across the card, detail, gallery and home regression suites.
- Production build succeeds.
- Local built shop with the real anonymous public catalogue, through a read-only
  local GET relay: 40 cards, 29 with two photos and 11 with one, 69 images loaded,
  all contain-fit, no unreviewed legacy secondary image selected by a card.
- All 11 fallback cards were individually hovered: main image loaded and visible
  (opacity 1), with no second image or zoom. No cart/wishlist writes were performed.

These checks did not assert that new replacement photos existed for the 11 products
or that the full product catalogue's technical specifications have been verified.
Publication is a separate step from the local verification.

## Completion verification

177 tests pass after the Audi completion. The built shop was traversed again:
40 cards, 30 double-image and 10 single-image cards, all 70 images loaded with
contain-fit. The 27 additional completed views were also clicked individually in
11 product detail galleries. See `product-photo-completion.md` for scope/limits.
