# Gestion des rôles — Application & Excel

## Principe
Les rôles de l'application sont pilotés par la table **tblApp_Agents**.

Colonnes concernées :
- `Email` : associe le compte Microsoft 365 à un agent ;
- `Role` : définit le niveau d'accès.

Valeurs recommandées pour `Role` :
- `AGENT`
- `ADJOINT`
- `CHEF`
- `ADMIN`

## Depuis Excel
Ouvre l'onglet **Données application** puis la table **tblApp_Agents**.
Modifie directement les colonnes `Email` et `Role`.
La modification sera prise en compte par l'application au prochain rafraîchissement.

## Depuis l'application
Dans l'écran **Admin**, la section **Gestion des rôles et accès** permet de :
- changer l'e-mail associé à un agent ;
- promouvoir ou rétrograder un agent ;
- conserver Excel comme source de référence.

## Exemple
- Fanny : `ADMIN`
- Chef de garde : `CHEF`
- Adjoint : `ADJOINT`
- Tous les autres : `AGENT`
