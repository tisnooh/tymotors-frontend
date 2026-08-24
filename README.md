# TYMotors frontend — branche de test

Boutique React TYMotors avec recherche par véhicule, catalogue, panier, Stripe Checkout et administration protégée côté backend.

## Démarrage

1. Copier `.env.example` vers `.env.local`.
2. Définir `REACT_APP_BACKEND_URL` vers le backend local ou le backend de staging.
3. Définir `REACT_APP_SUPABASE_URL` et `REACT_APP_SUPABASE_PUBLISHABLE_KEY` avec les valeurs publiques du projet Supabase de staging.
3. Installer les dépendances avec `yarn install --frozen-lockfile`.
4. Lancer `yarn start` ou vérifier avec `yarn build`.

Le frontend ne doit contenir aucune clé Stripe secrète, clé Cloudinary privée, URI MongoDB ou mot de passe administrateur. La connexion `/admin` envoie le mot de passe au backend et conserve uniquement un jeton court en mémoire.

## Vercel Preview

La branche `develop` doit rester un Preview Deployment. Configurer :

- `REACT_APP_BACKEND_URL` : URL du backend Render de staging ;
- `REACT_APP_SUPABASE_URL` : URL publique du projet Supabase de staging ;
- `REACT_APP_SUPABASE_PUBLISHABLE_KEY` : clé publique Auth (jamais la clé service-role) ;
- `REACT_APP_SITE_URL` : URL de Preview ou domaine de test ;
- `REACT_APP_SITE_MODE=test` : maintient `noindex,nofollow` ;
- les coordonnées de support uniquement lorsqu'elles sont réelles.

Ne pas promouvoir le déploiement en production et ne pas fusionner `develop` dans `main` avant validation du webhook Stripe, du catalogue et d'une commande test complète.

## Parcours à tester

1. sélectionner marque, modèle, génération et année dans le hero ;
2. ouvrir une fiche produit et vérifier la compatibilité ;
3. ajouter au panier avec le véhicule mémorisé ;
4. vérifier prix, livraison et statut de compatibilité ;
5. payer avec une carte Stripe de test ;
6. confirmer que la commande devient `paid` uniquement après webhook ;
7. vérifier la commande dans `/admin`.

Le build de test reste une SPA Create React App. Une migration vers un rendu serveur pourra être évaluée après la sécurisation et la validation commerciale du MVP.
