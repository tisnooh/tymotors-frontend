# Visuels éditoriaux de l'accueil — 13 octobre 2026

Photos recherchées sur internet et inspectées visuellement avant intégration.
Les photos produit, panier et configurateur ne proviennent pas de ce fichier.
Les visuels éditoriaux sont centralisés dans `src/lib/editorialImages.js`.

| Usage | Sujet | Photographe / source |
| --- | --- | --- |
| Performance / Extérieur | BMW préparée, face avant et roues | [FBO Media / Pexels](https://www.pexels.com/photo/blue-bmw-4-series-on-street-27118861/) |
| Intérieur | Cockpit Mazda, volant et garnitures | [Borta / Pexels](https://www.pexels.com/photo/stylish-interior-of-a-red-sports-car-31536572/) |
| Technologie | Écran multimédia et console | [Vahap Demir / Pexels](https://www.pexels.com/photo/lcd-screen-in-car-24201393/) |
| Univers, culture tuning | Deux berlines modifiées au coucher du soleil | [FBO Media / Pexels](https://www.pexels.com/photo/sunset-car-showdown-modified-sedans-on-display-32103160/) |
| Univers, détail | Jante personnalisée polie | [Bradley de Melo / Pexels](https://www.pexels.com/photo/close-up-of-shiny-custom-car-wheel-31768888/) |
| Univers, silhouette | BMW bleue rabaissée | [FBO Media / Pexels](https://www.pexels.com/photo/blue-tuned-bmw-car-27118859/) |

[Licence Pexels](https://www.pexels.com/license/) consultée : utilisation gratuite et commerciale des photos, attribution non obligatoire. Sources créditées dans ce guide et dans la section Univers. Respecter les restrictions de la licence et les droits des tiers : aucune affiliation/approbation des constructeurs ou photographes ne doit être suggérée, ni vente de la photo telle quelle. Ce sont des inspirations indépendantes, pas des réalisations TYMotors, pas une preuve de compatibilité, pas une invitation à une modification non homologuée.

La recherche Unsplash a également été faite ; certains téléchargements/pages ont renvoyé 403/429/502. Aucun paywall ni contrôle d'accès contourné. Pexels retenu après vérification des images effectivement accessibles.

Hero : image déjà sélectionnée conservée (`photo-1762314907955-b7c1e11a8782`). Pas de migration de données ni modification des sources produit.

## Accueil mobile et barre basse du navigateur — 14 octobre 2026

Le Hero conserve sa photo et ses animations d'entrée. Sur téléphone seulement,
sa présentation utilise la petite hauteur visible `100svh`, des espacements
resserrés et une photo proportionnée à la hauteur disponible. La bande jaune
reste en flux après la photo, avec des caractères de 10–11 px et au moins 24 px
de réserve basse (augmentée par `safe-area-inset-bottom`). Les marges/polices
desktop restent intactes. Aucun `height: 100svh` fixe ni texte tronqué : si le
zoom ou une hauteur extrême impose plus d'espace, le contenu peut grandir et
défiler normalement plutôt que disparaître.

Recette locale : 320×568, 360×640, 393×600/700/852 et 430×740 ; trois repères
entièrement visibles dès l'arrivée et aucune largeur excédentaire. Français,
anglais, CTA catalogue et mouvement réduit vérifiés ; bureau 1440×900 conservé.
Il s'agit d'une émulation de dimensions/tactile, pas d'un essai Safari physique.

Avant/après : les deux anciennes photos indépendantes sont remplacées par une paire frontale générée puis éditée avec `image_gen`, explicitement étiquetée **simulation IA**, pas réalisation client. Même BMW grise, décor/cadrage cohérents ; calandre noire, bouclier sport et lèvre carbone. Les six fichiers WebP locaux, les prompts complets et la provenance figurent dans [BEFORE_AFTER_ASSETS.md](BEFORE_AFTER_ASSETS.md). Aucun crédit Pexels/Unsplash ne s'applique à cette paire générée.

## Storytelling portrait plein écran — demande suivante du 13 octobre

Les six images desktop restent identiques. Sur téléphone uniquement (`picture source`, media max-width 767px), les étapes 02 et 06 utilisent de vrais fichiers portrait, sans bande paysage ni `object-fit: contain` :

| Étape mobile | Sujet / dimensions originales | Photographe / source |
| --- | --- | --- |
| 02 — Calandres Performance | BMW noire, calandre et capot carbone mouillé ; 3264 × 4928 | [Zhillan_f / Pexels](https://www.pexels.com/photo/close-up-shot-of-black-bmw-car-with-water-droplets-11836461/) |
| 06 — Aérodynamisme Sport | Audi R8 jaune, aileron installé et feu arrière ; 3456 × 5184 | [Mario Alvarado / Pexels](https://www.pexels.com/photo/backlight-of-a-sportscar-in-close-up-shot-12170112/) |

Recherche Pexels et Unsplash effectuée ; fichiers réellement inspectés en entier dans le navigateur, dimensions/licence vérifiées sur les pages sources. Alternatives écartées : Supra 31853144 (aile trop proche du bord supérieur), gros plan 29734285 (détail/prise d'air plus dominant que l'aileron), 6969030 et Unsplash Mn4WTsRms74 (paysage trop large pour montrer le sujet en plein écran portrait). Aucun téléchargement payant ou contournement d'accès. Les conditions Pexels rappelées ci-dessus s'appliquent ; les images ne représentent ni des produits vendus précis, ni des réalisations TYMotors.

Le titre de section se lit une fois en introduction, avant les scènes ; la photo occupe ensuite 100svh derrière la légende et l'indicateur. Le mode réduit reste sans pin/animation, avec des cartes pleine hauteur. La timeline/les règles de scroll GSAP, Hero et sources produit ne sont pas modifiés.

La CSP autorise uniquement le CDN `https://images.pexels.com` en plus des hôtes image existants. Aucune ouverture des scripts, des connexions API ou des autres directives.

## Recette visuelle locale

Depuis `frontend`, lancer `node tests/browser-build.cjs --visual`, puis `node tests/browser-serve.cjs --visual`. Serveur limité à `127.0.0.1:3001`, APIs remplacées par des fixtures publiques : aucun paiement, session client ou changement de base. Ne pas confondre ce test visuel avec une intégration de production.

Pour le chemin animé téléphone, ouvrir `http://localhost:3001/?phone=1` dans un viewport mobile puis recharger. Pour vérifier le repli accessible sans pin, utiliser `http://localhost:3001/?phone=1&reduce=1`. Cette fixture seule émule un user-agent téléphone, le drapeau tactile GSAP et la préférence de mouvement choisie ; elle n'est jamais importée dans le bundle de production. Sans le paramètre téléphone, les préférences réelles restent utilisées. Le loader de diagnostic rend visibles les erreurs d'animation dans cette fixture seulement. La validation finale sur Safari/iPhone physique reste nécessaire.
