# Mise en production — Application Gardes V2.2.0

## Architecture retenue

iPhone / Android → GitHub Pages → Microsoft Entra / MSAL → Microsoft Graph → tables `tblApp_*` du classeur Excel → Excel Desktop / VBA → `Demande dispo` → `Remplir_Feuille_Gardes_En_W` → `Mois complet (Diffusion)` → `tblApp_Affectations`.

Le fichier Excel reste la source de référence. Les données déjà exportées montrent que le référentiel contient notamment les codes, noms, équipes, fonctions, créneaux, disponibilités et affectations nécessaires à l'application.

## Étape 1 — Excel

Importer `Module_Application_Excel_Direct_v1_2_PRODUCTION.bas`.

Puis exécuter :
1. `Initialiser_Solution_A_Excel_Direct`
2. `Diagnostiquer_Tables_Disponibilites_Application`
3. `Diagnostiquer_Production_Excel_Direct`

La V1.2 ajoute `tblApp_Saisies`, une file dédiée aux écritures mobiles. `tblApp_Disponibilites` devient un miroir de lecture, ce qui évite d'écraser une saisie reçue pendant un export.

Quand la configuration est prête :
`Passer_Application_En_Production`

Cette macro règle `FREQUENCE_MINUTES = 1` et démarre la synchronisation planifiée.

## Étape 2 — Stockage Microsoft 365

Placer le `.xlsm` dans SharePoint ou OneDrive Entreprise et utiliser ce fichier comme fichier de travail unique.

## Étape 3 — Microsoft Entra

Créer une inscription d'application :
- plateforme : **Single-page application (SPA)**
- URI :
  - `https://fanny3466.github.io/Application-gardes-test/`
  - `https://fanny3466.github.io/Application-gardes-test/setup.html`
- autorisations déléguées Microsoft Graph :
  - `User.Read`
  - `Files.ReadWrite`

Ne créer aucun client secret pour la PWA.

## Étape 4 — Déployer V2.2.0

Remplacer le contenu de la racine GitHub Pages par le contenu du ZIP V2.2.0.

Au premier lancement, l'application affiche **Configuration production requise**.

Ouvrir :
`https://fanny3466.github.io/Application-gardes-test/setup.html`

Renseigner :
- Tenant ID
- Client ID
- lien de partage du `.xlsm`
- code agent administrateur initial (`CFa` est proposé pour le classeur actuel)

L'assistant :
1. authentifie le compte Microsoft 365 ;
2. résout `driveId` et `itemId` ;
3. tente réellement d'ouvrir une session Workbook sur le fichier ;
4. vérifie les 9 tables de production ;
5. associe le compte connecté à l'agent administrateur ;
6. génère `production-config.js`.

## Étape 5 — Activer le site

Remplacer uniquement `production-config.js` à la racine GitHub par le fichier généré.

Après le prochain déploiement Pages, l'application passe directement en mode :
`PRODUCTION · EXCEL DIRECT`.

## Sécurité

La PWA ne contient aucun client secret. Les accès au fichier restent contrôlés par Microsoft 365 et les permissions SharePoint / OneDrive. Un utilisateur doit être authentifié et avoir accès au fichier.

Pour un agent standard, l'application associe le compte connecté à la colonne `Email` de `tblApp_Agents`. Les utilisateurs non associés sont bloqués par l'interface.
