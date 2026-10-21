# Photo completion - 2026-10-21

## Delivered locally

- 27 previously pending seller views have been edited with built-in imagegen,
  visually compared with their source photographs and packaged as WebP. This
  brings the additional gallery registry to 85 views across 25 products.
- The three white-background aperture errors were regenerated from the originals:
  BMW G20 mirror caps view 4, W205 AMG grille view 5 and Supra diffuser view 3.
  These use versioned v2 files; previous approved assets were not overwritten.
- One newly recovered actual seller photo 2 for the Audi A3 grille is integrated.
  The 29 previously approved second views and all main catalogue URLs are intact.
- All 40 cards are covered: 30 reviewed second views and 10 main-photo fallbacks.
  A later catalogue image edit always takes priority. No price, stock, commercial
  status, fitment, database, cart or wishlist change was made.

## Prompt and asset locations

Mode: built-in imagegen, precise-object-edit. The requested transformation is a
restrained charcoal background, retaining source part shape, quantity, material,
orientation and physical markings; mounted photos retain their real context.
Exact prompts, seller URLs, original archives and output hashes are recorded in
`product-gallery-additions-prompts.json` and `product-photo-completion-prompts.json`.
Assets: `public/images/products/seller-gallery-natural/` and
`public/images/products/seller-second-natural/audi-a3-8v-rs3-grille-natural-v2.webp`.

This is generative background adaptation, not a guarantee of pixel identity,
dimensions, reference identity, product specifications or vehicle compatibility.
The dashcam source markings remain Full HD 1080P; the historical 4K catalogue
title has not been validated or changed by this image-only work.

## Still requires exact supplier evidence (10 products)

No imagined reverse side or near-match product was substituted. The cards are
visually safe, but these ten do NOT have a newly confirmed second product photo:

| Product | Evidence still missing |
| --- | --- |
| BMW door projectors | SCP public product JSON rechecked: only one distinct image. |
| Audi door projectors | Mercado Livre access restricted; exact public gallery needed. |
| Mercedes door projectors | Walmart photo 2 is a fitment table for another selectable size, not a useful product angle. Do not transform it into a photo or treat the table as TYMotors fitment proof. |
| VW Golf 7 GTI grille | Ceneo still access-gated. DPA 88531537802 found elsewhere, but no confirmed distinct photo 2 of the same item. |
| Porsche 911 rear spoiler | Design911 source has no confirmed second distinct product photo; no invented view. |
| Porsche mirror caps black | Historical source is carbon; exact black supplier reference required. |
| Porsche 911 diffuser black | Historical source is carbon; other 992 diffusers found are different shapes/trims and not substitutions. |
| Porsche door projectors | Historical Google Storage/Medium reference is not an identified exact seller gallery. |
| CarPlay screen 12 | Historical source is an 11.3-inch device and dead listing; exact 12-inch reference required. |
| Reverse camera HD | Total Audio MCK713A source rechecked; only one distinct photograph of the full kit. |

Relevant sources rechecked:

- https://scpautomotive.co.uk/products/bmw-led-door-projector-pair-bmw-logo
- https://marsperformance.com.au/products/gloss-black-honeycomb-rs3-style-front-bumper-bar-grille-grill-bodykit-audi-a3-s3-8v-2017
- https://www.walmart.com/ip/17708612007
- https://www.ceneo.pl/139157382
- https://www.totalaudio.co.nz/products/mck713a

The user was asked for exact supplier links while the safe work continued. No
supplier was contacted and no CAPTCHA/login restriction was bypassed.

## Local verification

- 177 tests passed across 6 card, gallery, product-detail and home regression suites.
- Optimized production build completed successfully. Its process-only localhost
  API override was for the read-only QA relay; that ignored build is not deployed.
- Real anonymous public catalogue: 40 cards, 30 two-image cards, 10 one-image
  fallbacks, all 70 images loaded and contain-fit after traversing every card.
- All 27 new gallery thumbnails clicked in their 11 product pages: expected main
  image selected, fully loaded and contain-fit on every click.
- New Audi second view checked at 1366x900; W205 aperture view checked at 390x844
  with no horizontal overflow (document and viewport width both 380px excluding
  the scrollbar). This is responsive desktop-browser QA, not a physical phone.
- No cart, wishlist, payment or catalogue write performed by browser QA.

Evidence outside the frontend repo: `assets/product-photo-completion-2026-10-21/qa/`.
Push, Vercel READY state and live browser checks are reported separately.
