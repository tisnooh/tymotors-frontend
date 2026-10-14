# Recherche TYMotors

Le panneau utilise les données et le moteur existants de `/api/products` :
recherche littérale, insensible à la casse, dans nom/sous-titre/SKU. Il n'ajoute
ni classement de popularité, ni recommandations fictives, ni recherche floue ou
garantie de compatibilité. Le backend et les photos produit sont inchangés.

## Interface

- Dialogue Radix installé, titre/description FR/EN, focus initial dans un champ
  lisible (au moins 16 px), Escape et retour au bouton de recherche de la navbar.
- En-tête/fermeture et champ restent hors de la zone de résultats défilante.
  `100dvh`, zones sûres, `min-height: 0`, inertie WebKit et `data-lenis-prevent`.
- `visualViewport` ajuste hauteur/décalage lorsque le clavier couvre le viewport
  de mise en page (largeur/décalage horizontal conservés pour le zoom) ; fallback
  CSS quand l'API n'existe pas. Nettoyage des listeners
  à la fermeture. Ceci doit aussi être vérifié sur Safari physique.
  Référence de ce comportement : [MDN VisualViewport](https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport).
- Exemples traduits, avec requêtes du vocabulaire réel du catalogue français
  (par exemple Steering wheel → volant), puis liens Performance/Intérieur/
  Technologie. Aucune requête tant que le terme normalisé a moins de 2 caractères.
- Aperçu de 8 produits maximum, prix et total serveur, nom non tronqué, photo
  existante avec le helper d'images actuel ; repli visuel en cas d'image absente
  ou inaccessible. Mention test conservée si l'API retourne `test_purchase`.
- Chargement, zéro résultat, erreur réseau/protocole et retry sont distincts.
  Aucune stack trace ni donnée brute d'erreur dans la page.
- Entrée, bouton flèche et « Voir tous les résultats » ouvrent `/shop?q=...`.

## Requêtes et catalogue

Debounce 220 ms, borne 120 caractères (limite API existante), URL encodée par
URLSearchParams. Cleanup de l'effet : un GET déjà parti ne peut plus remplacer
une recherche plus récente, un champ effacé ou un panneau fermé. Aucun historique
de recherche ajouté à localStorage et aucun logging frontend volontaire du terme
ou de l'erreur. Les URLs de recherche ont naturellement l'historique normal du
navigateur ; aucun tracker facultatif n'est ajouté.
Une nouvelle requête remet uniquement le scroller des résultats en haut.

Shop lit `q`, l'envoie avec les filtres explicites et l'affiche/peut l'effacer.
Une recherche globale n'hérite pas silencieusement du véhicule mémorisé : cette
hydratation reste utilisée pour le catalogue ordinaire sans recherche. Les
paramètres de véhicule déjà présents dans l'URL restent appliqués. Pagination
serveur de 100 articles par page, liens suivant/précédent conservant le terme ;
changer un filtre ou le tri remet la page à 1. Erreur et retry propres, suppression
des réponses tardives, réponse malformed refusée avant le rendu.

## Vérification

Tests `SearchOverlay.test.js`, `ShopSearch.test.js` et intégration Menu→Recherche
dans `MobileMenu.test.js`. Le vrai dialogue est testé (focus, verrouillage,
Escape/Tab), avec API mockée pour retard, erreurs et retry. La fixture visuelle
possède le vrai Shop et filtre ses snapshots publics localement ; `search=error`
simule une panne du panneau, jamais une écriture ou une connexion réelle.

Recette navigateur : 320/360/393/430 px, paysage, hauteur réduite simulant le
clavier, FR/EN, résultat/défilement/clear/Escape, navigation fiche et catalogue.
Les résultats déployés sont à contrôler séparément contre l'API réelle ; les
tests de fixture ne prouvent pas un paiement, une connexion ou un Safari physique.

Commandes depuis frontend sous PowerShell :

```powershell
$env:CI = 'true'
npm.cmd test -- --watchAll=false --runInBand
npm.cmd run lint
npm.cmd run test:toolchain
npm.cmd run build
node tests/browser-build.cjs --visual
node tests/browser-serve.cjs --visual
```

Pas de nouvelle dépendance, variable d'environnement, domaine ou secret.
Les résultats/build/SHA exacts de publication sont suivis dans PROGRESS.md.
