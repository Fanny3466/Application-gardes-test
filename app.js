(function(){
"use strict";
const C = window.GARDES_CONFIG;
const P = window.GARDES_PROFILE;
const R = window.GardesRepositories;
const {dateOnly,norm} = R;

const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];

const state={
  repo:null,user:null,agents:[],slots:[],assignments:[],publications:[],locks:[],
  allAvailability:[],
  selectedAgent:null,
  selectedDay:"",
  selectedBlock:C.ui.availabilityDefaultBlock,
  guardDay:"",
  guardBlock:C.ui.availabilityDefaultBlock,
  chefDay:"",
  chefBlock:C.ui.availabilityDefaultBlock,
  role:"AGENT",
  busy:false,
  lastSync:null,
  excelSync:null,
  pendingSubmissions:0,
  health:null
};

function esc(s=""){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[m]));
}
function toast(message,type=""){
  const el=$("#toast");el.textContent=message;el.className=`toast show ${type}`;
  clearTimeout(el._timer);el._timer=setTimeout(()=>el.className="toast",2500);
}
function busy(on,text="Synchronisation…"){
  state.busy=on;$("#loaderText").textContent=text;$("#loader").classList.toggle("hidden",!on);
}
function setLastSync(){
  state.lastSync=new Date();

  const raw=state.excelSync?.timestamp||"";
  const dt=raw ? new Date(raw) : null;
  const valid=dt && !Number.isNaN(dt.valueOf());

  $("#btnSyncMini").textContent=valid
    ? `Excel : ${dt.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}${state.pendingSubmissions?` · ${state.pendingSubmissions} en attente`:""}`
    : `Actualisé : ${state.lastSync.toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"})}`;
}
function standalone(){
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone===true;
}
function isOnline(){ return navigator.onLine; }
function fmtDate(iso){
  const d=new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR",{weekday:"short",day:"2-digit",month:"2-digit"}).format(d);
}
function fmtDateLong(iso){
  const d=new Date(`${iso}T12:00:00`);
  return new Intl.DateTimeFormat("fr-FR",{weekday:"long",day:"2-digit",month:"long"}).format(d);
}
function hourLabel(slot){
  const h=String(slot.HeureDebut||"").slice(0,5);
  return h.replace(":00","h");
}
function statusMeta(value,replCode=""){
  if(replCode) return {label:"Remplaçant",icon:"🔁",className:"replacement"};
  const n=norm(value);
  if(!n || n==="0") return {label:"Non renseigné",icon:"·",className:"unset"};
  if(["1","TRUE","VRAI","OUI","DISPO","DISPONIBLE","X"].includes(n)) return {label:"Disponible",icon:"✓",className:"ok"};
  const catalog=P.statusCatalog.find(s=>norm(s.value)===n);
  return catalog ? {label:catalog.label,icon:catalog.icon,className:catalog.className} : {label:String(value),icon:"↔",className:"replacement"};
}
function isAvailableValue(value,replCode=""){
  if(replCode) return true;
  const n=norm(value);
  if(["1","TRUE","VRAI","OUI","DISPO","DISPONIBLE","X"].includes(n)) return true;
  if(!n) return false;
  return !P.unavailableValues.includes(n);
}
function getRole(agent){
  const role=norm(agent?.Role||"");
  if(["ADMIN","CHEF","ADJOINT"].includes(role)) return role;
  const email=norm(state.user?.email);
  if(C.roles.adminEmails.map(norm).includes(email)) return "ADMIN";
  if(C.roles.chefAdjointEmails.map(norm).includes(email)) return "CHEF";
  return "AGENT";
}
function canManage(){ return ["ADMIN","CHEF","ADJOINT"].includes(state.role); }
function canAdmin(){ return state.role==="ADMIN"; }

