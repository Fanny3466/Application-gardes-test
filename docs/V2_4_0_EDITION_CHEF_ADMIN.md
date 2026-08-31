# V2.4.0 — Edition CHEF / ADMIN

## Disponibilités
Les rôles CHEF et ADMIN peuvent :
- sélectionner n'importe quel agent dans l'écran Dispos ;
- modifier ses créneaux ;
- toucher directement une cellule de la matrice Chef.

Les modifications utilisent la même file `tblApp_Saisies` que les saisies des agents.

## Affectations
Dans la page Garde, chaque piquet devient une liste déroulante pour CHEF / ADMIN.
La modification crée une commande `MODIFIER_AFFECTATION` dans `tblApp_Commandes`.

Le VBA V1.6 :
1. effectue d'abord les imports de disponibilités ;
2. lance éventuellement le moteur de remplissage ;
3. applique ensuite les corrections manuelles d'affectation ;
4. réexporte `tblApp_Affectations`.

Ainsi une correction manuelle n'est pas écrasée par le recalcul du même cycle.

## Compteur "en attente"
L'ancienne version comptait aussi les lignes `IMPORTE`, d'où un compteur non nul après synchronisation.
V2.4.0 ne compte plus que :
- `A_IMPORTER` / `EN_ATTENTE` dans `tblApp_Saisies`;
- `A_TRAITER` dans `tblApp_Commandes`;
- `A_APPLIQUER` dans `tblApp_Verrous`.

Les erreurs sont affichées séparément.
