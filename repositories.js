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

  workbookBase(){
    return `/drives/${encodeURIComponent(this.driveId)}/items/${encodeURIComponent(this.itemId)}/workbook`;
  }

  async ensureSession(force=false){
    if(this.sessionId && !force) return this.sessionId;
    this.sessionId="";

    try{
      const r=await this.graph(`${this.workbookBase()}/createSession`,{
        method:"POST",
        body:{persistChanges:true}
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

  async getSlots(){ return this.tableObjects("slots",true); }
  async getAssignments(){ return this.tableObjects("assignments",true); }
  async getPublications(){ return this.tableObjects("publications",true); }
  async getLocks(){ return this.tableObjects("locks",true); }
  async getJournal(){ return this.tableObjects("journal",true); }

  async getPendingSubmissions(){
    const rows=await this.tableObjects("submissions",true);
    return rows.filter(r=>{
      const s=norm(r.StatutSync);
      return ["A_IMPORTER","EN_ATTENTE","IMPORTE"].includes(s);
    });
  }

  mergeAvailability(mirror,pending){
    const map=new Map();

    for(const r of mirror){
      const k=`${norm(r.AgentCode)}|${String(r.CreneauId||"")}`;
      map.set(k,{...r});
    }

    const sorted=[...pending].sort((a,b)=>
      String(a.ModifiedAt||"").localeCompare(String(b.ModifiedAt||""))
    );

    for(const r of sorted){
      const k=`${norm(r.AgentCode)}|${String(r.CreneauId||"")}`;
      map.set(k,{
        ...map.get(k),
        ...r,
        Source:"APPLICATION",
        Pending:true
      });
    }

    return [...map.values()];
  }

  async getAvailability(agentCode){
    const all=await this.getAllAvailability();
    return all.filter(x=>norm(x.AgentCode)===norm(agentCode));
  }

  async getAllAvailability(){
    const [mirror,pending]=await Promise.all([
      this.tableObjects("availability",true),
      this.getPendingSubmissions()
    ]);
    return this.mergeAvailability(mirror,pending);
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
      HeureDebut:payload.HeureDebut||"",
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

  async saveAvailability(payload){
    const row=this.submissionRow(payload);
    await this.appendRows("submissions",[row]);
    return row;
  }

  async saveAvailabilityBatch(payloads){
    const rows=payloads.map(p=>this.submissionRow(p));
    await this.appendRows("submissions",rows);
    return rows;
  }

  async setLock(scope,date,bloc,locked,userEmail){
    const rows=await this.tableObjects("locks",true);
    const id=`${scope}|${date}|${bloc}`;
    const existing=rows.find(x=>String(x.ID||"")===id);

    const row={
      ...(existing||{}),
      ID:id,
      Scope:scope,
      Date:date,
      Bloc:bloc,
      Locked:!!locked,
      LockedBy:userEmail||"",
      LockedAt:new Date().toISOString(),
      StatutSync:"A_APPLIQUER"
    };

    if(existing){
      await this.patchTableFieldsViaWorksheet("locks",existing.__index,{
        Scope:row.Scope,
        Date:row.Date,
        Bloc:row.Bloc,
        Locked:row.Locked,
        LockedBy:row.LockedBy,
        LockedAt:row.LockedAt,
        StatutSync:row.StatutSync
      });
    }else await this.appendRows("locks",[row]);

    return row;
  }

  async addCommand(command,date="",bloc="",userEmail=""){
    const row={
      ID:`CMD-${Date.now()}-${Math.random().toString(16).slice(2,8)}`,
      Commande:command,
      DateGarde:date,
      Bloc:bloc,
      DemandePar:userEmail||"",
      DemandeAt:new Date().toISOString(),
      Statut:"A_TRAITER",
      TraiteAt:"",
      Message:""
    };
    await this.appendRows("commands",[row]);
    return row;
  }

  async publish(type,data,userEmail){
    const row={
      ID:`PUB-${Date.now()}-${Math.random().toString(16).slice(2,7)}`,
      Type:type,
      DateDebut:data.dateDebut||"",
      DateFin:data.dateFin||"",
      Bloc:data.bloc||"",
      Version:String(Date.now()),
      PubliePar:userEmail||"",
      PublishedAt:new Date().toISOString(),
      Gele:true,
      Statut:"DEMANDEE"
    };

    await this.appendRows("publications",[row]);
    await this.addCommand("PUBLIER_GARDE",data.dateDebut||"",data.bloc||"",userEmail||"");
    return row;
  }

  async saveAgentAccess(agentCode,payload){
    const rows=await this.tableObjects("agents",true);
    const existing=rows.find(x=>norm(x.Code)===norm(agentCode));
    if(!existing) throw new Error("Agent introuvable dans tblApp_Agents.");

    const row={...existing};
    if(Object.prototype.hasOwnProperty.call(payload,"Email")) row.Email=payload.Email||"";
    if(Object.prototype.hasOwnProperty.call(payload,"Role")) row.Role=(payload.Role||"AGENT").toUpperCase();
    if(Object.prototype.hasOwnProperty.call(payload,"Actif")) row.Actif=payload.Actif;

    const fields={};
    if(Object.prototype.hasOwnProperty.call(payload,"Email")) fields.Email=row.Email;
    if(Object.prototype.hasOwnProperty.call(payload,"Role")) fields.Role=row.Role;
    if(Object.prototype.hasOwnProperty.call(payload,"Actif")) fields.Actif=row.Actif;

    await this.patchTableFieldsViaWorksheet("agents",existing.__index,fields);
    this.tableCache.delete("agents");
    return row;
  }

  async getLastSyncInfo(){
    const assignments=await this.tableObjects("assignments",true);
    const timestamps=assignments
      .map(x=>String(x.ModifiedAt||""))
      .filter(Boolean)
      .sort();

    const last=timestamps.at(-1)||"";
    return {
      timestamp:last,
      pending:(await this.getPendingSubmissions()).length
    };
  }

  async healthCheck(){
    const required=[
      "agents","slots","availability","submissions","assignments",
      "locks","publications","commands","journal"
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

window.GardesRepositories={DemoRepository,GraphRepository,ExcelDirectRepository,dateOnly,isoLocal,norm};
})();
