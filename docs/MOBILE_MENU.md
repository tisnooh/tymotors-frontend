# Menu mobile TYMotors

Le menu plein écran possède un en-tête indépendant (logo et fermeture), puis une
zone interne défilante. Il ne faut pas replacer toutes les actions dans un simple
conteneur `fixed inset-0` sans hauteur disponible ni `overflow-y: auto` : cela
masquait les derniers liens dès que la page derrière était verrouillée.

## Composition et comportement

- Recherche, carte **Mon compte**, puis raccourcis **Favoris / Panier** avec les
  compteurs du contexte applicatif, sans requête supplémentaire.
- Six rubriques catalogue, route active indiquée en rouge, puis suivi de commande
  et contact. Les actions FR/EN et Acheter restent accessibles au bas du contenu.
- Panneau `100dvh` (repli `100vh`), enfant flexible `min-height: 0` / défilement
  natif tactile, inertie WebKit, overscroll contenu et zones sûres haut/bas/côtés.
  Sous 360 px, les raccourcis et liens d'aide passent sur une seule colonne pour
  garder les mots lisibles, y compris avec un texte agrandi.
- `data-lenis-prevent` laisse les gestes internes natifs ; aucune modification
  de SmoothScrollProvider, des timelines GSAP ou de la page d'accueil.
- Le dialogue Radix déjà installé gère le focus contenu, Escape, le verrouillage
  de la page et son masquage aux technologies d'assistance. Son titre/description
  sont traduits et le panneau annonce explicitement `aria-modal="true"`.
- Le panneau couvre les bannières non modales pendant l'ouverture ; elles
  redeviennent visibles à la fermeture, sans consentement enregistré ni modifié.
- Focus initial sur Fermer ; retour au hamburger à la fermeture. Une navigation,
  y compris le logo lorsque l'on est déjà à l'accueil, ferme le panneau. Recherche
  transfère le focus à son champ sans le ramener au hamburger entre les deux.
- Animation d'entrée discrète de 180 ms, désactivée en mouvement réduit.

Le menu ne modifie ni session ni droits d'accès : `/account` conserve sa
redirection existante vers la connexion pour un visiteur non connecté. Aucun
secret, image, paiement, backend ou nouvelle dépendance n'est ajouté.

## Vérification

`src/components/layout/MobileMenu.test.js` utilise le vrai dialogue Radix pour
vérifier ouverture, libellés, focus, verrouillage/déverrouillage, Escape, boucle
Tab/Shift+Tab, navigation, compteurs et transfert vers la recherche. Les assertions
CSS couvrent les garde-fous ; la géométrie et le défilement nécessitent le navigateur.

La fixture visuelle `tests/visual-entry.jsx` inclut Navbar, MobileMenu et
SearchOverlay avec `VisualAppProvider` (état local, aucune API métier). `?phone=1`
émule les branches téléphone, `&text=large` agrandit le texte dans cette fixture
seulement et `&reduce=1` couvre le mouvement réduit. Ne pas confondre cette recette
avec un essai Safari physique ni avec une authentification client réussie.

Commandes Windows depuis le dossier frontend :

```powershell
$env:CI = 'true'
npm.cmd test -- --watchAll=false --runInBand
npm.cmd run lint
npm.cmd run test:toolchain
npm.cmd run build
node tests/browser-build.cjs --visual
node tests/browser-serve.cjs --visual
```

Arrêter le serveur de fixture et réinitialiser le viewport après la recette.
Les résultats et le déploiement exact sont consignés dans le PROGRESS.md de la
racine du workspace, séparément des actions propriétaires encore à effectuer.
