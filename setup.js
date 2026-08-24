(function(){
"use strict";

const MSAL_URL="https://cdn.jsdelivr.net/npm/@azure/msal-browser@5.17.3/+esm";
const SCOPES=["User.Read","Files.ReadWrite"];
const requiredTables=[
  "tblApp_Agents","tblApp_Creneaux","tblApp_Disponibilites","tblApp_Saisies",
  "tblApp_Affectations","tblApp_Verrous","tblApp_Publications",
  "tblApp_Commandes","tblApp_Journal"
];

const $=q=>document.querySelector(q);
const status=(msg,type="")=>{
  $("#status").textContent=msg;
  $("#status").className=`status ${type}`;
};
const check=(name,ok,detail="")=>{
  const d=document.createElement("div");
  d.className="check";
  d.innerHTML=`<span>${escapeHtml(name)}${detail?`<br><small>${escapeHtml(detail)}</small>`:""}</span><span class="${ok?"good":"bad"}">${ok?"OK":"ERREUR"}</span>`;
  $("#checks").appendChild(d);
};
const escapeHtml=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function shareToken(url){
  const bytes=new TextEncoder().encode(url);
  let binary="";
  bytes.forEach(b=>binary+=String.fromCharCode(b));
  return "u!"+btoa(binary).replace(/=+$/,"").replace(/\//g,"_").replace(/\+/g,"-");
}

async function fetchGraph(token,path,options={}){
  let last;
  for(let attempt=0;attempt<4;attempt++){
    const r=await fetch(path.startsWith("https://")?path:`https://graph.microsoft.com/v1.0${path}`,{
      method:options.method||"GET",
      headers:{
        Authorization:`Bearer ${token}`,
        Accept:"application/json",
        ...(options.body?{"Content-Type":"application/json"}:{}),
        ...(options.sessionId?{"Workbook-Session-Id":options.sessionId}:{})
      },
      body:options.body?JSON.stringify(options.body):undefined,
      cache:"no-store"
    });
    if(r.ok){
      if(r.status===204) return null;
      const ct=r.headers.get("content-type")||"";
      return ct.includes("application/json")?r.json():r.text();
    }
    const txt=await r.text();
    last=new Error(`Graph ${r.status}: ${txt.slice(0,1000)}`);
    last.status=r.status;
    if([429,502,503,504].includes(r.status) && attempt<3){
      await sleep(900*Math.pow(2,attempt));
      continue;
    }
    throw last;
  }
  throw last;
}

async function bindAdmin(token,driveId,itemId,sessionId,agentCode,email){
  if(!agentCode) return {ok:false,detail:"Code agent non renseigné"};

  const base=`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/workbook`;
  const range=await fetchGraph(token,`${base}/tables/tblApp_Agents/range`,{sessionId});
  const values=range?.values||[];
  if(values.length<2) return {ok:false,detail:"tblApp_Agents vide"};

  const headers=values[0].map(x=>String(x??"").trim());
  const iCode=headers.findIndex(h=>h.toUpperCase()==="CODE");
  const iEmail=headers.findIndex(h=>h.toUpperCase()==="EMAIL");
  const iRole=headers.findIndex(h=>h.toUpperCase()==="ROLE");

  if(iCode<0 || iEmail<0 || iRole<0) return {ok:false,detail:"Colonnes Code/Email/Role absentes"};

  const idx=values.slice(1).findIndex(row=>String(row[iCode]??"").trim().toUpperCase()===agentCode.trim().toUpperCase());
  if(idx<0) return {ok:false,detail:`Code ${agentCode} introuvable`};

  const row=[...(values[idx+1]||[])];
  while(row.length<headers.length) row.push("");
  row[iEmail]=email;
  row[iRole]="ADMIN";

  await fetchGraph(token,`${base}/tables/tblApp_Agents/rows/${idx}`,{
    method:"PATCH",sessionId,body:{values:[row]}
  });

  return {ok:true,detail:`${agentCode} → ${email} / ADMIN`};
}

async function run(){
  $("#checks").innerHTML="";
  $("#resultCard").classList.add("hidden");

  const tenantId=$("#tenantId").value.trim();
  const clientId=$("#clientId").value.trim();
  const shareUrl=$("#shareUrl").value.trim();
  const adminAgentCode=$("#adminAgentCode").value.trim();

  if(!tenantId||!clientId||!shareUrl){
    status("Renseigne Tenant ID, Client ID et le lien du fichier.","err");return;
  }

  localStorage.setItem("gardes-prod-setup",JSON.stringify({tenantId,clientId,shareUrl,adminAgentCode}));

  try{
    status("Chargement de Microsoft Authentication Library…");
    const msal=await import(MSAL_URL);
    const redirectUri=location.origin+location.pathname;

    const app=new msal.PublicClientApplication({
      auth:{
        clientId,
        authority:`https://login.microsoftonline.com/${tenantId}`,
        redirectUri
      },
      cache:{cacheLocation:"sessionStorage"}
    });
    await app.initialize();

    status("Connexion Microsoft 365…");
    const login=await app.loginPopup({scopes:SCOPES,prompt:"select_account"});
    app.setActiveAccount(login.account);

    const tok=await app.acquireTokenSilent({account:login.account,scopes:SCOPES});
    const token=tok.accessToken;

    const me=await fetchGraph(token,"/me?$select=id,displayName,mail,userPrincipalName");
    const email=me.mail||me.userPrincipalName||"";
    check("Authentification Microsoft 365",true,`${me.displayName} · ${email}`);

    status("Résolution du fichier Excel…");
    const encoded=shareToken(shareUrl);
    const item=await fetchGraph(token,`/shares/${encodeURIComponent(encoded)}/driveItem?$select=id,name,webUrl,parentReference,file`);
    const driveId=item.parentReference?.driveId||"";
    const itemId=item.id||"";

    if(!driveId||!itemId) throw new Error("Impossible de résoudre driveId/itemId.");
    check("Fichier SharePoint / OneDrive",true,item.name);

    const base=`/drives/${encodeURIComponent(driveId)}/items/${encodeURIComponent(itemId)}/workbook`;

    status("Test de l’API Workbook Microsoft Graph…");
    let sessionId="";
    try{
      const sess=await fetchGraph(token,`${base}/createSession`,{
        method:"POST",body:{persistChanges:true}
      });
      sessionId=sess?.id||"";
      check("API Workbook / session persistante",true,sessionId?"Session créée":"Mode sans session");
    }catch(err){
      check("API Workbook / session persistante",false,String(err.message||err));
      throw new Error(
        "Le fichier ne passe pas le test Workbook Microsoft Graph. "+
        "Ne passe pas en production tant que ce test échoue. "+String(err.message||err)
      );
    }

    status("Vérification des tables techniques…");
    let allOk=true;
    for(const tableName of requiredTables){
      try{
        const info=await fetchGraph(token,`${base}/tables/${encodeURIComponent(tableName)}`,{sessionId});
        check(tableName,true,info?.name||"");
      }catch(err){
        allOk=false;
        check(tableName,false,String(err.message||err));
      }
    }
    if(!allOk) throw new Error("Une ou plusieurs tables tblApp_* sont absentes. Installe d'abord le module Excel Direct V1.2.");

    status("Association du compte administrateur…");
    const binding=await bindAdmin(token,driveId,itemId,sessionId,adminAgentCode,email);
    check("Association administrateur",binding.ok,binding.detail);
    if(!binding.ok) throw new Error("Association administrateur impossible : "+binding.detail);

    const config=`/*
 * Généré par setup.html le ${new Date().toLocaleString("fr-FR")}
 * Ne contient aucun client secret.
 */
window.GARDES_PRODUCTION = {
  configured: true,
  tenantId: ${JSON.stringify(tenantId)},
  clientId: ${JSON.stringify(clientId)},
  driveId: ${JSON.stringify(driveId)},
  itemId: ${JSON.stringify(itemId)},
  workbookName: ${JSON.stringify(item.name||"")},
  adminEmails: [${JSON.stringify(email)}],
  bootstrapAdminAgentCode: ${JSON.stringify(adminAgentCode)},
  maxExcelSyncAgeMinutes: 5
};
`;

    $("#generatedConfig").value=config;
    $("#resultCard").classList.remove("hidden");
    status("Tous les contrôles sont réussis. La configuration de production peut être publiée.","ok");
  }catch(err){
    console.error(err);
    status(String(err.message||err),"err");
  }
}

$("#btnTest").addEventListener("click",run);

$("#btnCopy").addEventListener("click",async()=>{
  await navigator.clipboard.writeText($("#generatedConfig").value);
  status("Configuration copiée dans le presse-papiers.","ok");
});

$("#btnDownload").addEventListener("click",()=>{
  const blob=new Blob([$("#generatedConfig").value],{type:"text/javascript;charset=utf-8"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="production-config.js";
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});

try{
  const saved=JSON.parse(localStorage.getItem("gardes-prod-setup")||"null");
  if(saved){
    $("#tenantId").value=saved.tenantId||"";
    $("#clientId").value=saved.clientId||"";
    $("#shareUrl").value=saved.shareUrl||"";
    $("#adminAgentCode").value=saved.adminAgentCode||"CFa";
  }
}catch{}
})();
