# Déployer Application Gardes V2 sur le GitHub Pages existant

URL actuelle :

`https://fanny3466.github.io/Application-gardes-test/`

## Remplacement de la V1

1. Ouvrir le dépôt GitHub `Application-gardes-test`.
2. Supprimer les anciens fichiers de la V1 ou les remplacer.
3. Envoyer **le contenu du dossier `Application_Gardes_V2` à la racine du dépôt** :
   - `index.html`
   - `styles.css`
   - `app.js`
   - `repositories.js`
   - `config.js`
   - `profile.js`
   - `manifest.webmanifest`
   - `sw.js`
   - `404.html`
   - dossier `assets`
4. Faire **Commit changes**.
5. Attendre la fin du déploiement GitHub Pages.
6. Ouvrir :
   `https://fanny3466.github.io/Application-gardes-test/`

## Important : ancien cache de la V1 sur iPhone

La V2 utilise un nouveau cache `gardes-v2-2.0.0`.

Si l'iPhone affiche encore la V1 :
1. fermer complètement l'application Gardes ;
2. ouvrir l'URL dans Safari ;
3. recharger la page ;
4. si nécessaire supprimer l'ancienne icône de l'écran d'accueil puis la recréer.

## Mode livré

`config.js` contient :

```js
mode: "demo"
```

La V2 est donc immédiatement testable sans Microsoft 365.

La bascule vers SharePoint est décrite dans `CONFIGURATION_MICROSOFT_365.md`.
