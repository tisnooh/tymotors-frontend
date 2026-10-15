# Personnalisation : compatibilités et cohérence des visuels

Contrôle du 16 octobre 2026. Périmètre : les **14 groupes de générations sélectionnables, 42 vues actives** (extérieur, intérieur, technologie). Il s'agit d'une revue visuelle de cohérence modèle/génération, pas d'une certification constructeur, d'un décodage VIN ni d'une garantie de montage. Les graphismes d'écran, petits boutons, matériaux, finitions et options restent illustratifs.

## Correctifs

- Le configurateur demande désormais `strict_vehicle=true`, avec les détails connus du véhicule. Une réponse d'ancienne API sans `fitment_scope: verified_vehicle` est refusée ; aucune pagination approximative par filtrage d'une seule page côté client.
- Le backend retient uniquement un produit vérifié possédant une même règle vérifiée correspondant à marque + modèle + génération et aux détails fournis. Les références de démonstration sans règles restent dans la boutique générale, pas dans les suggestions personnalisées. Aucune donnée de compatibilité ou de stock n'a été inventée.
- Trois extérieurs sont corrigés par génération IA puis réinspectés : G20 **pré-LCI 2020**, A3 8V **restylée 2017**, 911 **991.2 2017**. Le studio noir/rouge et la composition sont conservés. Les originaux `exterior-v1.webp` restent présents ; seules les nouvelles références `exterior-v2.webp` sont utilisées. Les sources et prompts figurent dans `sources.json`.

## Revue des images

Les planches locales `assets/configurator-recheck-2026-10-16/*-contact.jpg` ont servi à inspecter les 42 vues, puis les trois sorties corrigées ont été examinées individuellement avant encodage WebP. Les vues technologie ont été comparées à leur propre habitacle (pas à une voiture générique).

| Groupe | Éléments contrôlés et conclusion à l'échelle du modèle |
| --- | --- |
| Mercedes Classe A W177 | Compacte 5 portes, double écran sans casquette, cinq aérateurs turbine : cohérence générale conservée, phase 2018–2022. |
| BMW Série 3 F30 / F35 | Exemple extérieur F30 berline, compteurs ronds, écran iDrive séparé et console F3x : cohérence générale. Ce n'est pas une représentation spécifique de l'empattement F35. |
| BMW Série 3 G20 | Ancien extérieur LCI à feux/pare-chocs 2022 incohérent avec l'habitacle 2020. Remplacé par un pré-LCI : encoche de phare, calandre à barreaux et prises d'air adaptées. |
| BMW Série 4 F32 / F36 | Exemple F32 coupé 2 portes, ouïe derrière la roue avant, architecture F3x et iDrive séparé : cohérence générale. Ne représente pas exactement une F36 4 portes. |
| Mercedes Classe C W205 | Berline, tablette indépendante, trois aérateurs centraux ronds, console à commande rotative/tactile : cohérence générale pré-restylage. |
| Audi A3 8V | Sportback 5 portes, aérateurs ronds et écran MMI séparé. Extérieur ancien 8V remplacé par la phase restylée 2017 pour harmoniser le lot. |
| Audi A4 B9 | Berline, large bande horizontale d'aération, écran séparé et commande MMI sur console : cohérence générale B9 initiale. |
| Porsche 911 991 | Console haute, petit PCM paysage et levier PDK de 991. Extérieur 991.1 remplacé par 991.2 (feux et bouclier) pour l'exemple 2017. |
| Porsche 911 992 | Coupé, phares ronds, planche horizontale, grand PCM intégré et petit sélecteur : cohérence générale 992 initiale, distincte de 991. |
| Porsche Cayenne 9YA | SUV 5 portes, prises d'air horizontales, PCM large, sélecteur haut et console à poignées : cohérence générale de troisième génération. Face avant comparée à la photo officielle de lancement 2017, pas confondue avec un Cayenne restylé 2023. |
| Volkswagen Golf 7 GTI | Ligne rouge, bouclier GTI, volant méplat, tissu à carreaux, levier manuel et MIB intégré : cohérence générale Mk7. |
| Volkswagen Golf 7 R | Bouclier R, aiguilles bleues, sellerie noire, DSG et MIB intégré : cohérence générale Mk7, distincte du GTI manuel. |
| Toyota GR Supra A90 | Coupé 2 places, habitacle bas, console asymétrique et appui de genou, sélecteur automatique et écran séparé : cohérence générale A90 ; commandes partagées de type BMW ne suffisent pas à identifier une autre voiture. |
| Toyota GR Yaris XP210 | Carrosserie 3 portes, compteurs analogiques, boîte manuelle, commande GR-Four et écran haut : cohérence générale 2020–2023, pas le tableau de bord 2024. |

