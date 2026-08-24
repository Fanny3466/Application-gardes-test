# Correctif dates Excel V2.3.4

Erreur corrigée : `date value is not finite in DateTimeFormat.format()`.

Microsoft Graph peut renvoyer les dates Excel sous plusieurs formes :
- `yyyy-mm-dd`
- `dd/mm/yyyy`
- numéro de série Excel

V2.3.4 normalise ces trois formats avant tout appel à `Intl.DateTimeFormat`.
Les écrans Disponibilités, Garde, Chef/Adjoint, publication et diagnostic sont protégés.

Aucun changement du module VBA V1.3 n'est requis.
