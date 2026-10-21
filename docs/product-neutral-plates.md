# Golf 7 R diffuser: neutral advertising plates - 2026-10-21

Follow-up: the user then requested the diffuser alone as the main presentation.
The main exact-source redirect now uses the standalone supplier-product edit in
`product-golf-diffuser-only.json`; the other four neutral-plate gallery edits stay
selected. The retouched mounted main photo below remains archived, not deleted.

The user identified supplier advertising on the Golf's license plate. Five of
the six gallery views show this plate. They were edited separately using built-in
imagegen (`precise-object-edit`), with a blank satin-black plate and no plate-frame
lettering. View 5 has no license plate and is unchanged.

## Visual review and files

All five outputs were visually compared with their source: the advertising plate
and plate-frame text are gone; the blue Golf, VW/R badges, diffuser, four exhaust
tips and photographed views are retained. The actual small physical diffuser
emblem is deliberately retained. This is a generative retouch, not a guarantee of
pixel identity outside the requested edit or verification of fitment/material.

New, versioned WebP assets are in `public/images/products/neutral-plates/`.
No original photograph was overwritten. Exact prompts, original paths, generated
output paths, dimensions, source URLs and packaged SHA-256 hashes are recorded in
`product-neutral-plates-prompts.json`. Only format conversion followed generation.

The shared `productPhoto` exact-URL resolver selects these edits in galleries,
cards, search, cart, configurator equipment and product Open Graph metadata.
Original API records remain untouched, future replacement URLs take precedence,
and the existing ten legacy-frame exclusions remain active. All six Golf views
stay available in their original order. No price, stock, fitment or database
change was made.

## Verification boundary

All 296 tests passed across 11 suites. They cover all 40 product galleries, exact
URL matching, unchanged source data, five asset hashes, the plate-free fifth view
and direct-image consumers. The optimized production build and `git diff --check`
passed. The user authorized publication together with the standalone main-photo
follow-up; commit/push and deployment results are reported separately.
This is visual source/output inspection, not browser or physical-phone QA.
