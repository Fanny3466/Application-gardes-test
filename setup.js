(function(){
"use strict";
const MSAL_URL="https://cdn.jsdelivr.net/npm/@azure/msal-browser@5.17.3/+esm";
const SCOPES=["User.Read","Files.ReadWrite"];
const SETUP_KEY="gardes-prod-setup-v231";
const STATE_KEY="gardes-prod-auth-state-v231";
const requiredTables=["tblApp_Agents","tblApp_Creneaux","tblApp_Disponibilites","tblApp_Saisies","tblApp_Affectations","tblApp_Verrous","tblApp_Publications","tblApp_Commandes","tblApp_Journal"];
const $=q=>document.querySelector(q);
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function status(msg,type=""){ $("#status").textContent=msg; $("#status").className=`status ${type}`; }
function check(name,ok,detail=""){ const d=document.createElement("div"); d.className="check"; d.innerHTML=`<span>${esc(name)}${detail?`<br><small>${esc(detail)}</small>`:""}</span><span class="${ok?"good":"bad"}">${ok?"OK":"ERREUR"}</span>`; $("#checks").appendChild(d); }
function normalizeShareUrl(url){ return String(url||"").trim().replace(/\\:/g,":"); }
function readForm(){ return {tenantId:$("#tenantId").value.trim(),clientId:$("#clientId").value.trim(),shareUrl:normalizeShareUrl($("#shareUrl").value),adminAgentCode:$("#adminAgentCode").value.trim()||"CFa"}; }
function writeForm(data={}){ const prod=window.GARDES_PRODUCTION||{}; $("#tenantId").value=data.tenantId||prod.tenantId||"b5849dc4-c17a-4f94-9680-38759588959e"; $("#clientId").value=data.clientId||prod.clientId||"e652d620-c4b0-4feb-a426-193ef645c807"; $("#shareUrl").value=data.shareUrl||""; $("#adminAgentCode").value=data.adminAgentCode||prod.bootstrapAdminAgentCode||"CFa"; }
function persistForm(data){ localStorage.setItem(SETUP_KEY,JSON.stringify(data)); }
function shareToken(url){ const bytes=new TextEncoder().encode(url); let binary=""; bytes.forEach(b=>binary+=String.fromCharCode(b)); return "u!"+btoa(binary).replace(/=+$/,'').replace(/\//g,'_').replace(/\+/g,'-'); }
async function fetchGraph(token,path,options={}){ let last; for(let attempt=0;attempt<4;attempt++){ const r=await fetch(path.startsWith("https://")?path:`https://graph.microsoft.com/v1.0${path}`,{method:options.method||"GET",headers:{Authorization:`Bearer ${token}`,Accept:"application/json",...(options.body?{"Content-Type":"application/json"}:{}),...(options.sessionId?{"Workbook-Session-Id":options.sessionId}:{})},body:options.body?JSON.stringify(options.body):undefined,cache:"no-store"}); if(r.ok){ if(r.status===204)return null; const ct=r.headers.get("content-type")||""; return ct.includes("application/json")?r.json():r.text(); } const txt=await r.text(); last=new Error(`Graph ${r.status}: ${txt.slice(0,1000)}`); last.status=r.status; if([429,502,503,504].includes(r.status)&&attempt<3){ await sleep(900*Math.pow(2,attempt)); continue; } throw last; } throw last; }
async function createMsal(tenantId,clientId){ const msal=await import(MSAL_URL); const redirectUri=location.origin+location.pathname; const app=new msal.PublicClientApplication({auth:{clientId,authority:`https://login.microsoftonline.com/${tenantId}`,redirectUri,postLogoutRedirectUri:redirectUri,navigateToLoginRequestUrl:false},cache:{cacheLocation:"sessionStorage"}}); await app.initialize(); const redirectResult=await app.handleRedirectPromise(); if(redirectResult?.account) app.setActiveAccount(redirectResult.account); else { const a=app.getActiveAccount()||app.getAllAccounts()[0]||null; if(a) app.setActiveAccount(a); } return {app,redirectResult}; }
async function acquireToken(app){ const account=app.getActiveAccount()||app.getAllAccounts()[0]||null; if(!account)return null; try{return await app.acquireTokenSilent({account,scopes:SCOPES});}catch(err){ sessionStorage.setItem(STATE_KEY,"resume-token"); await app.acquireTokenRedirect({account,scopes:SCOPES}); return null; } }
function excelColumnName(oneBasedColumn){
  let n=Number(oneBasedColumn);
  let s="";
  while(n>0){
    const r=(n-1)%26;
    s=String.fromCharCode(65+r)+s;
    n=Math.floor((n-1)/26);
  }
  return s;
}

function worksheetNameFromRangeAddress(address){
  const text=String(address||"");
  const bang=text.lastIndexOf("!");
  if(bang<0) throw new Error("Nom de feuille introuvable dans l'adresse Excel : "+text);

  let sheet=text.slice(0,bang).trim();
  if(sheet.startsWith("'") && sheet.endsWith("'")){
    sheet=sheet.slice(1,-1).replace(/''/g,"'");
  }
  return sheet;
}

async function patchTableCellViaWorksheet(token,base,sessionId,tableName,dataRowIndex,columnIndex,value){
  const tableRange=await fetchGraph(token,`${base}/tables/${encodeURIComponent(tableName)}/range`,{sessionId});

  const sheetName=worksheetNameFromRangeAddress(tableRange.address);
  const excelRow=Number(tableRange.rowIndex)+Number(dataRowIndex)+2;
  const excelCol=Number(tableRange.columnIndex)+Number(columnIndex)+1;
  const cellAddress=`${excelColumnName(excelCol)}${excelRow}`;

  const rangePath=
    `${base}/worksheets/${encodeURIComponent(sheetName)}/range(address='${cellAddress}')`;

  await fetchGraph(token,rangePath,{
    method:"PATCH",
    sessionId,
    body:{values:[[value]]}
  });
}

async function bindAdmin(token,driveId,itemId,sessionId,agentCode,email){
  const base=`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/workbook`;
  const range=await fetchGraph(token,`${base}/tables/tblApp_Agents/range`,{sessionId});
  const values=range?.values||[];

  if(values.length<2) return {ok:false,detail:"tblApp_Agents vide"};

  const headers=values[0].map(x=>String(x??"").trim());
  const iCode=headers.findIndex(h=>h.toUpperCase()==="CODE");
  const iEmail=headers.findIndex(h=>h.toUpperCase()==="EMAIL");
  const iRole=headers.findIndex(h=>h.toUpperCase()==="ROLE");

  if(iCode<0||iEmail<0||iRole<0){
    return {ok:false,detail:"Colonnes Code/Email/Role absentes"};
  }

  const idx=values.slice(1).findIndex(row=>
    String(row[iCode]??"").trim().toUpperCase()===agentCode.trim().toUpperCase()
  );

  if(idx<0) return {ok:false,detail:`Code ${agentCode} introuvable`};

  await patchTableCellViaWorksheet(
    token,base,sessionId,"tblApp_Agents",idx,iEmail,email
  );
  await patchTableCellViaWorksheet(
    token,base,sessionId,"tblApp_Agents",idx,iRole,"ADMIN"
  );

  return {ok:true,detail:`${agentCode} → ${email} / ADMIN`};
}

async function testWorkbook(app,data){ $("#checks").innerHTML=""; $("#resultCard").classList.add("hidden"); const tok=await acquireToken(app); if(!tok)return; const token=tok.accessToken; const me=await fetchGraph(token,"/me?$select=id,displayName,mail,userPrincipalName"); const email=me.mail||me.userPrincipalName||""; check("Authentification Microsoft 365",true,`${me.displayName} · ${email}`); status("Résolution du fichier Excel…"); const item=await fetchGraph(token,`/shares/${encodeURIComponent(shareToken(data.shareUrl))}/driveItem?$select=id,name,webUrl,parentReference,file`); const driveId=item.parentReference?.driveId||"",itemId=item.id||""; if(!driveId||!itemId)throw new Error("Impossible de résoudre driveId/itemId à partir du lien du fichier."); check("Fichier SharePoint / OneDrive",true,item.name); const base=`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/workbook`; status("Test de l’API Workbook Microsoft Graph…"); const sess=await fetchGraph(token,`${base}/createSession`,{method:"POST",body:{persistChanges:true}}); const sessionId=sess?.id||""; check("API Workbook / session persistante",true,"Session créée"); status("Vérification des tables techniques…"); let allOk=true; for(const tableName of requiredTables){
  try{
    const info=await fetchGraph(token,`${base}/tables/${encodeURIComponent(tableName)}`,{sessionId});
    let detail=info?.name||"";

    if(["tblApp_Saisies","tblApp_Commandes","tblApp_Publications","tblApp_Verrous"].includes(tableName)){
      const tr=await fetchGraph(token,`${base}/tables/${encodeURIComponent(tableName)}/range`,{sessionId});
      const dataRows=Math.max(0,Number(tr?.rowCount||0)-1);
      detail+=` · capacité ${dataRows} lignes`;

      const minima={
        tblApp_Saisies:1500,
        tblApp_Commandes:500,
        tblApp_Publications:300,
        tblApp_Verrous:200
      };
      if(dataRows < minima[tableName]){
        allOk=false;
        check(tableName,false,`${detail} · module Excel Direct V1.3 requis`);
        continue;
      }
    }

    check(tableName,true,detail);
  }catch(err){
    allOk=false;
    check(tableName,false,String(err.message||err));
  }
} if(!allOk)throw new Error("Une ou plusieurs tables tblApp_* sont absentes. Vérifie le module Excel Direct V1.2/V1.3."); status("Association du compte administrateur…"); const binding=await bindAdmin(token,driveId,itemId,sessionId,data.adminAgentCode,email); check("Association administrateur",binding.ok,binding.detail); if(!binding.ok)throw new Error("Association administrateur impossible : "+binding.detail); const config=`/*\n * Généré par setup.html V2.3.3 le ${new Date().toLocaleString("fr-FR")}\n * Ne contient aucun client secret.\n */\nwindow.GARDES_PRODUCTION = {\n  configured: true,\n  tenantId: ${JSON.stringify(data.tenantId)},\n  clientId: ${JSON.stringify(data.clientId)},\n  driveId: ${JSON.stringify(driveId)},\n  itemId: ${JSON.stringify(itemId)},\n  workbookName: ${JSON.stringify(item.name||"")},\n  adminEmails: [${JSON.stringify(email)}],\n  bootstrapAdminAgentCode: ${JSON.stringify(data.adminAgentCode)},\n  maxExcelSyncAgeMinutes: 5\n};\n`; $("#generatedConfig").value=config; $("#resultCard").classList.remove("hidden"); sessionStorage.removeItem(STATE_KEY); status("Tous les contrôles sont réussis. Télécharge maintenant production-config.js.","ok"); }
async function startOrResume(){ let saved={}; try{saved=JSON.parse(localStorage.getItem(SETUP_KEY)||"{}")||{};}catch{} writeForm(saved); const data=readForm(); if(!data.tenantId||!data.clientId){status("Tenant ID ou Client ID manquant.","err");return;} try{status("Initialisation de Microsoft 365…"); const {app,redirectResult}=await createMsal(data.tenantId,data.clientId); const shouldResume=!!redirectResult||sessionStorage.getItem(STATE_KEY)==="resume-login"||sessionStorage.getItem(STATE_KEY)==="resume-token"; const account=app.getActiveAccount()||app.getAllAccounts()[0]||null; if(shouldResume&&account){sessionStorage.removeItem(STATE_KEY); const persisted=JSON.parse(localStorage.getItem(SETUP_KEY)||"{}")||data; writeForm(persisted); status("Connexion Microsoft réussie. Reprise automatique du test…"); await testWorkbook(app,persisted); return;} status("En attente. Clique sur « Se connecter à Microsoft 365 et tester ».");}catch(err){console.error(err);status(String(err?.message||err),"err");} }
async function beginTest(){ $("#checks").innerHTML=""; $("#resultCard").classList.add("hidden"); const data=readForm(); if(!data.tenantId||!data.clientId||!data.shareUrl){status("Renseigne Tenant ID, Client ID et le lien du fichier.","err");return;} persistForm(data); const btn=$("#btnTest"); btn.disabled=true; try{status("Préparation de la redirection Microsoft 365…"); const {app}=await createMsal(data.tenantId,data.clientId); const account=app.getActiveAccount()||app.getAllAccounts()[0]||null; if(account){status("Compte Microsoft détecté. Test du classeur…"); await testWorkbook(app,data); return;} sessionStorage.setItem(STATE_KEY,"resume-login"); await app.loginRedirect({scopes:SCOPES,prompt:"select_account"});}catch(err){console.error(err);status(String(err?.message||err),"err");}finally{btn.disabled=false;} }
async function resetAuth(){ const data=readForm(); try{if(data.tenantId&&data.clientId){const {app}=await createMsal(data.tenantId,data.clientId);await app.clearCache();}}catch(err){console.warn(err);} sessionStorage.removeItem(STATE_KEY); status("État d’authentification local réinitialisé. Recharge la page puis relance le test.","ok"); }
$("#btnTest").addEventListener("click",beginTest); $("#btnResetAuth").addEventListener("click",resetAuth); $("#btnCopy").addEventListener("click",async()=>{await navigator.clipboard.writeText($("#generatedConfig").value);status("Configuration copiée.","ok");}); $("#btnDownload").addEventListener("click",()=>{const blob=new Blob([$("#generatedConfig").value],{type:"text/javascript;charset=utf-8"});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="production-config.js";document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}); startOrResume();
})();
