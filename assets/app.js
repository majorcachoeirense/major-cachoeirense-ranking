(() => {
const $ = id => document.getElementById(id);
const state = { voterName:"", voterNick:"", selectedPlayer:null, ranking:new Map() };
const sections = ["identity","ranking","review","success"];
const players = PLAYERS.map(p=>p.trim()).filter(Boolean);

function show(name){ sections.forEach(id=>$(id).classList.toggle("hidden",id!==name)); window.scrollTo({top:0,behavior:"smooth"}); }

if(players.length<2 || new Set(players.map(p=>p.toLowerCase())).size!==players.length){
  $("identityError").textContent="A lista de players precisa ter pelo menos 2 nomes diferentes.";
  $("startBtn").disabled=true; return;
}

$("startBtn").onclick=()=>{
  const name=$("voterName").value.trim(), nick=$("voterNick").value.trim();
  $("identityError").textContent="";
  if(!name||!nick){$("identityError").textContent="Preencha seu nome e seu nick para continuar.";return;}
  state.voterName=name; state.voterNick=nick;
  renderPlayers(); renderPositions(); renderRanking(); show("ranking");
};

function renderPlayers(){
  const grid=$("playersGrid"); grid.innerHTML="";
  players.forEach(player=>{
    const b=document.createElement("button"); b.type="button"; b.className="player-card";
    const pos=state.ranking.get(player);
    b.innerHTML='<span class="player-name"></span><span class="player-pos">'+(pos?pos+"º":"—")+"</span>";
    b.querySelector(".player-name").textContent=player;
    b.onclick=()=>openPicker(player); grid.appendChild(b);
  });
}
function renderPositions(){
  const grid=$("positionsGrid"); grid.innerHTML="";
  players.forEach((_,i)=>{
    const b=document.createElement("button"); b.type="button"; b.className="position-btn";
    b.textContent=(i+1)+"º"; b.onclick=()=>assign(i+1); grid.appendChild(b);
  });
}
function openPicker(player){
  state.selectedPlayer=player; $("selectedPlayer").textContent=player;
  $("positionPicker").classList.remove("hidden"); updatePositionButtons();
  $("positionPicker").scrollIntoView({behavior:"smooth",block:"center"});
}
function updatePositionButtons(){
  const used=new Set([...state.ranking.entries()].filter(([p])=>p!==state.selectedPlayer).map(([,pos])=>pos));
  [...$("positionsGrid").children].forEach(b=>{
    const pos=Number(b.textContent.replace("º","").replace(" • ocupado",""));
    b.disabled=used.has(pos); b.classList.toggle("occupied",used.has(pos));
    b.textContent=used.has(pos)?`${pos}º • ocupado`:`${pos}º`;
  });
}
function assign(position){
  const player=state.selectedPlayer; if(!player)return;
  state.ranking.delete(player);
  for(const [p,pos] of [...state.ranking.entries()]) if(pos===position) state.ranking.delete(p);
  state.ranking.set(player,position); state.selectedPlayer=null;
  $("positionPicker").classList.add("hidden"); renderPlayers(); renderRanking();
}
$("cancelPick").onclick=()=>{state.selectedPlayer=null;$("positionPicker").classList.add("hidden");};
$("clearBtn").onclick=()=>{if(confirm("Limpar todo o ranking?")){state.ranking.clear();renderPlayers();renderRanking();}};

function renderRanking(){
  const list=$("rankingList"); list.innerHTML="";
  const byPos=new Map([...state.ranking.entries()].map(([p,pos])=>[pos,p]));
  players.forEach((_,i)=>{
    const pos=i+1,row=document.createElement("div");
    row.className="rank-row"+(byPos.has(pos)?" filled":"");
    row.innerHTML=`<span class="rank-number">${pos}º</span><span class="rank-player"></span>`;
    row.querySelector(".rank-player").textContent=byPos.get(pos)||"Ainda não definido";
    list.appendChild(row);
  });
  $("progress").textContent=`${state.ranking.size}/${players.length}`;
  $("reviewBtn").disabled=state.ranking.size!==players.length;
}
$("reviewBtn").onclick=()=>{
  if(state.ranking.size!==players.length){$("rankingError").textContent="Classifique todos os players antes de continuar.";return;}
  $("rankingError").textContent=""; renderReview(); show("review");
};
function renderReview(){
  $("reviewIdentity").textContent=`${state.voterName} • ${state.voterNick}`;
  const list=$("reviewList"); list.innerHTML="";
  const byPos=new Map([...state.ranking.entries()].map(([p,pos])=>[pos,p]));
  players.forEach((_,i)=>{
    const pos=i+1,row=document.createElement("div"); row.className="rank-row filled";
    row.innerHTML=`<span class="rank-number">${pos}º</span><span class="rank-player"></span>`;
    row.querySelector(".rank-player").textContent=byPos.get(pos); list.appendChild(row);
  });
}
$("backBtn").onclick=()=>show("ranking");
$("sendBtn").onclick=async()=>{
  const btn=$("sendBtn"), err=$("sendError"); err.textContent="";
  btn.disabled=true; btn.textContent="ENVIANDO...";
  const byPos=new Map([...state.ranking.entries()].map(([p,pos])=>[pos,p]));
  const ranking=players.map((_,i)=>byPos.get(i+1));
  try{
    const r=await fetch("/api/submit",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({voterName:state.voterName,voterNick:state.voterNick,ranking})});
    const data=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(data.error||"Não foi possível enviar o ranking.");
    show("success");
  }catch(e){err.textContent=e.message;btn.disabled=false;btn.textContent="ENVIAR RANKING";}
};
renderPlayers();
})();