# Secondes photographies vendeurs — rendu naturel v2

## Complement du 21 octobre 2026

30 secondes vues sont maintenant integrees : les 29 validees precedemment et la
photo numero 2 de la fiche Mars Performance retrouvee pour la calandre Audi A3.
Cette vue reelle montee conserve le vehicule, la lumiere naturelle et le sol ;
seul le logo publicitaire separe a ete retire et le fond lointain attenue.
Source, prompt exact, hash et traitement : `product-photo-completion-prompts.json`.
Les 10 articles encore sans photo fiable gardent leur photo principale dans les
cartes ; leur galerie detaillee n'est pas supprimee. Voir `product-photo-completion.md`.

## Etat

Le client a rejete la premiere serie studio (rendu artificiel et logos superposes), puis valide l'exemple W205 v2. Les 29 secondes vues disposent maintenant d'une adaptation basee sur cet exemple : fond anthracite discret, photographie vendeur comme seule reference produit, pas de nouvel eclairage spectaculaire ni de logo superpose. Le W205 utilise bien le fichier valide, sans nouvelle generation. Retouches avec l'outil imagegen integre ; les originaux vendeurs ne sont pas ecrases. Les deux spoilers BMW F30/G20 conservent leur finition carbone explicitement acceptee.

Les 29 resultats ont ete compares visuellement aux sources : silhouette generale, nombre de pieces, orientation, cadrage, details visibles et absence de logos publicitaires superposes. Le gros plan W177 reste coupe comme la source. Le chiffre de resolution de la dashcam a ete corrige par une seconde retouche pour relire 1080P, pas 1090P ; le titre historique 4K de l'article n'a pas ete change par ce travail et reste une incoherence a traiter dans le catalogue, pas une caracteristique validee ici.

Les marquages faisant physiquement partie du produit ou du vehicule (anneaux Audi, GR, AMG, VIMEL, badges VW, plaque Maxton) restent conserves pour ne pas inventer une variante sans marque. Une question a ete adressee au client sur la conservation de ces marquages ; a defaut de reponse, aucune suppression de marquage physique n'a ete imposee. En revanche les logos/filigranes superposes CJT, IKON, GABPARTS et le pied LAMSPEED ont ete retires dans ces adaptations. Les pieces montees restent sur le vehicule source. Pour les projecteurs Toyota et l'ecran CarPlay 10, seul le produit deja visible a ete extrait du montage publicitaire.

Une edition generative ne garantit pas une conservation exacte des pixels ou des dimensions. Cette revue visuelle n'est pas une preuve technique de l'identite d'une reference, des fixations, des caracteristiques annoncees ou de la compatibilite. Aucun verso cache n'a ete valide par generation.

La premiere image est conservee. Seule l'ancienne deuxieme URL identifiee est remplacee a l'affichage de la fiche produit ; une nouvelle deuxieme URL enregistree dans le catalogue prend automatiquement la priorite. Les autres vues ne sont pas supprimees. Le choix `object-contain` conserve le cadrage de la deuxieme photographie du vendeur.

Les sources, numeros de vue, dimensions, SHA-256 et traitement IA sont dans `src/data/productSecondPhotos.json`. Originaux dans `public/images/products/seller-second/` ; 29 adaptations dans `public/images/products/seller-second-natural/` (WebP qualite 92, environ 2,44 Mo au total). Prompts et chemins relatifs dans `docs/product-second-photos-natural.json`. Les 29 fichiers v1 rejetes ont ete archives hors du dossier public, dans `assets/product-photo-previews-2026-10-17/rejected-studio-v1/`, et ne sont plus selectionnes par la galerie. Le document `product-second-photos-studio.json` est uniquement un historique de la serie rejetee.

Aucun nouveau domaine CSP ni hotlink vers les vendeurs. Aucun lien vendeur ajoute dans l'interface. Aucune modification des prix, disponibilites, compatibilites, premiere image ou lignes Supabase.

Cette verification de photos ne valide pas les compatibilites, l'identite du fournisseur commercial ni les droits de diffusion. Les statuts existants de preparation du catalogue restent inchanges. Le resultat du push et du deploiement est communique separement : les controles locaux ne prouvent pas une publication en ligne.

## 10 articles encore sans remplacement confirme

| Article | Observation / element manquant |
| --- | --- |
| `bmw-logo-door-projectors` | Fiche SCP lisible par la recherche, mais une seule image distincte extraite ; pas de deuxieme photo confirmee. Navigation navigateur infructueuse. |
| `audi-logo-door-projectors` | Mercado Livre redirige vers la verification de compte. Aucune connexion ni contournement tente. |
| `mercedes-logo-door-projectors` | Fiche Walmart chargee ; seules les copies de la photo principale ont ete identifiees pour cet article. Images de recommandations exclues. |
| `vw-golf7-gti-grille` | Ceneo demande un CAPTCHA. Non contourne. |
| `porsche-911-rear-spoiler` | Une seule image produit identifiee sur la fiche Design911. Pas de seconde image confirmee. |
| `porsche-mirror-caps-black` | Ancienne source photographique en carbone pour une reference desormais noire : fournisseur/reference de la finition noire non confirme. Pas de substitution imposee. |
| `porsche-911-diffuser-black` | Meme ambiguite carbone/noir dans la source historique. Fournisseur/reference exacte necessaire. |
| `porsche-logo-door-projectors` | Source historique = page Google Storage non identifiee comme vendeur. Fiche vendeur exacte necessaire. |
| `carplay-screen-12` | Ancienne fiche Noeiefvo renvoie 404 et concernait deja une autre diagonale (11,3 pouces). Fiche de l'article exact necessaire. |
| `reverse-cam-hd` | Une seule photo produit identifiee sur la fiche Total Audio MCK713A. |

Pour ces articles, les images actuelles restent conservees. Ne pas interpreter ce dossier comme une validation de l'ensemble des 40 galeries.

## Verifications locales

- 39 tests passes apres integration v2 : galerie, fiche produit, chargement des images. Les 29 fichiers v2, leurs SHA-256, les chemins et la conservation des 29 originaux sont controles. Un test empeche la selection d'une vue studio v1.
- Compilation de production v2 reussie et reconfirmee le 18 octobre 2026.
- Aucun ecrasement d'une nouvelle image de catalogue : test de garde sur l'URL existante.
- Test de clic sur la photo 2 du spoiler W205 : bonne source, premiere image intacte, `object-contain`, article brouillon toujours non achetable.
- Affichage du site deploye et publication non verifies pour cette modification locale.
