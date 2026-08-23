(function(){
"use strict";
const G = window.GARDES_CONFIG;
const P = window.GARDES_PROFILE;

const norm = value => String(value ?? "").trim().toUpperCase();
const dateOnly = value => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(String(value))) return String(value).slice(0,10);
  const d = new Date(value);
  if (Number.isNaN(d.valueOf())) return "";
  const local = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
};
const isoLocal = d => {
  const x = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return x.toISOString().slice(0,19);
};

function demoSlots() {
  const base = new Date();
  base.setHours(0,0,0,0);
  const slots = [];
  const blockHours = {
    "07h-13h":[7,8,9,10,11,12],
    "13h-19h":[13,14,15,16,17,18],
    "19h-00h":[19,20,21,22,23],
    "00h-05h":[0,1,2,3,4],
    "05h-07h":[5,6]
  };

  for (let dayOffset=0; dayOffset<8; dayOffset++) {
    const guardDay = new Date(base);
    guardDay.setDate(base.getDate()+dayOffset);

    for (const [block,hours] of Object.entries(blockHours)) {
      for (const hour of hours) {
        const real = new Date(guardDay);
        if (hour < 7) real.setDate(real.getDate()+1);
        real.setHours(hour,0,0,0);
        const id = `${dateOnly(real)}-${String(hour).padStart(2,"0")}:00`;
        slots.push({
          id, Title:id,
          CreneauId:id,
          DateGarde:dateOnly(guardDay),
          Date:dateOnly(real),
          HeureDebut:`${String(hour).padStart(2,"0")}:00`,
          HeureFin:`${String(hour).padStart(2,"0")}:59`,
          Bloc:block,
          Est0507:block==="05h-07h",
          Ordre:hour < 7 ? hour+24 : hour,
          Actif:true
        });
      }
    }
  }
  return slots;
}

