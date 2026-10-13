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

Hero : image déjà sélectionnée conservée (`photo-1762314907955-b7c1e11a8782`). Storytelling : les six sources existantes sont conservées, seule la fenêtre de cadrage mobile change. Pas de migration de données ni modification des sources produit.

La CSP autorise uniquement le CDN `https://images.pexels.com` en plus des hôtes image existants. Aucune ouverture des scripts, des connexions API ou des autres directives.

## Recette visuelle locale

Depuis `frontend`, lancer `node tests/browser-build.cjs --visual`, puis `node tests/browser-serve.cjs --visual`. Serveur limité à `127.0.0.1:3001`, APIs remplacées par des fixtures publiques : aucun paiement, session client ou changement de base. Ne pas confondre ce test visuel avec une intégration de production.

Pour le chemin animé téléphone, ouvrir `http://localhost:3001/?phone=1` dans un viewport mobile puis recharger. Cette fixture seule émule un user-agent téléphone, le drapeau tactile GSAP et l'absence de réduction des mouvements ; elle n'est jamais importée dans le bundle de production. Sans ce paramètre, les préférences réelles restent utilisées. Le loader de diagnostic rend visibles les erreurs d'animation dans cette fixture seulement. La validation finale sur Safari/iPhone physique reste nécessaire.
