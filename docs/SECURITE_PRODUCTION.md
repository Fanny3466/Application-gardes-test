# Sécurité et exploitation

## Ce qui est public dans GitHub Pages
- code HTML/CSS/JavaScript ;
- Tenant ID ;
- Client ID de la SPA ;
- driveId / itemId.

Ces valeurs ne sont pas des mots de passe.

## Ce qui ne doit jamais être publié
- client secret ;
- mot de passe ;
- jeton d'accès ;
- cookie Microsoft ;
- lien de partage permissif du fichier.

`setup.html` transforme le lien de partage en identifiants de fichier, puis le fichier de configuration final ne conserve pas le lien.

## Autorisation réelle
Le contrôle de sécurité principal reste Microsoft 365 :
- authentification Entra ;
- permissions SharePoint / OneDrive sur le fichier.

L'interface applique en plus une association `Email` → agent, mais elle ne remplace pas les droits Microsoft 365.

## Excel Desktop
Le moteur VBA ne s'exécute que si le classeur est ouvert dans Excel Desktop.
La fréquence de production recommandée par le kit est 1 minute.