async function init(){
  const bootFallback=document.getElementById("bootFallback");
  if(bootFallback) bootFallback.remove();
  $("#versionText").textContent=`V${C.version}`;
  $("#teamText").textContent=C.ui.defaultTeam;
  $("#envText").textContent=C.environment;
  $("#envDot").classList.toggle("prod",norm(C.environment)==="PRODUCTION");
  $("#modePill").textContent=
    C.mode==="demo" ? "MODE DÉMONSTRATION" :
    C.mode==="excel-direct" ? "PRODUCTION · EXCEL DIRECT" :
    "MICROSOFT 365 CONNECTÉ";

  if(C.mode==="excel-direct" && !C.productionReady){
    bindStatic();
    $("#loginScreen").classList.remove("hidden");
    $("#appShell").classList.add("hidden");
    $("#loginTitle").textContent="Configuration production requise";
    $("#loginDetail").textContent="Le site est prêt, mais les identifiants Microsoft 365 et Excel n'ont pas encore été injectés.";
    $("#btnMicrosoftLogin").classList.add("hidden");
    $("#setupProductionLink").classList.remove("hidden");
    busy(false);
    return;
  }

  state.repo =
      C.mode==="demo" ? new R.DemoRepository() :
      C.mode==="excel-direct" ? new R.ExcelDirectRepository() :
      new R.GraphRepository();

  bindStatic();
  updateOnlineState();
  window.addEventListener("online",updateOnlineState);
  window.addEventListener("offline",updateOnlineState);

  busy(true,"Initialisation…");
  try{
    await state.repo.init();

    if(C.mode==="m365" || C.mode==="excel-direct"){
      state.user=await state.repo.getCurrentUser();
      if(!state.user){
        $("#loginScreen").classList.remove("hidden");
        $("#appShell").classList.add("hidden");
        return;
      }
    }else{
      state.user=await state.repo.signIn();
    }

    await enterApp();
  }catch(err){
    console.error(err);
    toast(err.message,"error");
    if(C.mode==="m365" || C.mode==="excel-direct"){
      $("#loginScreen").classList.remove("hidden");
      $("#appShell").classList.add("hidden");
    }
  }finally{
    busy(false);
  }

  if("serviceWorker" in navigator){
    navigator.serviceWorker.register("./sw.js?v=2.2.0").catch(console.warn);
  }
}

async function enterApp(){
  $("#loginScreen").classList.add("hidden");
  $("#appShell").classList.remove("hidden");
  await refreshData(false);
  selectInitialAgent();

  if(C.mode==="excel-direct" && !state.selectedAgent){
    $("#appShell").classList.add("hidden");
    $("#loginScreen").classList.remove("hidden");
    $("#loginTitle").textContent="Compte non associé";
    $("#loginDetail").textContent=`Le compte ${state.user?.email||""} n'est associé à aucun agent. Renseigne cette adresse dans la colonne Email de tblApp_Agents.`;
    $("#btnMicrosoftLogin").textContent="Changer de compte Microsoft 365";
    $("#btnMicrosoftLogin").classList.remove("hidden");
    $("#setupProductionLink").classList.add("hidden");
    return;
  }

  configureRole();
  renderAll();
  maybeShowInstallTip();
}

async function refreshData(showToast=true){
  busy(true,"Actualisation des données…");
  try{
    const [agents,slots,assignments,publications,locks,availability,syncInfo] = await Promise.all([
      state.repo.getAgents(),
      state.repo.getSlots(),
      state.repo.getAssignments(),
      state.repo.getPublications(),
      state.repo.getLocks(),
      state.repo.getAllAvailability(),
      state.repo.getLastSyncInfo ? state.repo.getLastSyncInfo() : Promise.resolve(null)
    ]);
    state.agents=agents.filter(a=>a.Actif!==false && norm(a.Actif)!=="FALSE");
    state.slots=slots.filter(s=>s.Actif!==false && norm(s.Actif)!=="FALSE");
    state.assignments=assignments;
    state.publications=publications;
    state.locks=locks;
    state.allAvailability=availability;
    state.excelSync=syncInfo;
    state.pendingSubmissions=Number(syncInfo?.pending||0);
    setLastSync();
    if(showToast) toast("Données actualisées","success");
  }catch(err){
    console.error(err);toast(err.message,"error");
  }finally{busy(false)}
}

function canBootstrapAdmin(email){
  return !!(
    email &&
    C.roles.adminEmails.map(norm).includes(norm(email)) &&
    C.bootstrap?.adminAgentCode
  );
}

