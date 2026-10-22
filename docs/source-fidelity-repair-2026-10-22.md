# Recontrole des sources et corrections visuelles — 22 octobre 2026

## Resultat local, pas une publication ni une validation technique

Les 40 images principales ont ete telechargees a nouveau depuis les URLs
publiques, puis comparees visuellement aux 40 images originales conservees. Les
huit planches comparatives et les empreintes sont dans
`../assets/main-photo-recheck-2026-10-22/`. Ce controle va au-dela de la seule
presence d'une piece dans un cadre : il recherche aussi les elements physiques
supprimes ou extrapoles. Il ne certifie pas des cotes, une matiere ou un connecteur.

Six nouvelles images sont selectionnees par les memes fonctions que les fiches,
cartes, recherche, panier et configurateur. Les originaux ne sont pas ecrases.
Les URLs catalogue futures gardent la priorite : les remplacements correspondent
uniquement aux anciennes URLs exactes. Aucun produit ni prix n'est modifie.

| Produit | Correction depuis la source originale |
| --- | --- |
| Audi A4 B9 RS4 | Badge RS4, anneaux, support de plaque et logements de capteurs conserves. |
| Mercedes W205 Panamericana | Badge physique AMG, lamelles, aperture centrale et pattes conserves. |
| GR Yaris | Badge GR conserve ; pas de redressement inventant une autre perspective. |
| Gonfleur | Etiquette physique jaune/noire conservee avec l'appareil, flexible et prise. Sa lecture n'est pas une specification technique certifiee. |
| Spoiler Golf 7 | Remplacement de l'extrapolation depuis une voiture par une adaptation de la vraie photo vendeur de la piece seule, deja archivee. |
| Spoiler Porsche 911 | Detourage retouche du groupe visible : aile noire avec film, deux supports visibles, element blanc. La photo montee reste en vue 2. |

Outil : imagegen integre, edition precise depuis chaque original. Prompts exacts,
fichiers de sortie, empreintes source/sortie et limites sont dans
`product-source-fidelity-2026-10-22.json`. Les fichiers WebP sous
`public/images/products/source-fidelity/` sont des conversions de format, sans
retouche supplementaire. Les six sorties ont ete examinees a pleine taille.

### Limite importante du spoiler Porsche

Le premier essai a ete rejete : il changeait la forme et les proportions de
l'element blanc. Le deuxieme conserve mieux la composition visible et sert de
presentation detouree. **Ce n'est pas une photographie fournisseur de l'ensemble
demonte**, ni une garantie de geometrie ou de contenu du colis. Aucune face cachee
ou fixation n'est validee. La reference historique Design911 992GT3RW concerne
une 992 ; elle ne justifie pas la 991 aussi nommee dans le catalogue.

Source : https://www.design911.co.uk/p/rear-spoiler-for-992-gt3-look-bodykit-for-porsche/

## Fournisseurs retrouves dans le code et la base

- La base de production contient GZTM Auto / Leju, boutique
  https://gztmauto.en.alibaba.com ; les fichiers de provenance contiennent huit
  correspondances de carrosserie BMW/Mercedes, mais aucun des six projecteurs ni
  le spoiler Porsche.
- Tianzhiyu et Soyintech figurent dans l'audit historique des fournisseurs.
  La presence d'un nom dans cet audit n'est pas un lien de produit achete.
- Les sept fiches `product_supplier_data` controlees en lecture seule ont encore
  nom, reference et URL fournisseur vides et `supplier_verified=false`.
- Recherche publique : la boutique GZTM n'a pas fourni de catalogue exploitable
  sans controle d'acces ; aucune restriction n'a ete contournee. Les quatre pages
  de spoilers du site Soyintech ont ete examinees, sans l'ensemble Porsche exact
  ni projecteur identifie. Les resultats d'autres vendeurs n'ont pas ete attribues
  arbitrairement aux fournisseurs de TYMotors.

## Projecteurs : correction d'une conclusion precedente

L'image SCP originale BMW a ete telechargee et inspectee a pleine taille. Elle
montre bien les modules ET une projection du rondel bleu/blanc : l'affirmation
precedente « modules seulement » etait incorrecte. Une seule image distincte ne
signifie pas absence de projection dans cette image. La page annonce deux tailles,
BMW-80 (68 mm) et BMW-86 (50 mm), sans selection d'achat TYMotors enregistree.

Source : https://scpautomotive.co.uk/products/bmw-led-door-projector-pair-bmw-logo

Les originaux archives Audi, VW, Porsche et Toyota montrent aussi des motifs de
projection ; cela renseigne leur provenance photographique, pas leur lien avec
un approvisionnement TYMotors verifie. L'ancien lien VW est indisponible et la
source Porsche n'identifie pas un vendeur exact. Le visuel Mercedes examine
reste generique. Aucune projection d'un autre vendeur ou generee n'a ete ajoutee
comme preuve d'un resultat physique. Aucun achat ou message fournisseur effectue.

## Verification

- 317 tests reussis sur 11 suites : selection commune, empreintes, fiche produit,
  cartes, panier, recherche, configurateur et accueil.
- La galerie conserve les 155 vues precedentes et ajoute la photo montee Porsche
  en contexte : 156 vues au total, sans restaurer les dix anciens cadres exclus.
- Le controle de composition compte desormais 40 vues principales de piece/kit
  seul, mais le statut global reste incomplet pour les preuves fournisseur.
- Build optimise reussi (`main.a9b181b7.js`). Les empreintes SHA-256 des six WebP
  dans `public/` et `build/` correspondent aux sorties relues (12 controles).
  `git diff --check` reussi. Aucun push, deploiement ni controle navigateur/mobile
  n'a ete effectue pour ces nouvelles corrections.

Les autres limites connues restent ouvertes : finition carbone/noir de certaines
references Porsche, ecran annonce 12 pouces avec source historique 11,3 pouces,
et titre DashCam 4K avec marquage source Full HD. Ces points ne sont pas corriges
en inventant une variante ou en effacant des marquages.
