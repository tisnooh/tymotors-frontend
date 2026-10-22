# Catalogue image audit - 2026-10-21

Historical snapshot. The subsequent source-by-source recheck and six local
repairs are documented in `source-fidelity-repair-2026-10-22.md`. The adjacent
JSON now follows the current local selection; this text preserves the earlier
155-view / 39-part-only baseline, not a current completion claim.

Scope: every currently selected public product-gallery image, not only the Golf.
The public API returned 40 products; the actual runtime gallery helpers selected
155 images. Every file loaded and decoded successfully. All eight contact sheets
and both main-only sheets were visually inspected; mounted and suspicious views
were also enlarged. The per-view selection and decisions are recorded in
`product-catalogue-image-audit.json`.

## Five additional cleanups

| Product / view | Change | Preserved |
| --- | --- | --- |
| DashCam main | Remove advertising smartphone prop | Actual camera, two lenses, LCD, buttons and physical printing |
| Reverse-camera kit main | Remove retail box; uniformly enlarge and center visible kit | Monitor, camera, brackets, physical MONGOOSE brand, protective film tab and controls |
| CarPlay 12 main | Remove red diagonal size-advertising ribbon | Existing device dimensions, UI, rear-view inset and included accessories |
| Audi A3 grille view 2 | Remove supplier lettering on background door and its lettered hood reflection | Car, physical Audi rings, grille, sensor and already blank plate mount |
| Porsche 911 spoiler main | Remove tiny supplier lettering on license-plate frame | Mounted car and exact visible spoiler assembly; standalone view still pending |

All edits used built-in imagegen, followed only by WebP format conversion. The
first reverse-camera output was superseded by a better-framed second edit. Exact
inputs, prompts, output files and source/output hashes are saved in
`product-presentation-cleanup-prompts.json`. New versioned assets are under
`public/images/products/presentation-clean/`; originals remain unchanged.
Every final WebP was compared visually with its exact input. Generative retouching
is not a guarantee of pixel identity, material specification or technical fitment.

The existing exact-source photo resolver applies these changes to galleries,
cards, search, cart and configurator equipment. Gallery order and all 155 retained
views remain intact; a later source URL edit wins. Product JSON-LD now follows the
same presented gallery, with absolute URLs, instead of exposing excluded legacy
or advertising images. Open Graph follows the presented main image.

## Still incomplete

- 39 of 40 main images show the part or complete kit alone. The Porsche 911
  spoiler remains photographed on the car. Its historical source is Design911
  reference **992GT3RW**. Public source checks did not yield a verified demounted
  view of that exact assembly. Direct source-page requests encountered a
  Cloudflare challenge, which was not bypassed. Other 911 spoilers found through
  search were not substituted. A source photo of the exact isolated piece is
  needed; hidden supports/mounts must not be invented.
  Source reference for the handoff:
  https://www.design911.co.uk/p/rear-spoiler-for-992-gt3-look-bodykit-for-porsche/
  The accepted replacement must depict the same assembly (wing, two supports and
  lower lid), not a generic 911 lip, ducktail or a different GT3 conversion. A
  complete seller photo of that part off the vehicle would unblock the edit.
- Browser acquisition was rejected by browser URL policy. No alternate browser
  or automation workaround was attempted. Browser/device layout QA is therefore
  not claimed.
- At the 2026-10-21 audit snapshot these additional changes were local only.
  The user authorized their publication on 2026-10-22. Commit, push and deployment
  evidence are reported separately; publication does not resolve the pending
  Porsche standalone view or establish browser/device validation.

## Existing technical limitations are not visual approvals

The historical CarPlay photo depicts an 11.3-inch representative device while the
catalogue title says 12 inches. Removing its red overlay does **not** validate or
change the device size. The exact supplier reference remains required, as already
recorded in `product-photo-completion.md`. Likewise, this audit does not validate
the Porsche's catalogue 991 fitment from a supplier source describing a 992 part.
No price, stock, size, compatibility or database data was changed.

Automated tests cover all 40 gallery selections and all thumbnails, exact-source
replacement, saved asset hashes, metadata consistency, retained view order and
non-mutation. They do not replace the visual or technical review above.

Final local verification: **305 tests passed across 11 suites**. The optimized
production build compiled successfully. SHA-256 checks confirmed that all five
new packaged assets in `build/` match the reviewed public files and prompt
registry; `git diff --check` passed. No publication or browser-render validation
is inferred from those checks.