function selectInitialAgent(){
  const saved=localStorage.getItem("gardes-v2-agent");
  let matched=null;

  if((C.mode==="m365" || C.mode==="excel-direct") && C.ui.autoSelectAgentFromEmail && state.user?.email){
    matched=state.agents.find(a=>norm(a.Email)===norm(state.user.email));

    if(!matched && canBootstrapAdmin(state.user.email)){
      matched=state.agents.find(a=>norm(a.Code)===norm(C.bootstrap.adminAgentCode));
    }
  }else{
    if(saved) matched=state.agents.find(a=>String(a.Code)===saved);
    if(!matched) matched=state.agents[0];
  }

  state.selectedAgent=matched||null;
  if(state.selectedAgent) localStorage.setItem("gardes-v2-agent",state.selectedAgent.Code);
  state.role=getRole(state.selectedAgent);
}

function configureRole(){
  state.role=getRole(state.selectedAgent);
  const manage=canManage();
  $("#navChef").classList.toggle("hidden",!manage);
  $("#shortcutChef").classList.toggle("hidden",!manage);
  $("#navAdmin").classList.toggle("hidden",!canAdmin());
  $("#shortcutAdmin").classList.toggle("hidden",!canAdmin());

  const hideSelector=
    (C.mode==="m365" || C.mode==="excel-direct") &&
    C.ui.hideAgentSelectorForMatchedM365User &&
    state.selectedAgent &&
    (
      norm(state.selectedAgent.Email)===norm(state.user?.email) ||
      canBootstrapAdmin(state.user?.email)
    );

  $("#agentCard").classList.toggle("hidden",hideSelector);
}

function bindStatic(){
  $("#btnMicrosoftLogin").addEventListener("click",()=>state.repo.signIn());
  $("#btnRefreshTop").addEventListener("click",()=>refreshAndRender());
  $("#btnGuardRefresh").addEventListener("click",()=>refreshAndRender("guard"));
  $("#btnChefRefresh").addEventListener("click",()=>refreshAndRender("chef"));
  $("#btnSyncMini").addEventListener("click",()=>refreshAndRender());
  $("#btnUser").addEventListener("click",openUserDialog);

  $$("[data-screen]").forEach(btn=>btn.addEventListener("click",()=>showScreen(btn.dataset.screen)));
  $$("[data-close]").forEach(btn=>btn.addEventListener("click",()=>$("#"+btn.dataset.close).close()));

  $("#agentSelect").addEventListener("change",e=>{
    state.selectedAgent=state.agents.find(a=>String(a.Code)===e.target.value)||null;
    if(state.selectedAgent) localStorage.setItem("gardes-v2-agent",state.selectedAgent.Code);
    configureRole();renderHome();renderAvailability();
  });

  $("#dismissInstallTip").addEventListener("click",()=>{
    localStorage.setItem("gardes-v2-install-tip-hidden","1");
    $("#installTip").classList.add("hidden");
  });

  $("#dayScrollArrow").addEventListener("click",()=>{
    $("#dayTabs").scrollBy({left:230,behavior:"smooth"});
  });

  $("#btnWholeBlock").addEventListener("click",applyWholeBlockAvailable);
  $("#guardDateSelect").addEventListener("change",e=>{state.guardDay=e.target.value;renderGuard()});
  $("#guardBlockSelect").addEventListener("change",e=>{state.guardBlock=e.target.value;renderGuard()});
  $("#chefDateSelect").addEventListener("change",e=>{state.chefDay=e.target.value;renderChef()});
  $("#chefBlockSelect").addEventListener("change",e=>{state.chefBlock=e.target.value;renderChef()});
  $("#btnChefLock").addEventListener("click",toggleLock);
  $("#btnChefPublish").addEventListener("click",publishGuard);
  $("#btnRunDiagnostics").addEventListener("click",renderDiagnostics);
  $("#btnClearDemoData").addEventListener("click",clearDemoData);
  $("#btnLogout").addEventListener("click",()=>state.repo.signOut());
}

function updateOnlineState(){
  const online=isOnline();
  $("#onlineDot").classList.toggle("offline",!online);
  $("#connectionText").textContent=online ? (C.mode==="demo"?"En ligne · données locales":"En ligne · Excel / Microsoft 365") : "Hors ligne";
}

