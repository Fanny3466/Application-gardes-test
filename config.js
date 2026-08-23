window.GARDES_CONFIG = {
  version: "2.0.0",
  appName: "Application Gardes",
  environment: "TEST",

  /*
   * "demo" = immédiatement testable sur GitHub Pages.
   * "m365" = Microsoft Entra + Microsoft Graph + SharePoint Lists.
   */
  mode: "demo",

  publicUrl: "https://fanny3466.github.io/Application-gardes-test/",

  microsoft365: {
    tenantId: "A_COMPLETER",
    clientId: "A_COMPLETER",
    redirectUri: "https://fanny3466.github.io/Application-gardes-test/",
    scopes: ["User.Read", "Sites.ReadWrite.All"],

    /*
     * MSAL Browser v5 est chargé dynamiquement uniquement en mode m365.
     * Pour un déploiement de production, voir docs/CONFIGURATION_MICROSOFT_365.md :
     * Microsoft recommande désormais de bundler @azure/msal-browser avec npm.
     */
    msalEsmFallback:
      "https://cdn.jsdelivr.net/npm/@azure/msal-browser@5.17.3/+esm"
  },

  sharePoint: {
    hostname: "A_COMPLETER.sharepoint.com",
    sitePath: "/sites/A_COMPLETER",
    lists: {
      agents: "Agents",
      slots: "Creneaux",
      availability: "Disponibilites",
      assignments: "Affectations",
      locks: "Verrous",
      publications: "Publications",
      journal: "Journal"
    }
  },

  // Autorisations supplémentaires si la colonne Role n'est pas encore créée.
  roles: {
    chefAdjointEmails: [],
    adminEmails: []
  },

  ui: {
    defaultTeam: "GARDE 3",
    allowDemoRoleSwitch: true,
    showInstallHelpInBrowser: true,
    availabilityDefaultBlock: "19h-00h",
    autoSelectAgentFromEmail: true,
    hideAgentSelectorForMatchedM365User: true,
    showEmptyGuardRoles: true
  }
};