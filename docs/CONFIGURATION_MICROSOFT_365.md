# Configuration Microsoft 365 / SharePoint — Application Gardes V2

## Architecture

Application iPhone / Android
→ Microsoft Entra ID
→ Microsoft Graph
→ SharePoint Lists
→ Power Automate
→ module VBA de synchronisation
→ Excel
→ Affectations / Publications
→ Application

L'application mobile écrit directement dans SharePoint avec le compte professionnel connecté.
Le module VBA continue à utiliser les flux Power Automate créés pour Excel.

## 1. Enregistrement Microsoft Entra

Créer une **Single-page application (SPA)**.

URI de redirection :

`https://fanny3466.github.io/Application-gardes-test/`

Récupérer :
- Tenant ID
- Application (client) ID

Autorisations déléguées nécessaires à cette V2 :
- `User.Read`
- `Sites.ReadWrite.All`

Microsoft Graph demande actuellement `Sites.ReadWrite.All` pour créer des éléments dans une liste SharePoint avec une autorisation déléguée.

## 2. Mettre à jour config.js

```js
mode: "m365",

microsoft365: {
  tenantId: "VOTRE_TENANT_ID",
  clientId: "VOTRE_CLIENT_ID",
  redirectUri: "https://fanny3466.github.io/Application-gardes-test/",
  scopes: ["User.Read", "Sites.ReadWrite.All"]
},

sharePoint: {
  hostname: "votretenant.sharepoint.com",
  sitePath: "/sites/VOTRE_SITE",
  ...
}
```

## 3. MSAL Browser

La V2 de test charge MSAL Browser v5.17.3 via un import ESM uniquement lorsque `mode = "m365"`.

Pour la production, Microsoft indique que le CDN historique de `@azure/msal-browser` est déprécié et recommande de consommer la bibliothèque via un gestionnaire de paquets / bundler.

La V2 peut donc être testée avec le fallback ESM fourni, puis transformée en build npm/Vite lorsque la configuration Microsoft 365 est validée.

## 4. Identification automatique

Ajouter dans la liste `Agents` :
- `Email`
- `Role`

Valeurs de `Role` :
- `AGENT`
- `CHEF`
- `ADJOINT`
- `ADMIN`

En mode connecté :
- l'application cherche l'email Microsoft 365 dans `Agents.Email` ;
- un agent standard ne change plus d'identité ;
- Chef / Adjoint / Admin conservent les vues de pilotage.

## 5. Sécurité

Ne jamais mettre :
- un mot de passe Microsoft 365 ;
- un secret client Entra ;
- une URL Power Automate signée

dans le dépôt GitHub public.

Une SPA utilise un **client ID public**, jamais un secret client.
