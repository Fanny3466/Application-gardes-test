# Correctif Graph V2.3.3 — écriture par plages de feuille

## Pourquoi une nouvelle correction

Le classeur accepte :
- l'authentification Microsoft 365 ;
- la session Workbook ;
- la lecture des 9 tables `tblApp_*`.

En revanche, les opérations d'écriture basées sur des sous-ressources de tableau
(`tableRow PATCH` puis `tableColumn/range PATCH`) renvoient `ApiNotFound` dans
cet environnement Excel Online / `.xlsm`.

## Stratégie V2.3.3

Les tables restent utilisées pour la lecture et pour repérer les coordonnées.

Pour écrire, l'application :
1. lit la plage du tableau (`/tables/.../range`) ;
2. récupère `rowIndex`, `columnIndex` et le nom de feuille ;
3. calcule l'adresse A1 de la cellule ou de la ligne ;
4. écrit via l'API générique et stable :
   `PATCH /workbook/worksheets/{sheet}/range(address='A1:B2')`.

## Module VBA V1.3

Le module V1.3 préalloue :
- `tblApp_Saisies` : 1500 lignes ;
- `tblApp_Commandes` : 500 lignes ;
- `tblApp_Publications` : 300 lignes ;
- `tblApp_Verrous` : 200 lignes.

L'application remplit les premières lignes vides via des plages de feuille,
sans appeler `rows/add`.

## Conséquence

Cette version évite les trois opérations Graph qui ont posé problème :
- `PATCH .../rows/{index}`
- `PATCH .../columns/{column}/range`
- `POST .../rows/add`

Aucun moteur d'affectation n'est déplacé : le VBA reste le moteur métier.
