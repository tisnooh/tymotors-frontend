# Rythme de l'accueil — 14 octobre 2026

Le rythme vertical est centralisé dans `src/pages/Home.css`, importé par
`Home.jsx` et limité à `.home-page`. Les pages catalogue, panier, légales et
admin ne sont pas modifiées.

| Largeur | Padding de chaque section | Entre deux contenus | Titre / premier contenu |
| --- | --- | --- | --- |
| Moins de 640 px | 32 px haut / bas | 64 px | 24 px |
| 640–1023 px | 48 px haut / bas | 96 px | 32 px |
| Dès 1024 px | 64 px haut / bas | 128 px | 40 px |

Les espacements utilisent les tokens `--home-section-space` et
`--home-heading-space`, en `rem`. Ne pas ajouter un `gap` vertical au parent :
les paddings des sections voisines forment déjà la distance entre les blocs.
Les en-têtes Marques / Catégories / Pièces en Vedette / Avant-après utilisent
la classe `home-section-heading`. La barre d'Univers répartit le même espace
de part et d'autre de son filet décoratif.

Le Hero plein écran est exclu de cette échelle. Sa mise en page mobile utilise
maintenant un départ sous le menu, une zone photo flexible et des repères jaunes
en bas dans le flux, avec une réserve pour le navigateur. Le storytelling conserve
le viewport `100svh`, ses cartes portrait, le spacer et la timeline GSAP.
Sur mobile, l'espace du titre est placé dans l'introduction avant le viewport ;
le padding bas reste après la scène. La règle spécifique inclut `section`
pour avoir la priorité correcte sur le rythme général.

L'ancienne réserve commune `contain-intrinsic-size: auto 900px` est supprimée.
Elle ne représentait pas les dimensions des différentes sections et créait
des espaces temporaires et des déplacements de leurs limites au défilement.
Les sections gardent leur géométrie réelle ; les images restent chargées
paresseusement, les reveals et le chargement différé GSAP restent inchangés.
Aucune nouvelle dépendance, requête métier, duplication de produit ou photo.

## Vérifier

- Tests : `npm test -- --watchAll=false --runInBand`, dont `HomeSpacing.test.js`.
- Fixture isolée : `node tests/browser-build.cjs --visual`, puis
  `node tests/browser-serve.cjs --visual` sur `127.0.0.1:3001`.
- Charger `?phone=1` **après** avoir réglé le viewport mobile, ou recharger
  après le changement de dimensions, pour initialiser la branche GSAP mobile.
- Vérifier téléphone 360/393/430 px, tablette 768 px et bureau 1440 px, puis
  `?phone=1&reduce=1` sans pin. Vérifier les six marques, trois catégories,
  huit produits, comparaison, Univers et CTA, sans déborder ni couper un titre.
- La fixture utilise des instantanés publics de marques/produits et aucune
  écriture en base ni session/paiement réels. Safari/iPhone physique reste
  une vérification distincte de cette émulation.

## Positionnement du Hero mobile — complément du 14 octobre

Le centrage vertical de tout le bloc mobile est remplacé par `flex-start`.
L'introduction commence 12–16 px après le menu standard. Le cadre photo prend
la hauteur restante, mais l'image garde sa hauteur bornée et son cadrage :
elle ne zoome pas et la voiture n'est pas recoupée pour remplir le cadre.
Les repères restent après ce cadre dans le flux, à 24 px minimum du bas utile,
avec une réserve augmentée par `safe-area-inset-bottom`. Les ornements de coin
desktop sont masqués sur téléphone pour ne pas croiser le titre remonté.

Pas de footer absolu ni de hauteur fixe. Sur un petit écran avec texte agrandi,
les mots peuvent passer à la ligne et le Hero peut grandir/défiler plutôt que
couper le texte. Pour la recette uniquement, `?phone=1&text=large` applique
une taille racine de 24 px au lieu de 16 ; aucun réglage utilisateur ni code
de production n'est modifié par ce paramètre.