function demoAssignments() {
  const d = dateOnly(new Date());
  const rows = [];
  const push = (Bloc,Piquet,Role,AgentCode,AgentNom,Partiel=false) =>
    rows.push({id:`${Bloc}-${Piquet}-${Role}`,DateGarde:d,Date:d,Bloc,Piquet,Role,AgentCode,AgentNom,Partiel,Gele:true,Publie:true});

  // Composition de démonstration proche de la feuille cible communiquée.
  [
    ["19h-00h","STAT INTERV","INTERV","MA","MATET Anatole"],
    ["19h-00h","VSAV","CA","MA","MATET Anatole"],
    ["19h-00h","VSAV","COND","AA","ANINAT Armand"],
    ["19h-00h","VSAV","EQ","BE","BOUCHE Eloïse"],
    ["19h-00h","VLSM","COND","GM","GALLIANO Mike"],
    ["19h-00h","VPF","CA","BD","BRAIL Davy"],
    ["19h-00h","VPF","COND","AA","ANINAT Armand"],
    ["19h-00h","FPT","CA","DJ","DEGORGUE Jonathan"],
    ["19h-00h","FPT","COND","BD","BRAIL Davy"],
    ["19h-00h","FPT","CE.1","GM","GALLIANO Mike"],
    ["19h-00h","FPT","CE.2","AA","ANINAT Armand"],
    ["19h-00h","FPT","EQ.1","MA","MATET Anatole"],
    ["19h-00h","FPT","EQ.2","BE","BOUCHE Eloïse"],
    ["19h-00h","EPSA","CA","BD","BRAIL Davy"],
    ["19h-00h","EPSA","COND","GM","GALLIANO Mike"],
    ["19h-00h","EPSA","EQ","MA","MATET Anatole"],
    ["19h-00h","VSRTU","CA","DJ","DEGORGUE Jonathan"],
    ["19h-00h","VSRTU","COND","GM","GALLIANO Mike"],
    ["19h-00h","VSRTU","EQ","MA","MATET Anatole"],
    ["19h-00h","CCF4-01","CA","BD","BRAIL Davy"],
    ["19h-00h","CCF4-01","COND","GM","GALLIANO Mike"],
    ["19h-00h","CCF4-01","EQ.1","AA","ANINAT Armand"],
    ["19h-00h","CCF4-01","EQ.2","MA","MATET Anatole"],
    ["19h-00h","CCF4-02","CA","DJ","DEGORGUE Jonathan"],
    ["19h-00h","CCF4-02","EQ.1","BE","BOUCHE Eloïse"],

    ["00h-05h","STAT INTERV","INTERV","MA","MATET Anatole"],
    ["00h-05h","VSAV","CA","MA","MATET Anatole"],
    ["00h-05h","VSAV","COND","AA","ANINAT Armand"],
    ["00h-05h","VSAV","EQ","MA","MATET Anatole"],
    ["00h-05h","VLSM","COND","BE","BOUCHE Eloïse"],
    ["00h-05h","VPF","CA","BD","BRAIL Davy"],
    ["00h-05h","VPF","COND","AA","ANINAT Armand"],
    ["00h-05h","FPT","CA","DJ","DEGORGUE Jonathan"],
    ["00h-05h","FPT","COND","BD","BRAIL Davy"],
    ["00h-05h","FPT","CE.1","AA","ANINAT Armand"],
    ["00h-05h","FPT","CE.2","GM","GALLIANO Mike"],
    ["00h-05h","FPT","EQ.1","BE","BOUCHE Eloïse"],
    ["00h-05h","FPT","EQ.2","MA","MATET Anatole"],
    ["00h-05h","EPSA","CA","BD","BRAIL Davy"],
    ["00h-05h","EPSA","COND","GM","GALLIANO Mike"],
    ["00h-05h","EPSA","EQ","BE","BOUCHE Eloïse"],
    ["00h-05h","VSRTU","CA","DJ","DEGORGUE Jonathan"],
    ["00h-05h","VSRTU","COND","GM","GALLIANO Mike"],
    ["00h-05h","VSRTU","EQ","BE","BOUCHE Eloïse"],
    ["00h-05h","CCF4-01","CA","DJ","DEGORGUE Jonathan"],
    ["00h-05h","CCF4-01","COND","GM","GALLIANO Mike"],
    ["00h-05h","CCF4-01","EQ.1","AA","ANINAT Armand"],
    ["00h-05h","CCF4-01","EQ.2","BE","BOUCHE Eloïse"],
    ["00h-05h","CCF4-02","CA","BD","BRAIL Davy"],
    ["00h-05h","CCF4-02","EQ.1","MA","MATET Anatole"],

    ["05h-07h","STAT INTERV","INTERV","MA","MATET Anatole"],
    ["05h-07h","VSAV","CA","MA","MATET Anatole"],
    ["05h-07h","VSAV","COND","AA","ANINAT Armand"],
    ["05h-07h","VLSM","COND","AA","ANINAT Armand"],
    ["05h-07h","FPT","CE.1","AA","ANINAT Armand"],
    ["05h-07h","FPT","EQ.1","MA","MATET Anatole"],
    ["05h-07h","CCF4-01","EQ.1","AA","ANINAT Armand"],
    ["05h-07h","CCF4-02","EQ.1","MA","MATET Anatole"]
  ].forEach(x => push(...x));

  return rows;
}

class DemoRepository {
  constructor() {
    this.storageKey = "gardes-v2-demo";
    this.state = JSON.parse(localStorage.getItem(this.storageKey) || "null") || {
      availability:{}, locks:{}, publications:[]
    };
  }
  persist(){ localStorage.setItem(this.storageKey, JSON.stringify(this.state)); }
  async init(){ return true; }
  async signIn(){ return {name:"Mode démonstration",email:"demo@local"}; }
  async signOut(){ return true; }
  async getCurrentUser(){ return {name:"Mode démonstration",email:"demo@local"}; }
  async getAgents(){ return P.demoAgents.map(x=>({...x,id:x.Code})); }
  async getSlots(){ return demoSlots(); }
  async getAssignments(){ return demoAssignments(); }
  async getPublications(){ return this.state.publications; }
  async getLocks(){ return Object.values(this.state.locks); }
  async getJournal(){ return []; }

  async getAvailability(agentCode){
    const map = this.state.availability[agentCode] || {};
    return Object.entries(map).map(([CreneauId,v])=>({id:CreneauId,AgentCode,CreneauId,...v}));
  }

  async getAllAvailability(){
    const out=[];
    for (const [agentCode,map] of Object.entries(this.state.availability)) {
      for (const [CreneauId,v] of Object.entries(map)) {
        out.push({id:CreneauId,AgentCode:agentCode,CreneauId,...v});
      }
    }
    return out;
  }

