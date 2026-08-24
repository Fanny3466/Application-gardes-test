# Recette de production

Avant de donner l'application aux agents :

1. `Diagnostiquer_Tables_Disponibilites_Application`
   - 7 tables actives ;
   - tableau ligne 181 ignoré.

2. `Diagnostiquer_Production_Excel_Direct`
   - toutes les tables présentes ;
   - aucune saisie en erreur ;
   - au moins le compte administrateur possède un e-mail.

3. `setup.html`
   - authentification OK ;
   - fichier Excel OK ;
   - session Workbook OK ;
   - 9 tables OK ;
   - association administrateur OK.

4. Test agent
   - saisir une heure depuis l'iPhone ;
   - vérifier une ligne `A_IMPORTER` dans `tblApp_Saisies` ;
   - attendre le cycle Excel ;
   - vérifier `IMPORTE` ;
   - vérifier la cellule dans `Demande dispo`.

5. Test calcul
   - vérifier que `Remplir_Feuille_Gardes_En_W` s'exécute ;
   - vérifier `Mois complet (Diffusion)` ;
   - actualiser l'app ;
   - vérifier la feuille de garde.

6. Test Chef / Adjoint
   - verrouillage ;
   - publication ;
   - lecture côté agent.

7. Test cache iPhone
   - fermer / rouvrir la PWA ;
   - actualiser ;
   - vérifier V2.2.0 et PRODUCTION.