async function refreshAndRender(screen=""){
  await refreshData(true);
  selectInitialAgent();
  configureRole();
  renderAll();
  if(screen) showScreen(screen);
}

function showScreen(name){
  $$(".screen").forEach(s=>s.classList.toggle("active",s.id===`screen-${name}`));
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.screen===name));
  if(name==="availability") renderAvailability();
  if(name==="guard") renderGuard();
  if(name==="chef") renderChef();
  if(name==="admin") renderAdmin();
  window.scrollTo({top:0,behavior:"smooth"});
}

function maybeShowInstallTip(){
  const hidden=localStorage.getItem("gardes-v2-install-tip-hidden")==="1";
  const show=C.ui.showInstallHelpInBrowser && !standalone() && !hidden;
  $("#installTip").classList.toggle("hidden",!show);
}

function renderAll(){
  renderHome();
  renderAvailability();
  renderGuard();
  if(canManage()) renderChef();
  if(canAdmin()) renderAdmin();
}

function renderHome(){
  const select=$("#agentSelect");
  select.innerHTML=state.agents.map(a=>`<option value="${esc(a.Code)}">${esc(a.Title)}</option>`).join("");
  if(state.selectedAgent) select.value=state.selectedAgent.Code;

  const a=state.selectedAgent;
  $("#agentMeta").innerHTML=a ? [
    `<span class="meta-chip">${esc(a.Code||"")}</span>`,
    a.Fonctions?`<span class="meta-chip">${esc(a.Fonctions)}</span>`:"",
    `<span class="meta-chip">${esc(state.role)}</span>`
  ].join("") : "";

  const initials=(a?.Title||state.user?.name||"AG").split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase();
  $("#btnUser").textContent=initials||"AG";
}

function availableDays(){
  return [...new Set(state.slots.map(s=>s.DateGarde||dateOnly(s.Date)).filter(Boolean))].sort();
}
function slotsFor(day,block){
  return state.slots
    .filter(s=>(s.DateGarde||dateOnly(s.Date))===day && (!block || s.Bloc===block))
    .sort((a,b)=>(Number(a.Ordre)||0)-(Number(b.Ordre)||0));
}
function availabilityFor(agentCode){
  return state.allAvailability.filter(v=>norm(v.AgentCode)===norm(agentCode));
}
function availabilityMap(agentCode){
  return Object.fromEntries(availabilityFor(agentCode).map(v=>[String(v.CreneauId),v]));
}

function renderAvailability(){
  if(!state.selectedAgent){
    $("#slotList").innerHTML='<div class="card">Aucun agent sélectionné.</div>';return;
  }
  const days=availableDays();
  if(!days.length){$("#slotList").innerHTML='<div class="card">Aucun créneau disponible.</div>';return}
  if(!state.selectedDay || !days.includes(state.selectedDay)) state.selectedDay=days[0];

  $("#dayTabs").innerHTML=days.map(d=>{
    const dt=new Date(`${d}T12:00:00`);
    const wd=new Intl.DateTimeFormat("fr-FR",{weekday:"short"}).format(dt);
    const dm=new Intl.DateTimeFormat("fr-FR",{day:"2-digit",month:"2-digit"}).format(dt);
    return `<button class="day-tab ${d===state.selectedDay?"active":""}" data-day="${d}"><b>${esc(wd)}</b><small>${esc(dm)}</small></button>`;
  }).join("");
  $$("#dayTabs [data-day]").forEach(b=>b.addEventListener("click",()=>{state.selectedDay=b.dataset.day;renderAvailability()}));

  const blocks=P.blockOrder.filter(b=>slotsFor(state.selectedDay,b).length);
  if(!blocks.includes(state.selectedBlock)) state.selectedBlock=blocks[0]||"";
  $("#blockTabs").innerHTML=blocks.map(b=>`<button class="block-chip ${b===state.selectedBlock?"active":""}" data-block="${esc(b)}">${esc(b)}</button>`).join("");
  $$("#blockTabs [data-block]").forEach(b=>b.addEventListener("click",()=>{state.selectedBlock=b.dataset.block;renderAvailability()}));

  const map=availabilityMap(state.selectedAgent.Code);
  const slots=slotsFor(state.selectedDay,state.selectedBlock);
  const filled=slots.filter(s=>map[String(s.CreneauId||s.id)]?.Valeur || map[String(s.CreneauId||s.id)]?.RemplacantCode).length;
  const pct=slots.length?Math.round(filled/slots.length*100):0;
  $("#availabilityProgressText").textContent=`${filled} / ${slots.length} heures renseignées · ${state.selectedBlock||"—"}`;
  $("#availabilityProgressPct").textContent=`${pct}%`;
  $("#btnWholeBlock").textContent=`✓ Toute ${state.selectedBlock||"la plage"}`;

  $("#slotList").innerHTML=slots.map(s=>{
    const id=String(s.CreneauId||s.id);
    const v=map[id]||{};
    const meta=statusMeta(v.Valeur,v.RemplacantCode);
    const repl=v.RemplacantNom || (v.RemplacantCode ? state.agents.find(a=>norm(a.Code)===norm(v.RemplacantCode))?.Title : "");
    return `<button class="slot-card ${meta.className}" data-slot="${esc(id)}">
      <div class="slot-time"><b>${esc(hourLabel(s))}</b><small>${esc(String(s.HeureFin||"").slice(0,5).replace(":59","h59"))}</small></div>
      <div class="slot-status"><span class="status-icon">${meta.icon}</span><span class="slot-status-text"><b>${esc(meta.label)}</b><small>${repl?`Remplacé par ${esc(repl)}`:"Touchez pour modifier"}</small></span></div>
      <span class="slot-chevron">›</span>
    </button>`;
  }).join("");

  $$("#slotList [data-slot]").forEach(b=>b.addEventListener("click",()=>openStatusDialog(b.dataset.slot)));
}