  async saveAvailability(payload){
    if(!this.state.availability[payload.AgentCode]) this.state.availability[payload.AgentCode]={};
    this.state.availability[payload.AgentCode][payload.CreneauId] = {
      ...payload, ModifiedAt:new Date().toISOString()
    };
    this.persist();
    return payload;
  }

  async setLock(scope,date,bloc,locked,userEmail){
    const k=`${scope}|${date}|${bloc}`;
    this.state.locks[k]={
      id:k,Title:k,Scope:scope,Date:date,Bloc:bloc,
      Locked:locked,LockedBy:userEmail||"",LockedAt:new Date().toISOString()
    };
    this.persist();
    return this.state.locks[k];
  }

  async publish(type,data,userEmail){
    const p={
      id:String(Date.now()),Title:`${type}-${Date.now()}`,Type:type,
      DateDebut:data.dateDebut||"",DateFin:data.dateFin||"",
      Version:String(Date.now()),DataJson:JSON.stringify(data),
      PublishedAt:new Date().toISOString(),PubliePar:userEmail||""
    };
    this.state.publications.unshift(p);
    this.persist();
    return p;
  }
}

class GraphRepository {
  constructor(){
    this.msalModule=null;
    this.msalApp=null;
    this.account=null;
    this.site=null;
    this.listIds={};
  }

  async init(){
    if(G.mode !== "m365") return;
    if(!G.microsoft365.clientId || G.microsoft365.clientId === "A_COMPLETER"){
      throw new Error("Le clientId Microsoft Entra n'est pas configuré.");
    }

    this.msalModule = await import(G.microsoft365.msalEsmFallback);
    const {PublicClientApplication} = this.msalModule;

    this.msalApp = new PublicClientApplication({
      auth:{
        clientId:G.microsoft365.clientId,
        authority:`https://login.microsoftonline.com/${G.microsoft365.tenantId}`,
        redirectUri:G.microsoft365.redirectUri,
        postLogoutRedirectUri:G.microsoft365.redirectUri
      },
      cache:{cacheLocation:"localStorage"}
    });

    await this.msalApp.initialize();
    const redirect = await this.msalApp.handleRedirectPromise();
    if(redirect?.account) this.msalApp.setActiveAccount(redirect.account);

    this.account =
      this.msalApp.getActiveAccount() ||
      this.msalApp.getAllAccounts()[0] ||
      null;

    if(this.account) this.msalApp.setActiveAccount(this.account);
  }

  async signIn(){
    if(!this.msalApp) await this.init();
    await this.msalApp.loginRedirect({scopes:G.microsoft365.scopes});
  }

  async signOut(){
    if(!this.msalApp || !this.account) return;
    await this.msalApp.logoutRedirect({account:this.account});
  }

  async token(){
    if(!this.account){
      this.account = this.msalApp.getActiveAccount() || this.msalApp.getAllAccounts()[0];
    }
    if(!this.account) throw new Error("Connexion Microsoft 365 requise.");

    try{
      const r=await this.msalApp.acquireTokenSilent({
        account:this.account,
        scopes:G.microsoft365.scopes
      });
      return r.accessToken;
    }catch(err){
      await this.msalApp.acquireTokenRedirect({
        account:this.account,
        scopes:G.microsoft365.scopes
      });
      throw new Error("Redirection vers Microsoft 365…");
    }
  }

  async graph(path, options={}){
    const token=await this.token();
    const response=await fetch(path.startsWith("https://") ? path : `https://graph.microsoft.com/v1.0${path}`,{
      method:options.method||"GET",
      headers:{
        Authorization:`Bearer ${token}`,
        Accept:"application/json",
        ...(options.body?{"Content-Type":"application/json"}:{}),
        ...(options.headers||{})
      },
      body:options.body ? JSON.stringify(options.body) : undefined
    });

    if(!response.ok){
      const detail=await response.text();
      throw new Error(`Microsoft Graph ${response.status} : ${detail.slice(0,800)}`);
    }
    if(response.status===204) return null;
    return response.json();
  }

  async graphPaged(path){
    let url=path;
    const all=[];
    while(url){
      const data=await this.graph(url);
      if(Array.isArray(data?.value)) all.push(...data.value);
      url=data?.["@odata.nextLink"]||"";
    }
    return all;
  }

  async getCurrentUser(){
    if(!this.account) return null;
    const me=await this.graph("/me?$select=displayName,mail,userPrincipalName");
    return {name:me.displayName,email:me.mail||me.userPrincipalName};
  }

