# Schéma SharePoint V2

Les noms de listes restent compatibles avec le module VBA de synchronisation.

## Agents

Colonnes :
- `Title` — texte — nom complet
- `Code` — texte
- `Equipe` — texte
- `Competences` — texte multiligne
- `Fonctions` — texte multiligne
- `Restrictions` — texte multiligne
- `Email` — texte
- `Role` — choix : AGENT / CHEF / ADJOINT / ADMIN
- `Actif` — oui/non

## Creneaux

- `Title`
- `CreneauId` — texte, clé recommandée
- `DateGarde` — date
- `Date` — date
- `HeureDebut` — texte
- `HeureFin` — texte
- `Bloc` — texte
- `Est0507` — oui/non
- `Ordre` — nombre
- `Actif` — oui/non

## Disponibilites

- `Title`
- `AgentCode`
- `AgentNom`
- `CreneauId`
- `DateGarde`
- `Date`
- `HeureDebut`
- `Valeur`
- `RemplacantCode`
- `RemplacantNom`
- `Source`
- `ModifiedAt`

Le module VBA V1 peut importer ces champs via le flux Power Automate TSV.

## Affectations

- `Title`
- `DateGarde`
- `Date` — facultatif
- `Bloc`
- `Piquet`
- `Role`
- `AgentCode`
- `AgentNom`
- `Partiel`
- `Gele`
- `Publie`
- `Ordre`

## Verrous

- `Title`
- `Scope`
- `Date`
- `Bloc`
- `Locked`
- `LockedBy`
- `LockedAt`

## Publications

- `Title`
- `Type`
- `DateDebut`
- `DateFin`
- `Version`
- `DataJson`
- `PublishedAt`
- `PubliePar`

## Journal

- `Title`
- `Action`
- `UserEmail`
- `Entity`
- `Timestamp`
