# Préparation commerciale et informations consommateurs — 28 octobre 2026

## Contrôle final du Chef

703tests/43suites frontend PASS avant l’allègement final du texte client. Après
ce changement rédactionnel :50tests/4suites concernés PASS, ESLint ciblé et AST
identique à HEAD PASS, build final optimisé PASS. Les mentions internes de
simulation/connexion logistique ont été retirées du texte client, sans promesse
de livraison ni modification de structure, classe, style ou image. Aucun
déploiement. Le contre-audit indépendant final a repris après vérification de disponibilité :
50tests/4suites PASS, versions stagées relues, AST/styles/images inchangés,
APPROVED LOCAL. Aucune conformité juridique globale ni validation live déclarée.


Ce lot corrige le contenu existant ; il ne vaut ni avis juridique, ni conformité globale, ni autorisation d’ouvrir les ventes. Aucun SIRET ou statut juridique n’a été créé ou recherché, aucun fournisseur contacté, aucun prix public ou visuel modifié. Le backend n’est pas modifié par ce lot.

## Corrections réellement apportées

- Livraison/FAQ : suppression des promesses générales de huit pays, forfait de 15 €, gratuité à 350 €, suivi email automatique et pose nécessairement documentée. Les deux cartes de livraison et leur structure restent en place, avec des textes de préparation et de devis vérifiés.
- CGV : référence/variante/véhicule exacts, montants TTC, TVA non ajoutée deux fois, information avant engagement, responsabilité du vendeur envers son client, recours en cas de retard et absence de substitution imposée.
- Garanties/SAV : distinction entre droits légaux et garantie fournisseur/commerciale ; délais et recours résumés sans inventer de garantie supplémentaire ni d’accord SAV.
- Rétractation : alternatives au formulaire, point de départ et retours, remboursement et frais standard, frais de retour soumis à information préalable, exception de personnalisation non étendue aux variantes standard. Une installation ne supprime pas automatiquement les droits.
- Accusé de rétractation : contrôle de la réponse avant d’affirmer un enregistrement ou un envoi email ; le défaut d’email reste visible avec l’accusé téléchargeable. Verrou synchrone contre double soumission, aucune demande sans confirmation explicite.
- Contact et pages légales : même source publique `SiteConfig.get()` / `legal`, types et espaces validés, aucun remplacement par des coordonnées fictives ou des variables frontend divergentes. Le statut de préparation ne disparaît pas si des champs restent manquants.
- Confidentialité : localisation « base à Paris » non vérifiée retirée ; prestataires et éventuels transferts restent à confirmer. Aucun nouveau traitement ajouté.
- Litiges : l’ancienne plateforme ODR/RLL, fermée le 20 juillet 2025, n’est pas proposée comme canal actif. Le médiateur n’est pas inventé.

## Champs et décisions humains encore nécessaires

Les valeurs absentes restent visibles « à renseigner » ; aucune activation ne résulte du remplissage de ces textes.

| Information | Champ existant / action | État du lot |
|---|---|---|
| Identité légale, forme, SIRET, immatriculation | `LEGAL_COMPANY_NAME`, `LEGAL_LEGAL_FORM`, `LEGAL_SIRET`, `LEGAL_REGISTRATION` | Fournis par le propriétaire uniquement ; démarches d’immatriculation/statut exclues |
| Coordonnées professionnelles réelles | `LEGAL_ADDRESS`, `LEGAL_CONTACT_EMAIL`, `LEGAL_CONTACT_PHONE` | À fournir et tester ; aucun contact inventé |
| Régime/mention TVA applicable | `LEGAL_VAT_MENTION` | À confirmer selon situation réelle, aucun taux ou régime attribué |
| Publication et hébergement | `LEGAL_PUBLICATION_DIRECTOR`, `LEGAL_HOSTING_DETAILS` | Identités/coordonnées à vérifier, région effective et contrats également |
| Médiation | `LEGAL_MEDIATOR_NAME`, `LEGAL_MEDIATOR_ADDRESS`, `LEGAL_MEDIATOR_URL` | Choisir puis adhérer effectivement au dispositif compétent ; pas de convention ou frais engagés |
| Adresse et organisation des retours | `LEGAL_RETURNS_ADDRESS` | Adresse effective à confirmer, pas d’adresse fournisseur substituée automatiquement |
| Frais de retour non postaux | Information précontractuelle adaptée aux pièces volumineuses | Coût/estimation à établir avant vente ; absent, non inventé |
| Encadré réglementaire garanties | Modèle applicable de l’annexe D211-2 + coordonnées garanties | Résumé existant clarifié ; encadré complet et vérification juridique restent nécessaires, sans nouveau composant visuel dans ce lot |
| Contrat sur support durable | CGV applicables, formulaire-type, informations et date/heure de confirmation | Remise effective avec le contrat à tester ; lien imprimable seul insuffisant |
| Facturation | Solution numérotée/TVA/avoirs/archivage adaptés | Le document backend est un récapitulatif, pas une facture fiscale |
| Livraison réelle | Références/destination, délai d’engagement, transport, coût complet et import | Dépend des preuves commerciales ; aucun forfait ou délai créé ici |
| Données et transferts | Prestataires actifs, région, contrats, garanties et durées effectivement mises en œuvre | Politique à finaliser/contrôler, aucune purge ou connexion logistique supposée |