  async resolveSite(){
    if(this.site) return this.site;
    const sp=G.sharePoint;
    this.site=await this.graph(`/sites/${sp.hostname}:${sp.sitePath}?$select=id,displayName,webUrl`);
    return this.site;
  }

  async listId(key){
    if(this.listIds[key]) return this.listIds[key];
    const site=await this.resolveSite();
    const lists=await this.graphPaged(`/sites/${site.id}/lists?$select=id,displayName`);
    const expected=G.sharePoint.lists[key];
    const found=lists.find(x=>norm(x.displayName)===norm(expected));
    if(!found) throw new Error(`Liste SharePoint introuvable : ${expected}`);
    this.listIds[key]=found.id;
    return found.id;
  }

  async listItems(key){
    const site=await this.resolveSite();
    const listId=await this.listId(key);
    const items=await this.graphPaged(`/sites/${site.id}/lists/${listId}/items?$expand=fields&$top=999`);
    return items.map(x=>({id:x.id,...(x.fields||{})}));
  }

  async createItem(key,fields){
    const site=await this.resolveSite();
    const listId=await this.listId(key);
    const item=await this.graph(`/sites/${site.id}/lists/${listId}/items`,{
      method:"POST",body:{fields}
    });
    return {id:item.id,...(item.fields||{})};
  }

  async updateItem(key,id,fields){
    const site=await this.resolveSite();
    const listId=await this.listId(key);
    await this.graph(`/sites/${site.id}/lists/${listId}/items/${id}/fields`,{
      method:"PATCH",body:fields
    });
    return true;
  }

  async getAgents(){ return this.listItems("agents"); }
  async getSlots(){ return this.listItems("slots"); }
  async getAssignments(){ return this.listItems("assignments"); }
  async getPublications(){ return this.listItems("publications"); }
  async getLocks(){ return this.listItems("locks"); }
  async getJournal(){ return this.listItems("journal"); }

  async getAvailability(agentCode){
    const rows=await this.listItems("availability");
    return rows.filter(x=>norm(x.AgentCode)===norm(agentCode));
  }

  async getAllAvailability(){
    return this.listItems("availability");
  }

  async saveAvailability(payload){
    const rows=await this.listItems("availability");
    const existing=rows.find(x =>
      norm(x.AgentCode)===norm(payload.AgentCode) &&
      String(x.CreneauId||"")===String(payload.CreneauId)
    );

    const fields={
      Title:`${payload.AgentCode}|${payload.CreneauId}`,
      AgentCode:payload.AgentCode,
      AgentNom:payload.AgentNom||"",
      CreneauId:String(payload.CreneauId),
      DateGarde:payload.DateGarde||"",
      Date:payload.Date||"",
      HeureDebut:payload.HeureDebut||"",
      Valeur:payload.Valeur||"",
      RemplacantCode:payload.RemplacantCode||"",
      RemplacantNom:payload.RemplacantNom||"",
      Source:"APPLICATION",
      ModifiedAt:new Date().toISOString()
    };

    if(existing){
      await this.updateItem("availability",existing.id,fields);
      return {id:existing.id,...fields};
    }
    return this.createItem("availability",fields);
  }

  async setLock(scope,date,bloc,locked,userEmail){
    const rows=await this.getLocks();
    const existing=rows.find(x =>
      norm(x.Scope)===norm(scope) &&
      dateOnly(x.Date)===date &&
      norm(x.Bloc)===norm(bloc)
    );
    const fields={
      Title:`${scope}|${date}|${bloc}`,
      Scope:scope,Date:date,Bloc:bloc,Locked:!!locked,
      LockedBy:userEmail||"",LockedAt:new Date().toISOString()
    };
    if(existing){
      await this.updateItem("locks",existing.id,fields);
      return {id:existing.id,...fields};
    }
    return this.createItem("locks",fields);
  }

  async publish(type,data,userEmail){
    return this.createItem("publications",{
      Title:`${type}|${Date.now()}`,
      Type:type,
      DateDebut:data.dateDebut||"",
      DateFin:data.dateFin||"",
      Version:String(Date.now()),
      DataJson:JSON.stringify(data),
      PublishedAt:new Date().toISOString(),
      PubliePar:userEmail||""
    });
  }
}

window.GardesRepositories={DemoRepository,GraphRepository,dateOnly,isoLocal,norm};
})();
