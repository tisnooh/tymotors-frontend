# Product frames: remove external side gutters

Local correction following the user's two mobile screenshots.

- All `ProductCard` instances now use square image frames: shop, category, brand,
  wishlist, featured rail, related products and configurator recommendations.
- Product-detail main image and thumbnails use square frames and contain-fit.
- Cart thumbnails use equal width and height. Product files/URLs, prices, stock,
  gallery ordering, pending-photo guards and cart/wishlist actions are unchanged.
- Portrait/landscape foreground photos remain complete. A decorative, blurred
  copy of the same photo fills the remaining edges. It is aria-hidden, does not
  intercept input, appears only for non-square images after load and follows the
  main/hover fade. Square photos need no extra layer. This is CSS presentation,
  not a newly generated or modified product photograph.
- Edge fill is opt-in for `LoadedImage`; vehicle and other editorial components
  retain their existing behavior. Changing source or failing a load clears it.

## Checks completed locally

- 186 tests passed in 7 card/image/detail/gallery/home regression suites, plus
  all 3 cart tests: 189 in total, 8 suites.
- Optimized production build passed. Its process-only localhost API setting
  was for local QA only; the ignored build is not a deployed release.
- Anonymous catalogue GET and source-image metadata check: all 40 current main
  photos are square, matching the new frames without cover-fit cropping.
- Compiled CSS confirmed: aspect-ratio 1/1, background-size cover and the blur
  utility are present. Source aspect ratios are not stretched.
- `git diff --check` passed.

## Browser verification and publication

Visual desktop/mobile browser QA is pending: computer-use inventory returned no
connected browser or app in this session. No screenshots were fabricated and no
headless/browser-control workaround was used. The user authorized publication
after these local checks. Commit, push and deployment results are reported
separately; a successful deployment does not confirm visual browser QA.

Local metadata evidence: `assets/product-frame-fill-2026-10-21/main-photo-dimensions.json`
outside the frontend Git repository.