Limites maintenues : les groupes F30/F35 et F32/F36 sont ceux du catalogue ; aucune promesse d'image exacte pour toutes leurs variantes. Les sélections d'année, carrosserie ou finition explicitement hors périmètre ne reçoivent pas un habitacle emprunté à un autre modèle. A5, Boxster, Cayman et GR86/GT86 n'ont toujours pas de générations sélectionnables : aucun visuel supplémentaire n'a été inventé.

## Références constructeur consultées (recherche, aucune photo copiée dans les actifs publics)

- [BMW F32 : carrosserie et habitacle F3x](https://www.press.bmwgroup.com/usa/article/detail/T0142773EN_US/the-all-new-bmw-4-series-coupe?language=en_US)
- [BMW G20 initiale, encoche des phares et lancement 2019](https://www.press.bmwgroup.com/ireland/article/detail/T0285412EN/the-new-bmw-3-series)
- [BMW G20 LCI, différences de juillet 2022](https://www.press.bmwgroup.com/usa/article/detail/T0390493EN_US/the-new-bmw-3-series)
- [Mercedes W177 : architecture de la planche de bord et aérateurs](https://media.mercedes-benz.com/article/43695e84-b4ef-4650-801f-d5842868255b)
- [Mercedes W205 : manuel 2014 et aérateurs](https://static.oneweb.mercedes-benz.com/css-oom-assets/en-jo/pdf/mercedes-c-class-sedan-2014-w205-owners-manual-1.pdf)
- [Audi A3 8V : évolution 2016](https://audi.media-corner.ch/press/technologie-update-fuer-den-kompakten-bestseller-der-neue-audi-a3)
- [Audi A4 B9 : lancement 2015](https://audi.media-corner.ch/press/die-neuen-audi-a4-und-a4-avant)
- [Porsche 991.2 : phares, carrosserie et PCM 7 pouces](https://newsroom.porsche.com/de/produkte/porsche-911-carrera-2015-11363.html)
- [Porsche 992 : architecture horizontale et PCM 10,9 pouces](https://newsroom.porsche.com/en/products/porsche-911-new-eigth-generation-992-timeless-machine-design-icon-world-premiere-los-angeles-2018-16522.html)
- [Porsche Cayenne : troisième génération 2017, galerie studio](https://newsroom.porsche.com/en/products/porsche-cayenne-2017-design-style-lighting-concept-third-generation-suv-14077.html)
- [Volkswagen Golf Mk7 GTI : extérieur, sièges, commandes](https://www.volkswagen-newsroom.com/en/new-golf-gti-international-press-presentation-2976/new-golf-gti-features-exterior-interior-and-options-3008)
- [Volkswagen Golf Mk7 R : habitacle et aiguilles bleues](https://www.volkswagen-newsroom.com/de/der-neue-golf-r-2432/das-interieur-des-golf-r-2464)
- [Toyota GR Supra : cockpit et console asymétrique](https://media.toyota.co.uk/the-legend-returns-world-premiere-of-the-new-toyota-gr-supra-at-the-2019-north-american-international-auto-show/)
- [Toyota GR Yaris : galerie officielle habitacle 2020–2023](https://media.toyota.co.uk/images/toyota-gr-yaris-interior-2020-2023/)

## Vérifications techniques

- Backend : **286 tests réussis**, dont 21 tests du catalogue strict ; aucune écriture distante pendant les tests. Commit `8be4431` poussé sur `develop`, branche du service européen existant. CI GitHub réussie.
- API publique : W177 2020 + performance + `strict_vehicle=true` renvoie `items: []`, `total: 0`, `fitment_scope: verified_vehicle`. La requête générale Mercedes/performance conserve ses cinq aperçus. Cela signifie qu'aucune compatibilité vérifiée n'est encore renseignée pour ces références, pas qu'elles sont commercialement compatibles.
- Frontend final : **26 suites, 259 tests réussis** ; ESLint des fichiers modifiés sans erreur ; build production compilé avec succès et l'origine backend européenne.
- Les contrôles navigateur et les identifiants du déploiement final sont enregistrés dans le dossier de preuves local après publication. Les résultats locaux seuls ne sont pas présentés comme une vérification en ligne.