function openStatusDialog(slotId){
  const dlg=$("#statusDialog");
  dlg.dataset.slot=slotId;
  $("#statusDialogList").innerHTML=P.statusCatalog.map(s=>`<button class="picker-btn" data-status="${esc(s.value)}"><b>${s.icon} ${esc(s.label)}</b></button>`).join("")+
    `<button class="picker-btn destructive" data-status="CLEAR"><b>Effacer la réponse</b></button>`;
  $$("#statusDialogList [data-status]").forEach(b=>b.addEventListener("click",async()=>{
    const value=b.dataset.status;
    if(value==="REMPLACANT"){dlg.close();openReplacementDialog(slotId);return}
    await saveSlot(slotId,value==="CLEAR"?"":value,"","");
    dlg.close();
  }));
  dlg.showModal();
}

function openReplacementDialog(slotId){
  const dlg=$("#replacementDialog");
  $("#replacementDialogList").innerHTML=state.agents.filter(a=>a.Code!==state.selectedAgent?.Code).map(a=>
    `<button class="picker-btn" data-repl="${esc(a.Code)}"><b>${esc(a.Title)}</b><small>${esc(a.Fonctions||"")} · ${esc(a.Code)}</small></button>`
  ).join("");
  $$("#replacementDialogList [data-repl]").forEach(b=>b.addEventListener("click",async()=>{
    const a=state.agents.find(x=>x.Code===b.dataset.repl);
    await saveSlot(slotId,a?.Code||"",a?.Code||"",a?.Title||"");
    dlg.close();
  }));
  dlg.showModal();
}

async function saveSlot(slotId,value,replCode,replName){
  const slot=state.slots.find(s=>String(s.CreneauId||s.id)===String(slotId));
  if(!slot || !state.selectedAgent) return;

  if(C.mode==="excel-direct" &&
     norm(state.selectedAgent.Email)!==norm(state.user?.email) &&
     !canBootstrapAdmin(state.user?.email) &&
     !(canAdmin() && C.ui.allowAdminEditAgents)){
    toast("Tu ne peux modifier que tes propres disponibilités.","error");
    return;
  }

  busy(true,"Enregistrement dans Excel…");
  try{
    const normalizedValue =
      value==="DISPO" ? "1" :
      value;

    await state.repo.saveAvailability({
      AgentCode:state.selectedAgent.Code,
      AgentNom:state.selectedAgent.Title,
      CreneauId:String(slot.CreneauId||slot.id),
      DateGarde:slot.DateGarde||"",
      Date:dateOnly(slot.Date),
      HeureDebut:slot.HeureDebut||"",
      Valeur:normalizedValue,
      RemplacantCode:replCode||"",
      RemplacantNom:replName||""
    });
    state.allAvailability=await state.repo.getAllAvailability();
    renderAvailability();
    if(canManage()) renderChef();
    toast("Disponibilité enregistrée","success");
  }catch(err){console.error(err);toast(err.message,"error")}
  finally{busy(false)}
}