## Limites techniques à transmettre au responsable backend

`POST /api/withdrawals` recherche aujourd’hui la commande par numéro et email avant enregistrement. Le site ne présente plus ce canal comme exclusif : une autre déclaration non ambiguë reste possible aux coordonnées du vendeur à fournir. La procédure effective doit garantir qu’une difficulté d’identification ne prive pas le consommateur de son droit. Le flux numérique existant, son accès permanent et l’accusé durable doivent être revérifiés au regard de L221-21/D221-5 en vigueur depuis le 19 juin 2026. Aucun contournement de la vérification d’identité ni changement backend effectué ici.

La présence de coordonnées ou d’un booléen `legal_ready` n’est pas une validation juridique des CGV. Les échecs de configuration restent en préparation. Les paiements/expéditions simulés ne prouvent aucun service commercial réel.

## Sources primaires vérifiées le 28 octobre 2026

- [Informations précontractuelles et vente en ligne — Service Public](https://entreprendre.service-public.gouv.fr/vosdroits/F23455) : information avant engagement et remise durable, pas de promesse de conformité totale.
- [Droit de rétractation — Service Public](https://www.service-public.gouv.fr/particuliers/vosdroits/F10485) : délai, remboursement, options standard et exceptions.
- [L221-21 — Légifrance, version en vigueur](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000053310520/2026-09-15) : déclaration non ambiguë, fonctionnalité en ligne et accusé durable.
- [Livraison : obligations et recours — DGCCRF](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/livraison-quelles-sont-les-obligations-du-professionnel-et-les-recours) : engagement sur le délai, résolution et remboursement.
- [Garantie légale de conformité — Service Public](https://www.service-public.gouv.fr/particuliers/vosdroits/F11094), [garanties légales — DGCCRF](https://www.economie.gouv.fr/dgccrf/les-fiches-pratiques/les-garanties-legales-de-conformite-et-contre-les-vices-caches), [annexe D211-2 — Légifrance](https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000045981314) : droits, mise en conformité, vices cachés et modèle réglementaire. Les sources de synthèse peuvent différer dans leurs mises à jour ; le modèle complet et les évolutions doivent être validés avant lancement.
- [Médiation — Service Public](https://entreprendre.service-public.gouv.fr/vosdroits/F33338) : désignation/adhésion réelles et accès gratuit du consommateur.
- [Fermeture de l’ODR — Commission européenne](https://consumer-redress.ec.europa.eu/site-relocation_en), [règlement 2024/3228 — EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX%3A32024R3228) : service fermé depuis le 20 juillet 2025. Aucun ancien lien ne doit être ajouté à partir d’une fiche obsolète.

## Vérifications

- Tests ciblés réels : **50 tests / 4 suites réussis** (`LegalPages`, `SupportPages`, normalisation de configuration, validation des accusés). Exécutés avec CI, `--watchAll=false --runInBand --no-cache --testTimeout=30000`. Aucun email réel ou formulaire externe envoyé : transports mockés.
- Contact : configuration indisponible ou malformée sans crash, erreur privée non affichée, formulaire toujours utilisable ; coordonnées uniquement depuis la liste publique autorisée.
- Rétractation : confirmation requise, double soumission limitée à une requête, résultat HTTP200 incomplet refusé comme preuve, distinction enregistrement/envoi email.
- Comparaison AST avec `HEAD` : `LegalPages.jsx` conserve ses **81 éléments JSX et 29 attributs de classe/style**, `SupportPages.jsx` ses **114 éléments JSX et 87 attributs de classe/style**, séquences et valeurs identiques. Aucune structure de rendu, mise en page, classe, image ou feuille de style ajoutée/modifiée ; seuls textes et logique non visuelle changent.
- ESLint ciblé et `git diff --check` réussis. Quatre imports inutilisés et une apostrophe JSX préexistants dans `SupportPages` ont été nettoyés sans modifier la structure/styles.
- Aucun build lourd global ni publication exécuté par cet agent ; aucun accès aux ports de recette du chef. Le paiement, la livraison réelle, les décisions de médiation/frais et la conformité complète restent hors preuve de ces tests.
