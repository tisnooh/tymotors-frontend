# TYMotors — correctifs du parcours client, 30 octobre 2026

## Modifications locales

- Le devis accepte une URL Stripe de production seulement si le serveur retourne explicitement `is_test: false`, un identifiant `cs_live_` cohérent et l’URL HTTPS exacte de Stripe. Le validateur réservé aux tests demeure réservé aux tests.
- La confirmation attend la restauration de l’authentification, isole les réponses par propriétaire et session, et borne les nouvelles lectures après erreur temporaire. Elle ne crée jamais un nouveau paiement.
- Les états remboursé et échoué ne sont plus présentés comme une simple attente de paiement.
- Une panne des préférences newsletter ne masque plus les commandes du compte. Les réponses d’un ancien compte ne remplacent pas celles du compte actuel.
- Les montants conservent les centimes. Les prix publics enregistrés ne sont pas modifiés.
- Les formulaires administrateur historiques refusent une commande contextuelle nécessitant ses dossiers fournisseur, versions et preuves. Les nouveaux champs de traitement ne sont pas ajoutés sans validation du propriétaire.
- Le message de devis indisponible ne présume plus qu’il s’agit nécessairement d’un paiement de test. Les badges des vraies commandes de test sont conservés.

## Vérifications

- `npm.cmd run lint` : PASS.
- `git diff --check` : PASS.
- Après arrêt des traitements concurrents : tests ciblés des six fichiers checkout, confirmation, compte, administration et formatage : **6 suites, 98 tests PASS**, 29,363 secondes, exit 0.
- Après fin de la suite backend et sans build concurrent : suite Jest globale **47 suites, 724 tests PASS**, 110,275 secondes, exit 0. Les composants ayant précédemment atteint le timeout passent sans modification de code ni augmentation du délai de test.
- Aucun fichier photo, CSS, police, mise en page ou animation modifié.
- Suite Jest globale relancée le 30 octobre : plusieurs tests React asynchrones atteignent leur timeout de 5 secondes sous pression mémoire. Le run a été arrêté, sans augmentation des timeouts et sans déclarer un résultat positif.
- Builds initiaux arrêtés pour libérer les ressources. Nouveau build séquentiel avec `CI=true` et `GENERATE_SOURCEMAP=false` : **PASS**, `Compiled successfully`, exit 0. Cette variable réduit la mémoire des artefacts de compilation, sans modification de code ou du design.
- Mesure de l’environnement : 103668 KiB de mémoire physique libre sur 3553152 KiB visibles. Ce constat ne remplace pas un nouveau test des composants en échec.

## Reprise

1. Attendre la fin de la recette backend en cours.
2. Tests ciblés terminés : 98 PASS. Build seul terminé : PASS.
3. Suite globale relancée seule et terminée : 724 PASS.
4. Faire relire le diff avant commit/push.

Le mode Stripe réel, les références fournisseurs, les tarifs de livraison et l’activation commerciale ne sont pas validés par ces changements frontend.

## Suite du 31 octobre — dossiers fournisseur dans l’administration

Le propriétaire a autorisé les champs fonctionnels avec les styles actuels. Le détail d’une commande contextuelle montre désormais chaque dossier fournisseur séparément, son SKU, son groupe, sa variante, les contrôles et son instantané. Il permet de préparer un brouillon fournisseur sans transmission et d’enregistrer manuellement, par dossier, la référence et la preuve fournisseur, puis le transporteur, le suivi et les preuves d’expédition et de livraison. Chaque écriture passe par `POST /api/admin/commerce/context/tasks/{task_id}/advance` avec `expected_updated_at`; les anciens formulaires globaux restent cachés pour ces commandes. Les commandes sandbox ne peuvent pas utiliser ces actions. Les boutons ne passent aucune commande ni ne paient un fournisseur.

Vérifications de ce lot : **5 tests ciblés PASS**, dont absence d’écriture sandbox, brouillon sans envoi et payload d’expédition avec version CAS et preuve ; `npm.cmd run lint` PASS ; build `CI=true GENERATE_SOURCEMAP=false npm.cmd run build` PASS. Un audit source a comparé les champs envoyés au modèle `ContextDispatchInput` et aux transitions SQL. Aucun CSS, aucune photographie et aucun prix modifié. L’agent de revue indépendant et l’inspection staging ont été interrompus par la limite d’utilisation ; ces validations ne sont pas revendiquées. Aucune migration hébergée ni mise en production effectuée pour ce lot.
