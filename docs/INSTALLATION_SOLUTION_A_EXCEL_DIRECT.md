# Solution A — Excel Direct

Le classeur analysé est `FEUILLES DE GARDES (test automatisation)(3).xlsm`.

## Import VBA
1. Alt + F11
2. Fichier > Importer un fichier
3. importer `Module_Application_Excel_Direct_v1_0.bas`
4. Débogage > Compiler VBAProject
5. enregistrer le `.xlsm`
6. lancer `Initialiser_Solution_A_Excel_Direct`

Le module crée `DONNEES APPLICATION` avec les tables `tblApp_*`.

## Synchronisation
Lancer `Demarrer_Synchronisation_Application`.

La fréquence reste pilotée par `FREQUENCE_MINUTES` dans `Parametres application`.

## Bascule de l'app
Dans `config.js`, laisse `mode: "demo"` tant que Microsoft 365 n'est pas configuré.

Ensuite renseigne `tenantId`, `clientId`, `workbookShareUrl`, puis passe à :

`mode: "excel-direct"`