async function applyWholeBlockAvailable(){
  const slots=slotsFor(state.selectedDay,state.selectedBlock);
  if(!slots.length || !state.selectedAgent) return;
  busy(true,`Mise à jour de ${state.selectedBlock}…`);
  try{
    const payloads=slots.map(slot=>({
      AgentCode:state.selectedAgent.Code,
      AgentNom:state.selectedAgent.Title,
      CreneauId:String(slot.CreneauId||slot.id),
      DateGarde:slot.DateGarde||"",
      Date:dateOnly(slot.Date),
      HeureDebut:slot.HeureDebut||"",
      Valeur:"1",RemplacantCode:"",RemplacantNom:""
    }));

    if(state.repo.saveAvailabilityBatch) await state.repo.saveAvailabilityBatch(payloads);
    else for(const payload of payloads) await state.repo.saveAvailability(payload);
    state.allAvailability=await state.repo.getAllAvailability();
    renderAvailability();
    toast("Toute la plage est disponible","success");
  }catch(err){toast(err.message,"error")}
  finally{busy(false)}
}

function assignmentDays(){
  return [...new Set(state.assignments.map(a=>a.DateGarde||dateOnly(a.Date)).filter(Boolean))].sort();
}
function assignmentBlocks(day){
  const values=[...new Set(state.assignments.filter(a=>(a.DateGarde||dateOnly(a.Date))===day).map(a=>a.Bloc).filter(Boolean))];
  return P.blockOrder.filter(b=>values.includes(b)).concat(values.filter(b=>!P.blockOrder.includes(b)));
}
function renderGuard(){
  const days=assignmentDays();
  if(!days.length){
    $("#guardGrid").innerHTML='<div class="card">Aucune affectation publiée.</div>';return;
  }
  if(!state.guardDay || !days.includes(state.guardDay)) state.guardDay=days[0];
  const blocks=assignmentBlocks(state.guardDay);
  if(!state.guardBlock || !blocks.includes(state.guardBlock)) state.guardBlock=blocks[0]||"";

  $("#guardDateSelect").innerHTML=days.map(d=>`<option value="${d}">${esc(fmtDateLong(d))}</option>`).join("");
  $("#guardDateSelect").value=state.guardDay;
  $("#guardBlockSelect").innerHTML=blocks.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join("");
  $("#guardBlockSelect").value=state.guardBlock;

  const rows=state.assignments.filter(a=>
    (a.DateGarde||dateOnly(a.Date))===state.guardDay &&
    a.Bloc===state.guardBlock &&
    (a.Publie===true || norm(a.Publie)==="TRUE" || C.mode==="demo")
  );
  const byKey={};
  rows.forEach(a=>{byKey[`${norm(a.Piquet)}|${norm(a.Role)}`]=a});

  const structures=C.ui.showEmptyGuardRoles
    ? P.guardStructure
    : P.guardStructure.filter(v=>rows.some(a=>norm(a.Piquet)===norm(v.key)||norm(a.Piquet)===norm(v.vehicle)));

  $("#guardGrid").innerHTML=structures.map(v=>{
    const crew=v.roles.map(role=>{
      const a=byKey[`${norm(v.key)}|${norm(role)}`] || byKey[`${norm(v.vehicle)}|${norm(role)}`];
      const name=a?.AgentNom||"";
      return `<div class="crew-row">
        <span class="crew-role">${esc(role)}</span>
        <span class="crew-name ${name?"":"crew-empty"}">${name?esc(name):"— À compléter —"}</span>
        ${a?.Partiel===true||norm(a?.Partiel)==="TRUE"?'<span class="partial-chip">partiel</span>':"<span></span>"}
      </div>`;
    }).join("");
    return `<section class="vehicle-card" style="--vehicle-color:${v.color}">
      <div class="vehicle-header"><strong>${esc(v.vehicle)}</strong><span>${esc(state.guardBlock)}</span></div>
      ${crew}
    </section>`;
  }).join("");

  const pub=[...state.publications].sort((a,b)=>String(b.PublishedAt||"").localeCompare(String(a.PublishedAt||"")))[0];
  $("#guardPublicationText").textContent=pub?.PublishedAt
    ? `Dernière publication : ${new Date(pub.PublishedAt).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})}`
    : "Dernière publication : données de démonstration";
}

