/*
 * CONFIGURATION DE PRODUCTION
 * ---------------------------
 * Ce fichier est volontairement livré non configuré.
 * Utilise setup.html pour générer automatiquement les identifiants driveId/itemId
 * après authentification Microsoft 365 et test du classeur.
 *
 * IMPORTANT :
 * - aucun clientSecret ne doit être ajouté ici ;
 * - tenantId et clientId d'une SPA ne sont pas des secrets ;
 * - le lien de partage du classeur n'est pas conservé dans la configuration finale.
 */
window.GARDES_PRODUCTION = {
  configured: false,

  tenantId: "",
  clientId: "",

  driveId: "",
  itemId: "",
  workbookName: "",

  // Le compte qui effectue la mise en production est ajouté ici par setup.html.
  adminEmails: [],

  // Pour ce classeur, le code proposé pour l'administratrice initiale est CFa.
  bootstrapAdminAgentCode: "CFa",

  maxExcelSyncAgeMinutes: 5
};
