# Main product images: fresh recheck, 22 October 2026

Historical live baseline before the new local repairs. See
`source-fidelity-repair-2026-10-22.md` for the subsequent six-image repair and
the distinction between an accepted retouched cutout and supplier verification.

Status: **incomplete — 39 part/kit-only presentations, 1 mounted-car presentation**.
This is a visual composition check, not supplier-reference, dimension, material or
fitment verification. It does not certify the generated product geometry.

## Live evidence

- Fresh anonymous GET of the catalogue returned 40 products.
- Main-image selection used the current actual `productGallery` helper, not a
  manual list of expected filenames.
- The public storefront served `/static/js/main.ff71c8b4.js`.
- All 40 selected images were freshly downloaded from their public URLs, decoded,
  and visually reviewed on two labelled contact sheets. Suspicious dark/tightly
  framed photos 11, 23, 29 and 31 were enlarged for a second review.
- For each locally overridden main image, the live bytes matched the local asset
  SHA-256 and the published JavaScript contained the selected replacement path.
- No failed downloads or local/live override mismatches were found. Successful
  loading is NOT the same thing as meeting the standalone-piece requirement.

Evidence is outside the frontend repository:
`../assets/main-photo-recheck-2026-10-22/live-main-images.json`,
`decoded-main-images.json`, `main-01.jpg`, `main-02.jpg` and the 40 downloaded files.
The saved `audit.cjs` and `contact.py` reproduce the read-only inspection.
This is HTTP/asset inspection, not browser/device rendering QA.

## Failed requirement: Porsche 911 rear spoiler

`porsche-911-rear-spoiler` still selects
`/images/products/presentation-clean/porsche-911-rear-spoiler-clean-v1.webp`.
This shows the whole car and does NOT meet the user's request for the part alone.
The previous edit only removed plate-frame lettering. That edit must never be
described as completion of the standalone-photo request.

The source manifest identifies Design911 `992GT3RW`. A fresh public source check
confirmed an assembly for a 992 GT3-look conversion, with a lower lid and wing.
No verified photo of that exact complete assembly off the car was recovered.
The source describes 992 fitment, not the 991 also named in the TYMotors listing.
No compatibility data was changed by this image-composition audit.

Primary source:
https://www.design911.co.uk/p/rear-spoiler-for-992-gt3-look-bodykit-for-porsche/

## Rejected extraction experiment

The built-in imagegen tool was used for one precise-object-edit attempt from the
current exact main image, asking to retain the visible upper wing, protective
film, two supports and white lower spoiler, remove the car, preserve the camera
view and not invent hidden mounts or surfaces. Exact prompt and attempt metadata
are saved with the evidence outside the frontend repo.

The output removed the car but changed the white lower spoiler's silhouette and
its proportions relative to the upper wing. It was rejected, not integrated and
not added to any product gallery or presentation resolver. The original remains
unchanged. A visually plausible AI extraction is not proof of an exact part.

## Verification and remaining action

The existing product photo/gallery regression suites passed: **95 tests across
2 suites**. They retain the explicit unresolved-Porsche assertion; passing tests
do not approve this image visually.

Needed: a supplier photograph of the exact complete spoiler assembly off the
vehicle. Do not substitute a lip/ducktail or a different GT3 wing, invent a hidden
base, mark this task complete, or silently delete/hide the product.

No storefront asset, source resolver, catalogue record or commercial status was
changed. No push or deployment was performed for this recheck.
