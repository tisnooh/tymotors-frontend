# Golf 7 R: standalone diffuser presentation - 2026-10-21

The user requested the diffuser alone as the main product image. The manufacturer
page for VW-GO-7F-R-RS3G provides a standalone view (gallery image 7). That exact
view was used as the built-in imagegen edit target, rather than reconstructing a
part from a mounted-car photograph.

The edit changes the white backdrop to charcoal, removes the separate promotional
footer and frames the full piece in a square. The output was visually compared
with the standalone source: outline, orientation, two exhaust clearances and four
vertical fins are retained. It is an adapted manufacturer visual, not a technical
measurement, new fitment validation or guarantee of pixel identity.

Saved asset:
`public/images/products/product-only/vw-golf7-r-rear-diffuser-isolated-v1.webp`.
The full prompt, manufacturer page, supplier image URL, source/reference identity,
output dimensions and packaged hash are recorded in `product-golf-diffuser-only.json`.
Originals and the earlier blank-plate main photo remain archived unchanged.

The existing exact-source `productPhoto` mapping now selects this asset as image
1 in cards, detail galleries, search, cart and configurator. The five other gallery
views remain in order: four blank-plate views and one plate-free close-up. Later
catalogue edits still take precedence. No price, stock or database change.

297 tests passed across 11 suites, including all 40 catalogue galleries, selection
of the isolated main, all retained views, asset hashes and unchanged future URLs.
The optimized production build and `git diff --check` passed. The user authorized
publication after these checks; commit/push and deployment results are reported
separately. Visual asset review is not browser or physical-phone QA.
