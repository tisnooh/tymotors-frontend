# Avant/après frontal — 13 octobre 2026

## Provenance et usage

Paire créée avec l'outil intégré **image_gen**, mode génération puis édition de l'image d'origine. Ni scraping, ni photo d'un client, ni commande payante chez un fournisseur. Le propriétaire a autorisé des visuels IA très réalistes. La simulation est indiquée sur la page, dans les textes alternatifs et dans les traductions FR/EN ; ne pas la présenter comme une réalisation réelle de TYMotors, une garantie de résultat ou une preuve de compatibilité/homologation.

Sujet : même BMW F30 grise, vue exactement de face, même atelier, éclairage et cadrage. Modifications illustrées : calandre noire double barre, bas de bouclier sport et lèvre carbone. Pas de changement de couleur, de roues, de phares, de hauteur de caisse ou de véhicule. Aucune photo/fiche produit commerciale modifiée.

Sources générées : 1672 × 941 pixels chacune. Inspection visuelle de la paire effectuée avant intégration : capot, badge, phares, vitres, rétroviseurs, pneus et porte de garage restent alignés. Ce contrôle visuel n'est pas une certification pixel à pixel.

Fichiers publiés dans `public/images/transformations/` :

- `front-stock-v1-{480,960,1672}.webp` : 15 382 / 49 506 / 118 732 octets.
- `front-tuned-v1-{480,960,1672}.webp` : 15 770 / 50 048 / 115 402 octets.

Transcodage seulement, aucun recadrage/retouche logiciel : `node tests/prepare-comparison-assets.cjs <stock.png> <tuned.png>`, avec `sharp` disponible dans l'environnement d'outillage (`NODE_PATH` si nécessaire). Aucune clé API requise, aucun appel réseau. Les originaux restent conservés, les fichiers du site sont versionnés dans le dépôt frontend. La première taille est 480 × 270, la seconde 960 × 540, la dernière 1672 × 941, identiques des deux côtés.

Le composant utilise les mêmes `srcSet`, `sizes`, centrage et dimensions pour les deux photos. Ratio téléphone 4:3 pour mieux lire les détails de face, desktop 16:9. Capture du pointeur locale au composant, défilement vertical de page préservé, clavier gauche/droite/Home/End, états chargement/erreur/reprise. Aucun changement des timelines Hero/Storytelling.

## Prompt 1 — génération de l'origine

```text
Use case: photorealistic-natural. Asset type: before photograph for a matched front-view car tuning comparison slider on an automotive website. Generate ONE highly realistic photographic image, landscape 16:9. Scene: an ordinary clean European automotive workshop forecourt, grey concrete floor with subtle wear and seams, a neutral charcoal-grey closed roller garage door behind the vehicle, overcast soft daylight. Subject: a factory-stock metallic silver-grey BMW 3-Series F30 sedan. Composition: STRICT perfectly head-on frontal view, camera centered on the car centerline, tripod at headlight height with 70mm lens, no three-quarter angle, wheels straight. Entire front bumper and both mirrors fully visible; car centered and occupies about 64 percent of image width and 70 percent of image height; generous equal side margins and a small strip of pavement below bumper. Stock chrome-surrounded kidney grilles with factory vertical slats, conventional unmodified stock bumper, no front splitter, clean factory headlights switched off. Real photographic surfaces, believable silver paint reflections, panel gaps, windshield reflection, rubber, no excessive gloss, no CGI look. A plain blank dark front plate with no text. Constraints: single car only, no people, no text, no labels, no watermark, no montage, no before/after split. This is the base image: clean, symmetric geometry and stable background are essential so a later precise edit can change only grille and bumper details while everything else remains aligned.
```

## Prompt 2 — édition de l'origine, pas une seconde voiture indépendante

L'image générée au prompt 1 est l'unique cible d'édition référencée ; pas la capture de l'ancienne page ni une photo produit.

```text
Use case: precise-object-edit. Image 1 is the EDIT TARGET and the before anchor of a slider. Produce one photorealistic AFTER photograph, exactly the same landscape size and perfectly registered camera composition as Image 1. Keep the SAME silver-grey BMW F30, same exact hood, badge, headlights, windshield, roof, mirrors, wheels, tires, vehicle scale, location, floor, garage door, shadows, lighting, exposure and paint reflections. Do not move or resize the car or camera. Change ONLY the following front-end tuning details: replace the chrome kidney grille surround and stock grille blades with realistic gloss-black surrounds and closely spaced double-slat gloss-black grilles within the exact same existing grille outlines; replace only the lower stock bumper fascia below the headlights with a plausible fitted silver-grey M-Sport-inspired bumper with wider clean black side air intakes (remove round fog lamps), keeping the same body width, headlights and plate coordinates; add a tasteful visible carbon-fiber front splitter along the lower edge with realistic mounting and fine carbon weave. Retain the plain blank dark plate at the same location. No lowering, no wheel changes, no new headlight shapes, no paint-color change, no new scenery. Entire front face and both mirrors still visible, straight-on and symmetric, workshop daylight photographic realism. Keep the entire upper half of the car and every background feature unchanged: this output must overlay the source in a drag comparison without a jump in hood, roof, glass, mirrors or garage. Avoid CGI, fake text, logos added, watermark, a diptych, a split montage or extra cars.
```

## Catalogue horizontal voisin

`FeaturedProducts` privilégie les huit références `featured=true` de l'API. Si cette sélection est vide, il lit la première page du catalogue, avec les photos/prix/statuts du serveur et une description non éditoriale. Il ne modifie aucune donnée en base. Glissement natif et snap mobile, flèches, clavier et barre horizontale ; aucun autoplay. Chargement réservé, erreur avec reprise, véritable liste vide explicite.

La fixture `tests/visual-api.js` utilise huit instantanés de champs publics pour la recette de mise en page uniquement. Ses paramètres `?products=error`, `?products=empty`, `?products=featured` exercent les états locaux sans requête réelle, données client, paiement ou mutation. La recette publique après publication doit vérifier séparément les références réellement retournées par l'API.

### Autoplay demandé le 14 octobre

Le propriétaire a ensuite demandé explicitement le défilement automatique : cela remplace la conception initiale sans autoplay ci-dessus. Une carte avance toutes les 4,5 secondes ; le rail revient au début après la dernière carte, sans dupliquer les fiches interactives. Bouton pause/reprise, pauses pendant survol souris, focus clavier, toucher/glissement, rail hors écran et onglet masqué. La préférence `prefers-reduced-motion: reduce` désactive l'autoplay et conserve les commandes manuelles ; un changement de préférence n'entraîne pas de reprise automatique. Les flèches/clavier restent disponibles et repoussent la prochaine avance. Nettoyage du timer et des observateurs à la fermeture, aucune nouvelle dépendance, aucun changement de photos, backend, données ou GSAP.
