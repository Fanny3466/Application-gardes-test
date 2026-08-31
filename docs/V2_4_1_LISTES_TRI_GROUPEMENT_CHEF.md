# V2.4.1 — Correctifs Garde et écran Chef

## 1. Affectations de la page Garde
Certaines lignes exportées depuis Excel avaient `AgentNom` renseigné mais `AgentCode` vide.
La V2.4.0 appliquait ensuite `select.value = ""`, ce qui donnait visuellement des listes vides.

V2.4.1 :
- retrouve l'agent par `AgentCode` si disponible ;
- sinon retrouve automatiquement son code à partir de `AgentNom` ;
- conserve un nom non référencé au lieu d'afficher une case vide.

## 2. Tri alphabétique
Toutes les listes d'agents concernées sont triées par nom croissant :
- sélection d'agent ;
- affectations véhicules ;
- choix d'un remplaçant ;
- écran Chef.

## 3. Écran Chef
Pour la journée sélectionnée, les agents sont divisés en deux groupes :

1. `Disponibilités renseignées`
2. `Sans disponibilité renseignée`

Le critère porte sur toute la journée, pas uniquement sur la tranche affichée.

Dès qu'un CHEF ou ADMIN renseigne une disponibilité à un agent du second groupe,
`renderChef()` est recalculé et l'agent remonte automatiquement dans le premier groupe.

Les potentiels opérationnels continuent de compter uniquement les agents
réellement disponibles sur chaque heure.
