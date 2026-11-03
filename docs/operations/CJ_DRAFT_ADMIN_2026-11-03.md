# Administration — brouillon CJ sans paiement

Le détail d'une commande possédant un dossier fournisseur propose les actions CJ avec les classes et styles existants. Aucune photographie, CSS, page publique ou prix n'est modifié.

1. **Vérifier le brouillon CJ** appelle manuellement le contrôle backend ; aucun appel CJ n'est déclenché au simple affichage de la commande.
2. Les blocages et informations manquantes sont affichés. Un aperçu malformé ou incomplet ne permet pas d'envoyer une demande.
3. **Créer le brouillon CJ sans paiement** nécessite une confirmation explicite de l'opérateur et envoie uniquement l'empreinte et la version du dossier. Le backend construit les lignes/adresse, réserve la tentative avant transmission et impose `payType=3`.
4. Une réservation existante ou un résultat incertain ne propose aucun renvoi. **Actualiser le statut CJ** est disponible après création confirmée ; les observations restent distinctes du suivi client et du paiement fournisseur.

La migration et les routes de la PR backend [#8](https://github.com/tisnooh/tymotors-backend/pull/8) doivent être disponibles avant l'activation de ces actions. Une erreur de service reste visible et n'autorise aucun nouvel envoi depuis un aperçu périmé.

Vérification locale :7 tests ciblés, lint et revue indépendante réussis. La compilation locale a réussi avant le dernier renforcement de validation ; le build CI du commit final reste le contrôle de publication. Aucun appel CJ réel ni déploiement production n'est revendiqué.

La référence CJ approuvée et les données unitaires du premier produit restent attendues du fournisseur/CJ. L'interface ne valide pas automatiquement un produit et ne lance ni paiement fournisseur ni expédition.