function renderChef(){
  if(!canManage()) return;
  const days=availableDays();
  if(!days.length) return;
  if(!state.chefDay || !days.includes(state.chefDay)) state.chefDay=days[0];
  const blocks=P.blockOrder.filter(b=>slotsFor(state.chefDay,b).length);
  if(!state.chefBlock || !blocks.includes(state.chefBlock)) state.chefBlock=blocks[0]||"";

  $("#chefDateSelect").innerHTML=days.map(d=>`<option value="${d}">${esc(fmtDateLong(d))}</option>`).join("");
  $("#chefDateSelect").value=state.chefDay;
  $("#chefBlockSelect").innerHTML=blocks.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join("");
  $("#chefBlockSelect").value=state.chefBlock;

  const slots=slotsFor(state.chefDay,state.chefBlock);
  const maps={};
  state.agents.forEach(a=>maps[a.Code]=availabilityMap(a.Code));

  const potentials=slots.map(slot=>{
    const id=String(slot.CreneauId||slot.id);
    return state.agents.filter(a=>{
      const v=maps[a.Code]?.[id]||{};
      return isAvailableValue(v.Valeur,v.RemplacantCode);
    }).length;
  });

  $("#potentialStrip").innerHTML=slots.map((s,i)=>`<div class="potential"><small>${esc(hourLabel(s))}</small><b>${potentials[i]}</b></div>`).join("");

  $("#chefMatrix").innerHTML=`<thead><tr><th>Agent</th>${slots.map(s=>`<th>${esc(hourLabel(s))}</th>`).join("")}</tr></thead><tbody>`+
    state.agents.map(a=>`<tr>
      <td><b>${esc(a.Title)}</b><small>${esc(a.Fonctions||"")}</small></td>
      ${slots.map(s=>{
        const id=String(s.CreneauId||s.id);
        const v=maps[a.Code]?.[id]||{};
        const meta=statusMeta(v.Valeur,v.RemplacantCode);
        return `<td><i class="matrix-mark ${meta.className}" title="${esc(meta.label)}">${meta.icon}</i></td>`;
      }).join("")}
    </tr>`).join("")+"</tbody>";

  const lock=currentLock(state.chefDay,state.chefBlock);
  $("#lockBadge").textContent=lock ? "Verrouillé" : "Non verrouillé";
  $("#btnChefLock").textContent=lock ? "🔓 Déverrouiller" : "🔒 Verrouiller";
}

function currentLock(day,block){
  return state.locks.find(l=>
    norm(l.Scope)==="PLANNING" &&
    dateOnly(l.Date)===day &&
    norm(l.Bloc)===norm(block) &&
    (l.Locked===true || norm(l.Locked)==="TRUE")
  );
}

async function toggleLock(){
  if(!canManage()) return;
  const locked=!!currentLock(state.chefDay,state.chefBlock);
  busy(true,locked?"Déverrouillage…":"Verrouillage…");
  try{
    await state.repo.setLock("PLANNING",state.chefDay,state.chefBlock,!locked,state.user?.email||"");
    state.locks=await state.repo.getLocks();
    renderChef();
    toast(locked?"Plage déverrouillée":"Plage verrouillée","success");
  }catch(err){toast(err.message,"error")}
  finally{busy(false)}
}

async function publishGuard(){
  if(!canManage()) return;
  if(!confirm(`Publier et geler la garde du ${fmtDateLong(state.chefDay)} · ${state.chefBlock} ?`)) return;
  const rows=state.assignments.filter(a=>
    (a.DateGarde||dateOnly(a.Date))===state.chefDay &&
    a.Bloc===state.chefBlock
  );
  busy(true,"Publication…");
  try{
    await state.repo.publish("GARDE",{
      dateDebut:state.chefDay,dateFin:state.chefDay,bloc:state.chefBlock,
      assignments:rows
    },state.user?.email||"");
    state.publications=await state.repo.getPublications();
    toast("Demande de publication envoyée à Excel","success");
    renderGuard();
  }catch(err){toast(err.message,"error")}
  finally{busy(false)}
}

