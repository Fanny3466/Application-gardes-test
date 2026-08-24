# Correctif Microsoft Graph V2.3.2

Le classeur passe désormais tous les tests de lecture :
- authentification Microsoft 365 ;
- fichier SharePoint ;
- session Workbook ;
- 9 tables `tblApp_*`.

L'erreur restante V2.3.1 était :
`Graph 400 - ApiNotFound`

Elle apparaissait au moment d'écrire `Email` et `Role` dans `tblApp_Agents`
avec l'API `PATCH .../tables/.../rows/{index}`.

## Correction

La V2.3.2 utilise maintenant l'API de mise à jour de plage de colonne :

`PATCH .../workbook/tables/{table}/columns/{column}/range`

Cette méthode est utilisée :
- pendant l'association administrateur dans `setup.html` ;
- pour modifier Email / Role / Actif depuis l'écran Administration ;
- pour mettre à jour un verrou déjà existant.

Aucun changement VBA n'est requis.
