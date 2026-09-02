(function(){
"use strict";
const G = window.GARDES_CONFIG;
const P = window.GARDES_PROFILE;

const norm = value => String(value ?? "").trim().toUpperCase();
const dateOnly = value => {
  if (value === null || value === undefined || value === "") return "";

  if (value instanceof Date) {
    if (!Number.isFinite(value.valueOf())) return "";
    const local = new Date(value.getTime() - value.getTimezoneOffset()*60000);
    return local.toISOString().slice(0,10);
  }

  const raw=String(value).trim();
  if(!raw) return "";

  let m=raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if(m) return `${m[1]}-${m[2]}-${m[3]}`;

  m=raw.match(/^(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})$/);
  if(m){
    const y=Number(m[3])<100 ? 2000+Number(m[3]) : Number(m[3]);
    const mo=Number(m[2]), day=Number(m[1]);
    if(y>=1900 && mo>=1 && mo<=12 && day>=1 && day<=31){
      return `${String(y).padStart(4,"0")}-${String(mo).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    }
  }

  // Microsoft Graph peut renvoyer une date Excel comme numéro de série.
  const n=Number(raw.replace(",","."));
  if(Number.isFinite(n) && n>=1 && n<1000000){
    const d=new Date(Date.UTC(1899,11,30) + Math.floor(n)*86400000);
    if(Number.isFinite(d.valueOf())) return d.toISOString().slice(0,10);
  }

  const d=new Date(raw);
  if(!Number.isFinite(d.valueOf())) return "";
  const local=new Date(d.getTime()-d.getTimezoneOffset()*60000);
  return local.toISOString().slice(0,10);
};
const isoLocal = d => {
  const x = new Date(d.getTime() - d.getTimezoneOffset()*60000);
  return x.toISOString().slice(0,19);
};
const timeOnly = value => {
  if(value===null || value===undefined || value==="") return "";
  if(value instanceof Date && Number.isFinite(value.valueOf())){
    return `${String(value.getHours()).padStart(2,"0")}:${String(value.getMinutes()).padStart(2,"0")}`;
  }

  const raw=String(value).trim();
  if(!raw) return "";

  let m=raw.match(/^(\d{1,2})[:hH](\d{2})/);
  if(m){
    const h=Number(m[1]), min=Number(m[2]);
    if(h>=0 && h<=23 && min>=0 && min<=59){
      return `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
    }
  }

  m=raw.match(/^(\d{1,2})[hH]?$/);
  if(m){
    const h=Number(m[1]);
    if(h>=0 && h<=23) return `${String(h).padStart(2,"0")}:00`;
  }

  // Excel/Graph renvoie les heures comme fractions de journée.
  const n=Number(raw.replace(",","."));
  if(Number.isFinite(n)){
    let totalMinutes;
    if(Number.isInteger(n) && n>=0 && n<=23){
      totalMinutes=n*60;
    }else{
      const fraction=((n%1)+1)%1;
      totalMinutes=Math.round(fraction*1440)%1440;
    }
    const h=Math.floor(totalMinutes/60)%24;
    const min=totalMinutes%60;
    return `${String(h).padStart(2,"0")}:${String(min).padStart(2,"0")}`;
  }

  return raw.slice(0,5);
};


const timestampMs = value => {
  if(value===null || value===undefined || value==="") return 0;

  if(typeof value==="number" && Number.isFinite(value)){
    // Excel sérialise les dates comme une heure murale locale.
    // Les composantes UTC servent ici à reconstruire exactement cette heure
    // dans le fuseau du téléphone/navigateur (France dans le projet actuel).
    const wall=new Date(Date.UTC(1899,11,30)+value*86400000);
    const local=new Date(
      wall.getUTCFullYear(),
      wall.getUTCMonth(),
      wall.getUTCDate(),
      wall.getUTCHours(),
      wall.getUTCMinutes(),
      wall.getUTCSeconds(),
      wall.getUTCMilliseconds()
    );
    return Number.isFinite(local.valueOf()) ? local.valueOf() : 0;
  }

  const raw=String(value).trim();
  if(!raw) return 0;

  const d=new Date(raw);
  if(Number.isFinite(d.valueOf())) return d.valueOf();

  const n=Number(raw.replace(",","."));
  if(Number.isFinite(n) && n>=1 && n<1000000){
    return timestampMs(n);
  }

  return 0;
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

  async saveAgentAccess(agentCode,payload){
    const agent=P.demoAgents.find(a=>norm(a.Code)===norm(agentCode));
    if(agent){
      if(Object.prototype.hasOwnProperty.call(payload,"Email")) agent.Email=payload.Email||"";
      if(Object.prototype.hasOwnProperty.call(payload,"Role")) agent.Role=payload.Role||"AGENT";
      if(Object.prototype.hasOwnProperty.call(payload,"Actif")) agent.Actif=payload.Actif;
    }
    return agent||null;
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

  async saveAgentAccess(){
    throw new Error("Gestion des rôles disponible uniquement en mode Excel Direct.");
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
      HeureDebut:timeOnly(payload.HeureDebut),
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


class ExcelDirectRepository {
  constructor(){
    this.msalModule=null;
    this.msalApp=null;
    this.account=null;
    this.driveId="";
    this.itemId="";
    this.sessionId="";
    this.tableCache=new Map();
    this.lastHealth=null;
  }

  configOk(){
    const m=G.microsoft365||{};
    const x=G.excelDirect||{};
    return !!(G.productionReady && m.tenantId && m.clientId && x.driveId && x.itemId);
  }

  async init(){
    if(!this.configOk()){
      throw new Error("CONFIGURATION_PRODUCTION_INCOMPLETE");
    }

    const m=G.microsoft365;
    this.driveId=G.excelDirect.driveId;
    this.itemId=G.excelDirect.itemId;

    this.msalModule=await import(m.msalEsmFallback);
    const {PublicClientApplication}=this.msalModule;

    this.msalApp=new PublicClientApplication({
      auth:{
        clientId:m.clientId,
        authority:`https://login.microsoftonline.com/${m.tenantId}`,
        redirectUri:m.redirectUri,
        postLogoutRedirectUri:m.redirectUri
      },
      cache:{cacheLocation:"localStorage"}
    });

    await this.msalApp.initialize();
    const redirect=await this.msalApp.handleRedirectPromise();

    if(redirect?.account){
      this.msalApp.setActiveAccount(redirect.account);
    }

    this.account=
      this.msalApp.getActiveAccount() ||
      this.msalApp.getAllAccounts()[0] ||
      null;

    if(this.account){
      this.msalApp.setActiveAccount(this.account);
      await this.ensureSession();
    }
  }

  async signIn(){
    if(!this.msalApp) await this.init();
    await this.msalApp.loginRedirect({
      scopes:G.microsoft365.scopes,
      prompt:"select_account"
    });
  }

  async signOut(){
    if(!this.msalApp || !this.account) return;
    await this.msalApp.logoutRedirect({
      account:this.account,
      postLogoutRedirectUri:G.microsoft365.redirectUri
    });
  }

  async token(){
    if(!this.account){
      this.account=this.msalApp?.getActiveAccount() || this.msalApp?.getAllAccounts()?.[0] || null;
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

  sleep(ms){ return new Promise(resolve=>setTimeout(resolve,ms)); }

  async graph(path,options={}){
    const maxRetries=Number(G.excelDirect.maxRetries||4);
    let lastError=null;

    for(let attempt=0;attempt<=maxRetries;attempt++){
      const token=await this.token();

      let response;
      try{
        response=await fetch(
          path.startsWith("https://") ? path : `https://graph.microsoft.com/v1.0${path}`,
          {
            method:options.method||"GET",
            headers:{
              Authorization:`Bearer ${token}`,
              Accept:"application/json",
              ...(options.body?{"Content-Type":"application/json"}:{}),
              ...(options.session && this.sessionId ? {"Workbook-Session-Id":this.sessionId}:{}),
              ...(options.headers||{})
            },
            body:options.body ? JSON.stringify(options.body) : undefined,
            cache:"no-store"
          }
        );
      }catch(networkErr){
        lastError=networkErr;
        if(attempt<maxRetries){
          await this.sleep(700*Math.pow(2,attempt));
          continue;
        }
        throw networkErr;
      }

      if(response.ok){
        if(response.status===204) return null;
        const ct=response.headers.get("content-type")||"";
        return ct.includes("application/json") ? response.json() : response.text();
      }

      const detail=await response.text();
      const err=new Error(`Microsoft Graph ${response.status} : ${detail.slice(0,1200)}`);
      err.status=response.status;
      err.detail=detail;
      lastError=err;

      // Throttling / indisponibilité temporaire / timeout Graph.
      if([429,502,503,504].includes(response.status) && attempt<maxRetries){
        const retryAfter=Number(response.headers.get("Retry-After")||0);
        await this.sleep(retryAfter>0 ? retryAfter*1000 : 800*Math.pow(2,attempt));
        continue;
      }

      throw err;
    }

    throw lastError || new Error("Erreur Microsoft Graph.");
  }

  encodeDrivePath(path){
    return String(path||"").split("/").filter(Boolean).map(encodeURIComponent).join("/");
  }

  async graphRaw(path,{method="GET",body=null,headers={}}={}){
    const token=await this.token();
    const response=await fetch(
      path.startsWith("https://") ? path : `https://graph.microsoft.com/v1.0${path}`,
      {
        method,
        headers:{Authorization:`Bearer ${token}`,Accept:"application/json",...headers},
        body,
        cache:"no-store"
      }
    );
    if(!response.ok){
      const detail=await response.text();
      throw new Error(`Microsoft Graph ${response.status} : ${detail.slice(0,1200)}`);
    }
    if(response.status===204) return null;
    const ct=response.headers.get("content-type")||"";
    return ct.includes("application/json") ? response.json() : response.text();
  }

  sidecarInboxPath(){
    return String(G.sidecar?.inboxPath||"ApplicationGardesSidecar/Inbox").replace(/^\/+|\/+$/g,"");
  }

  localSidecarKey(){ return "ApplicationGardes.SidecarPending.V3"; }

  loadLocalSidecarEvents(){
    try{
      const v=JSON.parse(localStorage.getItem(this.localSidecarKey())||"[]");
      const min=Date.now()-24*60*60*1000;
      return Array.isArray(v) ? v.filter(e=>new Date(e.createdAtUtc||0).valueOf()>=min) : [];
    }catch{return [];}
  }

  storeLocalSidecarEvent(evt){
    const items=this.loadLocalSidecarEvents();
    items.push(evt);
    try{localStorage.setItem(this.localSidecarKey(),JSON.stringify(items.slice(-300)));}catch{}
  }

  async writeSidecarEvent(type,payload){
    const eventId=`EVT-${Date.now()}-${Math.random().toString(16).slice(2,10)}`;
    const evt={
      schemaVersion:3,
      eventId,
      type,
      createdAtUtc:new Date().toISOString(),
      createdBy:this.account?.username||"",
      source:"APPLICATION",
      payload:{...(payload||{})}
    };
    const filename=`${eventId}.json`;
    const path=this.encodeDrivePath(`${this.sidecarInboxPath()}/${filename}`);
    await this.graphRaw(`/drives/${encodeURIComponent(this.driveId)}/root:/${path}:/content`,{
      method:"PUT",
      body:JSON.stringify(evt),
      headers:{"Content-Type":"application/json; charset=utf-8"}
    });
    this.storeLocalSidecarEvent(evt);
    return evt;
  }

  localAvailabilityPending(){
    return this.loadLocalSidecarEvents()
      .filter(e=>e.type==="AVAILABILITY_SET")
      .map(e=>({
        ...(e.payload||{}),
        ID:e.eventId,
        Source:"APPLICATION-SIDECAR",
        StatutSync:"SIDECAR",
        ModifiedAt:e.createdAtUtc,
        Pending:true
      }));
  }

  workbookBase(){
    return `/drives/${encodeURIComponent(this.driveId)}/items/${encodeURIComponent(this.itemId)}/workbook`;
  }

  async ensureSession(force=false){
    if(this.sessionId && !force) return this.sessionId;
    this.sessionId="";

    try{
      const r=await this.graph(`${this.workbookBase()}/createSession`,{
        method:"POST",
        body:{persistChanges:false}
      });
      this.sessionId=r?.id||"";
    }catch(err){
      // Une session améliore les performances, mais les API Excel peuvent aussi
      // fonctionner sans en-tête de session. On ne masque toutefois pas les
      // erreurs structurelles / autorisations.
      const text=String(err?.message||err);
      if(err?.status===403 || err?.status===404 || /unsupported|invalid|workbook/i.test(text)){
        throw new Error(
          "Le classeur Excel n'est pas accessible par l'API Workbook Microsoft Graph. "+
          "Vérifie le fichier, ses droits et le test setup.html. Détail : "+text
        );
      }
      console.warn("Session Excel non créée, poursuite sans session :",err);
    }
    return this.sessionId;
  }

  async workbook(path,options={},retrySession=true){
    try{
      return await this.graph(`${this.workbookBase()}${path}`,{...options,session:true});
    }catch(err){
      const t=String(err?.detail||err?.message||"");
      if(retrySession && /invalidSession|session.*invalid|session.*expired/i.test(t)){
        await this.ensureSession(true);
        return this.workbook(path,options,false);
      }
      throw err;
    }
  }

  async getCurrentUser(){
    if(!this.account) return null;
    const me=await this.graph("/me?$select=id,displayName,mail,userPrincipalName");
    return {
      id:me.id,
      name:me.displayName,
      email:me.mail||me.userPrincipalName||""
    };
  }

  async tableObjects(key,refresh=false){
    if(!refresh && this.tableCache.has(key)) return this.tableCache.get(key);

    const tableName=G.excelDirect.tables[key];
    if(!tableName) throw new Error(`Table Excel non configurée : ${key}`);

    const range=await this.workbook(`/tables/${encodeURIComponent(tableName)}/range`);
    const values=Array.isArray(range?.values)?range.values:[];

    if(!values.length){
      this.tableCache.set(key,[]);
      return [];
    }

    const headers=(values[0]||[]).map(v=>String(v??"").trim());
    const rows=[];

    for(let i=1;i<values.length;i++){
      const vals=values[i]||[];
      if(vals.every(v=>v===null || v===undefined || String(v).trim()==="")) continue;

      const obj={__index:i-1};
      headers.forEach((h,j)=>{ if(h) obj[h]=vals[j]; });
      rows.push(obj);
    }

    this.tableCache.set(key,rows);
    return rows;
  }

  async tableHeaders(key){
    const tableName=G.excelDirect.tables[key];
    const range=await this.workbook(`/tables/${encodeURIComponent(tableName)}/headerRowRange`);
    return (range?.values?.[0]||[]).map(v=>String(v??"").trim());
  }

  excelColumnName(oneBasedColumn){
    let n=Number(oneBasedColumn);
    let s="";
    while(n>0){
      const r=(n-1)%26;
      s=String.fromCharCode(65+r)+s;
      n=Math.floor((n-1)/26);
    }
    return s;
  }

  worksheetNameFromRangeAddress(address){
    const text=String(address||"");
    const bang=text.lastIndexOf("!");
    if(bang<0) throw new Error("Nom de feuille introuvable dans l'adresse Excel : "+text);

    let sheet=text.slice(0,bang).trim();
    if(sheet.startsWith("'") && sheet.endsWith("'")){
      sheet=sheet.slice(1,-1).replace(/''/g,"'");
    }
    return sheet;
  }

  async tableRaw(key){
    const tableName=G.excelDirect.tables[key];
    if(!tableName) throw new Error(`Table Excel non configurée : ${key}`);
    return this.workbook(`/tables/${encodeURIComponent(tableName)}/range`);
  }

  async patchWorksheetRange(sheetName,address,values){
    const path=
      `/worksheets/${encodeURIComponent(sheetName)}/range(address='${address}')`;

    return this.workbook(path,{
      method:"PATCH",
      body:{values}
    });
  }

  async appendRows(key,rowObjs){
    if(!rowObjs?.length) return;

    const raw=await this.tableRaw(key);
    const values=Array.isArray(raw?.values)
      ? raw.values.map(r=>Array.isArray(r)?[...r]:[])
      : [];

    if(!values.length) throw new Error(`Table Excel vide/inaccessible : ${key}`);

    const headers=(values[0]||[]).map(v=>String(v??"").trim());
    const blanks=[];

    for(let i=1;i<values.length;i++){
      const row=values[i]||[];
      if(row.every(v=>v===null || v===undefined || String(v).trim()==="")){
        blanks.push(i);
      }
    }

    if(blanks.length < rowObjs.length){
      throw new Error(
        `Capacité insuffisante dans ${G.excelDirect.tables[key]} : `+
        `${blanks.length} ligne(s) vide(s), ${rowObjs.length} requise(s). `+
        `Relance Initialiser_Solution_A_Excel_Direct avec le module V1.3.`
      );
    }

    const chosen=blanks.slice(0,rowObjs.length);
    const sheetName=this.worksheetNameFromRangeAddress(raw.address);
    const firstCol=Number(raw.columnIndex)+1;
    const lastCol=firstCol+Number(raw.columnCount)-1;

    // Groupe les emplacements contigus pour réduire le nombre d'appels Graph.
    let pos=0;
    while(pos<chosen.length){
      let endPos=pos;
      while(endPos+1<chosen.length && chosen[endPos+1]===chosen[endPos]+1){
        endPos++;
      }

      const segment=chosen.slice(pos,endPos+1);
      const segmentRows=rowObjs.slice(pos,endPos+1).map(obj=>
        headers.map(h=>obj[h]===undefined ? "" : obj[h])
      );

      const excelStartRow=Number(raw.rowIndex)+segment[0]+1;
      const excelEndRow=Number(raw.rowIndex)+segment[segment.length-1]+1;
      const address=
        `${this.excelColumnName(firstCol)}${excelStartRow}:`+
        `${this.excelColumnName(lastCol)}${excelEndRow}`;

      await this.patchWorksheetRange(sheetName,address,segmentRows);
      pos=endPos+1;
    }

    this.tableCache.delete(key);
  }

  async patchTableFieldsViaWorksheet(key,index,fields){
    const raw=await this.tableRaw(key);
    const headers=(raw?.values?.[0]||[]).map(v=>String(v??"").trim());
    const sheetName=this.worksheetNameFromRangeAddress(raw.address);

    for(const [columnName,value] of Object.entries(fields||{})){
      const colIndex=headers.findIndex(h=>norm(h)===norm(columnName));
      if(colIndex<0){
        throw new Error(`Colonne ${columnName} introuvable dans ${G.excelDirect.tables[key]}.`);
      }

      const excelRow=Number(raw.rowIndex)+Number(index)+2;
      const excelCol=Number(raw.columnIndex)+colIndex+1;
      const address=`${this.excelColumnName(excelCol)}${excelRow}`;

      await this.patchWorksheetRange(sheetName,address,[[value===undefined ? "" : value]]);
    }

    this.tableCache.delete(key);
  }

  async patchRow(key,index,rowObj){
    await this.patchTableFieldsViaWorksheet(key,index,rowObj);
  }

  async getAgents(){
    const rows=await this.tableObjects("agents",true);
    return rows.map(r=>({
      ...r,
      id:r.Code,
      Title:r.Title||r.Agent||"",
      Actif:!(norm(r.Actif)==="FALSE" || norm(r.Actif)==="NON" || Number(r.Actif)===0)
    }));
  }

  async getSlots(){
    const rows=await this.tableObjects("slots",true);
    return rows.map(r=>({...r,
      DateGarde:dateOnly(r.DateGarde||r.Date),
      Date:dateOnly(r.Date||r.DateGarde),
      HeureDebut:timeOnly(r.HeureDebut),
      HeureFin:timeOnly(r.HeureFin)
    }));
  }
  async getAssignments(){
    const rows=await this.tableObjects("assignments",true);
    return rows.map(r=>({...r,
      DateGarde:dateOnly(r.DateGarde||r.Date),
      Date:dateOnly(r.Date||r.DateGarde)
    }));
  }
  async getPublications(){
    const rows=await this.tableObjects("publications",true);
    return rows.map(r=>({...r,
      DateDebut:dateOnly(r.DateDebut),
      DateFin:dateOnly(r.DateFin)
    }));
  }
  async getLocks(){ return this.tableObjects("locks",true); }
  async getJournal(){ return this.tableObjects("journal",true); }

  async getPendingSubmissions(){
    let legacy=[];
    try{
      const rows=await this.tableObjects("submissions",true);
      legacy=rows.filter(r=>{
        const s=norm(r.StatutSync);
        return ["A_IMPORTER","EN_ATTENTE"].includes(s);
      });
    }catch{}
    return [...legacy,...this.localAvailabilityPending()];
  }

  async getPendingCommands(){
    const rows=await this.tableObjects("commands",true);
    return rows.filter(r=>norm(r.Statut)==="A_TRAITER");
  }

  async getPendingLocks(){
    const rows=await this.tableObjects("locks",true);
    return rows.filter(r=>norm(r.StatutSync)==="A_APPLIQUER");
  }

  async getSyncErrors(){
    const [submissions,commands,locks]=await Promise.all([
      this.tableObjects("submissions",true),
      this.tableObjects("commands",true),
      this.tableObjects("locks",true)
    ]);
    return [
      ...submissions.filter(r=>norm(r.StatutSync)==="ERREUR"),
      ...commands.filter(r=>norm(r.Statut)==="ERREUR"),
      ...locks.filter(r=>norm(r.StatutSync).startsWith("ERREUR"))
    ];
  }

  mergeAvailability(mirror,pending){
    const map=new Map();

    for(const r of mirror){
      const k=`${norm(r.AgentCode)}|${String(r.CreneauId||"")}`;
      map.set(k,{...r});
    }

    // Plusieurs modifications peuvent être effectuées sur le même créneau.
    // On ne garde visuellement que la dernière décision mobile.
    const latestPending=new Map();

    for(const r of pending){
      const k=`${norm(r.AgentCode)}|${String(r.CreneauId||"")}`;
      const old=latestPending.get(k);
      const currentTs=timestampMs(r.ModifiedAt);
      const oldTs=old ? timestampMs(old.ModifiedAt) : -1;

      if(!old || currentTs>=oldTs) latestPending.set(k,r);
    }

    for(const [k,r] of latestPending.entries()){
      const existing=map.get(k);
      const pendingTs=timestampMs(r.ModifiedAt);
      const mirrorTs=timestampMs(existing?.ModifiedAt);

      // Dernière modification connue = valeur affichée.
      // Si Excel a été modifié après la saisie mobile, on n'affiche pas
      // artificiellement une ancienne demande en attente par-dessus Excel.
      if(existing && mirrorTs>0 && pendingTs>0 && mirrorTs>pendingTs){
        map.set(k,{
          ...existing,
          PendingConflict:true,
          PendingConflictReason:"EXCEL_PLUS_RECENT"
        });
      }else{
        map.set(k,{
          ...existing,
          ...r,
          Source:"APPLICATION",
          Pending:true
        });
      }
    }

    return [...map.values()];
  }

  async getAvailability(agentCode){
    const all=await this.getAllAvailability();
    return all.filter(x=>norm(x.AgentCode)===norm(agentCode));
  }

  async getAllAvailability(){
    const [mirrorRaw,pendingRaw]=await Promise.all([
      this.tableObjects("availability",true),
      this.getPendingSubmissions()
    ]);
    const normalizeDates=r=>({...r,
      DateGarde:dateOnly(r.DateGarde||r.Date),
      Date:dateOnly(r.Date||r.DateGarde)
    });
    return this.mergeAvailability(
      mirrorRaw.map(normalizeDates),
      pendingRaw.map(normalizeDates)
    );
  }

  submissionRow(payload){
    const now=new Date().toISOString();
    const rnd=Math.random().toString(16).slice(2,10);
    return {
      ID:`SAISIE-${Date.now()}-${rnd}`,
      AgentCode:payload.AgentCode,
      AgentNom:payload.AgentNom||"",
      CreneauId:String(payload.CreneauId),
      DateGarde:payload.DateGarde||"",
      Date:payload.Date||"",
      HeureDebut:timeOnly(payload.HeureDebut),
      Valeur:payload.Valeur||"",
      RemplacantCode:payload.RemplacantCode||"",
      RemplacantNom:payload.RemplacantNom||"",
      DemandePar:this.account?.username||"",
      Source:"APPLICATION",
      StatutSync:"A_IMPORTER",
      ModifiedAt:now,
      TraiteAt:"",
      Message:""
    };
  }

  async getDesktopEditLock(){
    const cloud=await this.getCloudStatus();
    const active=norm(cloud.DESKTOP_ACTIVE?.value||"")==="OUI";
    if(!active) return {locked:false};

    const raw=cloud.DESKTOP_HEARTBEAT?.value ||
              cloud.DESKTOP_HEARTBEAT?.updatedAt ||
              cloud.DESKTOP_ACTIVE?.updatedAt || "";

    let d=null;
    if(raw!=="" && raw!==null && raw!==undefined){
      const s=String(raw).trim();
      const n=Number(s.replace(",","."));
      if(Number.isFinite(n) && n>=1 && n<1000000){
        d=new Date(Date.UTC(1899,11,30)+n*86400000);
      }else{
        const parsed=new Date(s);
        if(Number.isFinite(parsed.valueOf())) d=parsed;
      }
    }

    if(!d) return {locked:false};
    const ageMs=Date.now()-d.valueOf();
    return {
      locked:ageMs>=0 && ageMs < 12*60*1000,
      ageMs,
      user:cloud.DESKTOP_USER?.value||""
    };
  }

  async assertDesktopWritable(){
    const lock=await this.getDesktopEditLock();
    if(lock.locked){
      throw new Error(
        "Le classeur Excel est actuellement ouvert en mode Bureau. "+
        "Pour éviter un conflit de fusion SharePoint, les modifications sont "+
        "temporairement en lecture seule. Réessaie après la fermeture d’Excel."
      );
    }
  }

  async saveAvailability(payload){
    const evt=await this.writeSidecarEvent("AVAILABILITY_SET",payload);
    return {
      ...payload,
      ID:evt.eventId,
      ModifiedAt:evt.createdAtUtc,
      Source:"APPLICATION-SIDECAR",
      StatutSync:"SIDECAR",
      Deferred:false,
      Sidecar:true
    };
  }

  async saveAvailabilityBatch(payloads){
    const rows=[];
    // Séquentiel : évite une rafale de requêtes Graph simultanées.
    for(const p of payloads||[]) rows.push(await this.saveAvailability(p));
    return rows;
  }

  async setLock(scope,date,bloc,locked,userEmail){
    const evt=await this.writeSidecarEvent("LOCK_SET",{
      Scope:scope,Date:date,Bloc:bloc,Locked:!!locked
    });
    return {ID:evt.eventId,Scope:scope,Date:date,Bloc:bloc,Locked:!!locked,LockedBy:userEmail||"",Sidecar:true};
  }

  async addCommand(command,date="",bloc="",userEmail="",message=""){
    const evt=await this.writeSidecarEvent("COMMAND",{
      Commande:command,DateGarde:date,Bloc:bloc,Message:message||""
    });
    return {ID:evt.eventId,Commande:command,DateGarde:date,Bloc:bloc,Sidecar:true};
  }

  async saveAssignmentChange(payload){
    const evt=await this.writeSidecarEvent("ASSIGNMENT_SET",payload);
    return {...payload,ID:evt.eventId,ModifiedAt:evt.createdAtUtc,Sidecar:true};
  }

  async publish(type,data,userEmail){
    const evt=await this.writeSidecarEvent("PUBLISH",{
      Type:type,
      DateDebut:data.dateDebut||"",
      DateFin:data.dateFin||"",
      DateGarde:data.dateDebut||"",
      Bloc:data.bloc||""
    });
    return {ID:evt.eventId,Type:type,...data,PubliePar:userEmail||"",Sidecar:true};
  }

  async saveAgentAccess(agentCode,payload){
    const evt=await this.writeSidecarEvent("AGENT_ACCESS_SET",{
      AgentCode:agentCode,
      ...(payload||{})
    });
    return {AgentCode:agentCode,...payload,ID:evt.eventId,Sidecar:true};
  }

  async getCloudStatus(){
    try{
      const rows=await this.tableObjects("cloudStatus",true);
      const result={};
      for(const row of rows){
        const key=String(row.Key||"").trim();
        if(key) result[key]={
          value:String(row.Value??""),
          updatedAt:String(row.UpdatedAt??"")
        };
      }
      return result;
    }catch(err){
      return {};
    }
  }

  async getLastSyncInfo(){
    const assignments=await this.tableObjects("assignments",true);
    const timestamps=assignments
      .map(x=>String(x.ModifiedAt||""))
      .filter(Boolean)
      .sort();

    const last=timestamps.at(-1)||"";
    const [pendingSubmissions,pendingCommands,pendingLocks,errors]=await Promise.all([
      this.getPendingSubmissions(),
      this.getPendingCommands(),
      this.getPendingLocks(),
      this.getSyncErrors()
    ]);

    const cloud=await this.getCloudStatus();
    const cloudLast=cloud.LAST_RUN?.updatedAt || cloud.LAST_RUN?.value || "";
    return {
      timestamp:cloudLast || last,
      pending:pendingSubmissions.length + pendingCommands.length + pendingLocks.length,
      errors:errors.length,
      cloudStatus:cloud.STATUS?.value || "",
      cloudResult:cloud.LAST_RESULT?.value || "",
      cloudRecalcRequired:cloud.RECALC_REQUIRED?.value || "",
      cloudLastRun:cloudLast
    };
  }

  async healthCheck(){
    const required=[
      "agents","slots","availability","submissions","assignments",
      "locks","publications","commands","journal","cloudStatus"
    ];
    const tables={};

    const file=await this.graph(
      `/drives/${encodeURIComponent(this.driveId)}/items/${encodeURIComponent(this.itemId)}?`+
      "$select=id,name,webUrl,lastModifiedDateTime,file,parentReference"
    );

    for(const key of required){
      try{
        const tableName=G.excelDirect.tables[key];
        const info=await this.workbook(`/tables/${encodeURIComponent(tableName)}`);
        tables[key]={ok:true,name:info?.name||tableName};
      }catch(err){
        tables[key]={ok:false,error:String(err?.message||err)};
      }
    }

    const sync=await this.getLastSyncInfo();
    this.lastHealth={file,tables,sync,checkedAt:new Date().toISOString()};
    return this.lastHealth;
  }
}

window.GardesRepositories={DemoRepository,GraphRepository,ExcelDirectRepository,dateOnly,isoLocal,timeOnly,norm};
})();
