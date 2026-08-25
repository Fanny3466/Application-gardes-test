# Protection et commercialisation - Application Gardes

Cette notice accompagne la V2.5.1. Elle ne constitue pas un avis juridique personnalisé.

## Mentions minimales à conserver

- `© 2026 Application Gardes - Tous droits réservés`
- `Logiciel propriétaire - utilisation soumise à licence`
- identifiant de licence / client / durée dans l'instance commerciale ;
- titulaire juridique des droits une fois celui-ci vérifié ;
- version de l'application, du VBA et du worker Cloud.

## Vérification préalable de titularité

Avant toute commercialisation, vérifier si l'article L113-9 du Code de la propriété
intellectuelle est susceptible de s'appliquer : les droits patrimoniaux sur un logiciel
et sa documentation créés par un employé dans l'exercice de ses fonctions ou selon
les instructions de l'employeur peuvent être dévolus à l'employeur ; la règle vise
également certains agents publics.

Source :
https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000039279818

## Protection recommandée

1. Conserver les sources et historiques de versions.
2. Déposer une preuve datée e-Soleau INPI.
3. Envisager un dépôt spécialisé de logiciel / code source.
4. Étudier une marque distinctive pour le nom commercial.
5. Ne parler de brevet que si une véritable invention technique brevetable existe.
6. Utiliser une licence client non exclusive, non transférable et limitée en durée/périmètre.
7. Faire signer des engagements de confidentialité aux prestataires ayant accès aux sources.
8. Sortir progressivement les règles propriétaires les plus sensibles du JavaScript/VBA distribué
   vers un moteur Cloud contrôlé par l'éditeur.
9. Prévoir un serveur de licences pour une version commerciale SaaS.

Sources INPI :
https://www.inpi.fr/ressources/propriete-intellectuelle/droit-dauteur
https://www.inpi.fr/realiser-demarches/propriete-intellectuelle/deposer-une-e-soleau-ou-un-entiercement
https://www.inpi.fr/realiser-demarches/propriete-intellectuelle/cas-particulier-logiciels

## Contrat de licence

Le contrat doit notamment préciser :
- client et entité licenciée ;
- centre(s) / utilisateurs autorisés ;
- durée et renouvellement ;
- prix : installation, abonnement, maintenance, support, développement spécifique ;
- droits concédés et droits réservés ;
- copie de sauvegarde et réversibilité ;
- mises à jour et compatibilité Microsoft 365 ;
- SLA / maintenance / support ;
- confidentialité ;
- propriété des développements spécifiques ;
- conditions de fin de contrat ;
- responsabilité et limites ;
- droit applicable et juridiction ;
- RGPD et traitement des données.

## RGPD

Si l'éditeur traite les données pour le compte du SDIS, le contrat doit déterminer
les rôles responsable de traitement / sous-traitant et intégrer les exigences de
l'article 28 du RGPD : finalités, durée, sécurité, confidentialité, sous-traitants
ultérieurs, assistance, incidents, restitution ou suppression.

Sources CNIL :
https://www.cnil.fr/fr/sous-traitant
https://www.cnil.fr/fr/securite-gerer-la-sous-traitance

## Continuité opérationnelle

Le contrat et l'application doivent indiquer que l'outil est un système de planification
et de gestion des disponibilités. Tant qu'il n'a pas été contractuellement qualifié comme
système critique, il ne remplace pas les systèmes officiels d'alerte, de mobilisation,
de commandement ou de gestion opérationnelle du SDIS.
