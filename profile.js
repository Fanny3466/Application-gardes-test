window.GARDES_PROFILE = {
  blockOrder: ["07h-13h","13h-19h","19h-00h","00h-05h","05h-07h"],

  unavailableValues: [
    "0","FAUX","FALSE","NON","INDISPO","ABS","TRAVAIL","FORMATION",
    "ECOLE","ÉCOLE","REPOS","GFF","GRR","COND CDG","STAT CIE",
    "VACANCES","MALADIE"
  ],

  statusCatalog: [
    {value:"DISPO", label:"Disponible", icon:"✓", className:"ok"},
    {value:"INDISPO", label:"Indisponible", icon:"×", className:"no"},
    {value:"TRAVAIL", label:"Travail", icon:"💼", className:"busy"},
    {value:"FORMATION", label:"Formation", icon:"🎓", className:"busy"},
    {value:"ÉCOLE", label:"École", icon:"📚", className:"busy"},
    {value:"GFF", label:"GFF", icon:"🔥", className:"special"},
    {value:"GRR", label:"GRR", icon:"🚒", className:"special"},
    {value:"COND CdG", label:"COND CdG", icon:"🚗", className:"special"},
    {value:"STAT CIE", label:"STAT CIE", icon:"📡", className:"special"},
    {value:"VACANCES", label:"Vacances", icon:"🏖️", className:"busy"},
    {value:"MALADIE", label:"Maladie", icon:"🩺", className:"busy"},
    {value:"REMPLACANT", label:"Remplaçant", icon:"🔁", className:"replacement"}
  ],

  guardStructure: [
    {vehicle:"STAT INTERV", key:"STAT", roles:["INTERV"], color:"#CADDEF"},
    {vehicle:"VSAV", key:"VSAV", roles:["CA","COND","EQ"], color:"#FFF200"},
    {vehicle:"VLSM", key:"VLSM", roles:["COND"], color:"#4C93CC"},
    {vehicle:"VPF", key:"VPF", roles:["CA","COND"], color:"#F59A43"},
    {vehicle:"VLTT", key:"VLTT", roles:["COND"], color:"#8E70AA"},
    {vehicle:"FPT", key:"FPT", roles:["CA","COND","CE.1","CE.2","EQ.1","EQ.2"], color:"#BFD68D"},
    {vehicle:"EPSA", key:"EPSA", roles:["CA","COND","EQ"], color:"#CBC19B"},
    {vehicle:"VSRTU", key:"VSRTU", roles:["CA","COND","EQ"], color:"#55DEE8"},
    {vehicle:"CCF4-01", key:"CCF4-01", roles:["CA","COND","EQ.1","EQ.2"], color:"#8ED447"},
    {vehicle:"CCF4-02", key:"CCF4-02", roles:["CA","COND","EQ.1","EQ.2"], color:"#D8EEF5"},
    {vehicle:"CPCE", key:"CPCE", roles:["CA","COND"], color:"#FFF8C6"}
  ],

  demoAgents: [
    {Code:"BC", Title:"BEVILACQUA Christophe", Equipe:"GARDE 3", Fonctions:"CATE / CA / CE / EQ / COND", Competences:"PL", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"CD", Title:"CAMBRIELS Denis", Equipe:"GARDE 3", Fonctions:"CATE / CA / CE / EQ / COND_VL", Competences:"", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"BD", Title:"BRAIL Davy", Equipe:"GARDE 3", Fonctions:"CA / CE / EQ / COND", Competences:"PL", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"CFa", Title:"CHOULET Fanny", Equipe:"GARDE 3", Fonctions:"CA / CE / EQ / COND_VL", Competences:"", Restrictions:"", Email:"", Role:"ADMIN", Actif:true},
    {Code:"OK", Title:"OUMIRA Kévin", Equipe:"GARDE 3", Fonctions:"CE / EQ / COND", Competences:"PL", Restrictions:"PAS COD_2", Email:"", Role:"AGENT", Actif:true},
    {Code:"MA", Title:"MATET Anatole", Equipe:"GARDE 3", Fonctions:"EQ", Competences:"", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"SÉ", Title:"SABLIER Éléa", Equipe:"GARDE 3", Fonctions:"EQ_VSAV / EQ_STAG", Competences:"", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"AA", Title:"ANINAT Armand", Equipe:"GARDE 3", Fonctions:"CE / EQ / COND_VL", Competences:"", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"BE", Title:"BOUCHE Eloïse", Equipe:"GARDE 3", Fonctions:"EQ", Competences:"", Restrictions:"", Email:"", Role:"AGENT", Actif:true},
    {Code:"GM", Title:"GALLIANO Mike", Equipe:"GARDE 3", Fonctions:"CE / EQ / COND", Competences:"PL / CCF", Restrictions:"", Email:"", Role:"ADJOINT", Actif:true},
    {Code:"DJ", Title:"DEGORGUE Jonathan", Equipe:"GARDE 3", Fonctions:"CA / CE / EQ / COND", Competences:"", Restrictions:"", Email:"", Role:"CHEF", Actif:true}
  ]
};