function renderAdmin(){
  if(!canAdmin()) return;
  $("#adminStats").innerHTML=[
    ["Mode",C.mode==="demo"?"DÉMO":"EXCEL DIRECT"],
    ["Agents",state.agents.length],
    ["Créneaux",state.slots.length],
    ["Affectations",state.assignments.length],
    ["Dispos",state.allAvailability.length],
    ["Saisies attente",state.pendingSubmissions],
    ["Version",C.version],
    ["Utilisateur",state.user?.email||"local"],
    ["Rôle",state.role]
  ].map(([a,b])=>`<div class="stat-card"><small>${esc(a)}</small><b>${esc(b)}</b></div>`).join("");
  renderDiagnostics();
}

async function renderDiagnostics(){
  const tests=[
    ["Application HTTPS",location.protocol==="https:"||location.hostname==="localhost"],
    ["Mode PRODUCTION",norm(C.environment)==="PRODUCTION"],
    ["Configuration chargée",C.productionReady===true],
    ["Service Worker","serviceWorker" in navigator],
    ["Connexion réseau",navigator.onLine],
    ["Agents Excel",state.agents.length>0],
    ["Créneaux Excel",state.slots.length>0],
    ["Affectations Excel",state.assignments.length>0],
    ["Compte associé",!!state.selectedAgent]
  ];

  if(C.mode==="excel-direct"){
    tests.push(["Tenant Microsoft configuré",!!C.microsoft365.tenantId]);
    tests.push(["Client ID configuré",!!C.microsoft365.clientId]);
    tests.push(["Drive ID configuré",!!C.excelDirect.driveId]);
    tests.push(["Item ID configuré",!!C.excelDirect.itemId]);

    try{
      state.health=await state.repo.healthCheck();
      const tableValues=Object.values(state.health.tables||{});
      tests.push(["Fichier Excel accessible",!!state.health.file?.id]);
      tests.push(["Toutes les tables tblApp_* accessibles",tableValues.length>0 && tableValues.every(x=>x.ok)]);

      const syncRaw=state.health.sync?.timestamp||"";
      const syncDate=syncRaw ? new Date(syncRaw) : null;
      const ageMin=syncDate && !Number.isNaN(syncDate.valueOf())
        ? (Date.now()-syncDate.getTime())/60000
        : Infinity;

      tests.push([
        `Synchro Excel < ${C.excelDirect.maxExcelSyncAgeMinutes} min`,
        ageMin <= C.excelDirect.maxExcelSyncAgeMinutes
      ]);
    }catch(err){
      console.error(err);
      tests.push(["Test Microsoft Graph / Excel",false]);
    }
  }

  $("#diagnosticList").innerHTML=tests.map(([name,ok])=>
    `<div class="diag-row"><span>${esc(name)}</span><span class="${ok?"diag-ok":"diag-warn"}">${ok?"OK":"À vérifier"}</span></div>`
  ).join("");
}

function clearDemoData(){
  if(C.mode!=="demo"){toast("Disponible uniquement en mode démo","error");return}
  if(!confirm("Effacer toutes les disponibilités enregistrées en démonstration ?")) return;
  localStorage.removeItem("gardes-v2-demo");
  location.reload();
}

function openUserDialog(){
  const a=state.selectedAgent;
  $("#userDialogContent").innerHTML=`
    <div class="card" style="box-shadow:none;margin:0">
      <b>${esc(a?.Title||state.user?.name||"Utilisateur")}</b>
      <p style="font-size:11px;color:#667786">${esc(state.user?.email||"Mode démonstration")}</p>
      <div class="agent-meta"><span class="meta-chip">${esc(state.role)}</span><span class="meta-chip">${esc(C.mode)}</span></div>
    </div>`;
  $("#userDialog").showModal();
}

document.addEventListener("DOMContentLoaded",()=>init().catch(err=>{console.error(err);toast(err.message,"error")}));
})();
