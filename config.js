(function(){
"use strict";
const PROD = window.GARDES_PRODUCTION || {};

window.GARDES_CONFIG = {
  version: "2.3.2",
  appName: "Application Gardes",
  environment: "PRODUCTION",
  mode: "excel-direct",
  publicUrl: "https://fanny3466.github.io/Application-gardes-test/",

  productionReady:
    PROD.configured === true &&
    !!PROD.tenantId &&
    !!PROD.clientId &&
    !!PROD.driveId &&
    !!PROD.itemId,

  microsoft365: {
    tenantId: PROD.tenantId || "",
    clientId: PROD.clientId || "",
    redirectUri: "https://fanny3466.github.io/Application-gardes-test/",
    scopes: ["User.Read", "Files.ReadWrite"],
    msalEsmFallback:
      "https://cdn.jsdelivr.net/npm/@azure/msal-browser@5.17.3/+esm"
  },

  excelDirect: {
    driveId: PROD.driveId || "",
    itemId: PROD.itemId || "",
    workbookName: PROD.workbookName || "",

    tables: {
      agents: "tblApp_Agents",
      slots: "tblApp_Creneaux",
      availability: "tblApp_Disponibilites",
      submissions: "tblApp_Saisies",
      assignments: "tblApp_Affectations",
      locks: "tblApp_Verrous",
      publications: "tblApp_Publications",
      commands: "tblApp_Commandes",
      journal: "tblApp_Journal"
    },

    maxExcelSyncAgeMinutes: Number(PROD.maxExcelSyncAgeMinutes || 5),
    maxRetries: 4
  },

  roles: {
    chefAdjointEmails: [],
    adminEmails: Array.isArray(PROD.adminEmails) ? PROD.adminEmails : []
  },

  bootstrap: {
    adminAgentCode: PROD.bootstrapAdminAgentCode || ""
  },

  ui: {
    defaultTeam: "GARDE 3",
    showInstallHelpInBrowser: true,
    availabilityDefaultBlock: "19h-00h",
    autoSelectAgentFromEmail: true,
    hideAgentSelectorForMatchedM365User: true,
    showEmptyGuardRoles: true,
    allowAdminEditAgents: false
  }
};
})();
