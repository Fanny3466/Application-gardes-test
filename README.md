# Application Gardes V2.0.1 — correctif écran blanc

Ce correctif résout l'écran vide observé après le déploiement de la V2.

Cause corrigée : `repositories.js` et `app.js` déclaraient des constantes globales portant les mêmes noms (`P`, `norm`, `dateOnly`). Dans un navigateur, cela bloque l'exécution de `app.js` avec une erreur de redéclaration, alors que la feuille CSS est déjà chargée : le résultat visible est un écran gris/blanc vide.

La V2.0.1 isole maintenant les scripts dans des fonctions privées (IIFE), renouvelle le cache du Service Worker et affiche un écran de chargement/diagnostic si une future erreur JavaScript survient.

Déployer tous les fichiers à la racine du dépôt GitHub Pages.
