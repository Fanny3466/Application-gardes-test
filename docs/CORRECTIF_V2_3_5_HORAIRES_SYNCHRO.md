# Correctif V2.3.5 — horaires et synchronisation

- Les heures Excel numériques sont converties en `HH:mm` avant affichage et avant écriture dans `tblApp_Saisies`.
- `0,791666667` devient `19:00`; `0,832638889` devient `19:59`.
- Le module VBA V1.4 accepte aussi les anciennes valeurs numériques déjà présentes.
- Les lignes `ERREUR` dues à `HeureDebut invalide` sont retentées automatiquement.
- La planification `Application.OnTime` est désarmée avant chaque nouveau réarmement afin d'éviter les doublons.
- Les boutons Application du tableau de contrôle sont recréés avec un `OnAction` qualifié par le nom du classeur.

**Important :** le ZIP GitHub n'inclut pas `production-config.js`. Conserve celui qui est actuellement déployé et fonctionnel.
