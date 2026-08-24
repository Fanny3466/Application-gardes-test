# Microsoft Graph — Excel Direct

Type Entra : **Single-page application (SPA)**.

URI de redirection :
`https://fanny3466.github.io/Application-gardes-test/`

Autorisations déléguées :
- `User.Read`
- `Files.ReadWrite`

Le `.xlsm` doit être stocké dans SharePoint ou OneDrive Entreprise.

Copie son lien de partage dans `config.js` :

```js
excelDirect: {
  workbookShareUrl: "COLLER_ICI_LE_LIEN_DU_FICHIER"
}
```

Puis passe :

```js
mode: "excel-direct"
```
