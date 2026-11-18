
const $=id=>document.getElementById(id);
const state={mode:"quiz",round:0,current:null,clueIndex:0,revealed:false,paused:false,scores:{},votes:{A:0,B:0}};
let bank=null,toastTimer=null;
function toast(t){$("toast").textContent=t;$("toast").classList.add("show");clearTimeout(toastTimer);toastTimer=setTimeout(()=>$("toast").classList.remove("show"),2200)}
function save(){localStorage.setItem("rapLiveState",JSON.stringify(state))}
function restore(){try{const s=JSON.parse(localStorage.getItem("rapLiveState")||"{}");Object.assign(state,s)}catch(e){}}
async function init(){try{const r=await fetch("questions.json");bank=await r.json()}catch(e){toast("Impossible de charger la banque de questions.")}restore();$("brand").value=localStorage.getItem("rapLiveBrand")||"";render()}
function chooseMode(m){state.mode=m;document.querySelectorAll(".mode").forEach(b=>b.classList.toggle("selected",b.dataset.mode===m))}
function nextRound(){
 if(!bank){toast("Banque de questions indisponible");return}
 state.round++;state.revealed=false;state.clueIndex=0;state.votes={A:0,B:0};
 if(state.mode==="quiz"){const x=bank.quiz[Math.floor(Math.random()*bank.quiz.length)];state.current={...x,type:"quiz"}}
 if(state.mode==="guess"){const x=bank.guess[Math.floor(Math.random()*bank.guess.length)];state.current={...x,type:"guess"}}
 if(state.mode==="versus"){const x=bank.versus[Math.floor(Math.random()*bank.versus.length)];state.current={a:x[0],b:x[1],q:x[2],type:"versus"}}
 save();render();toast("Nouvelle manche lancée")}
function reveal(){if(!state.current){toast("Lance d'abord une manche");return}state.revealed=true;save();render()}
function nextClue(){if(state.current?.type!=="guess"){toast("Les indices sont disponibles en mode Devine");return}if(state.clueIndex<state.current.clues.length){state.clueIndex++;save();render()}else toast("Tous les indices sont affichés")}
function pause(){state.paused=!state.paused;save();$("pause").textContent=state.paused?"Reprendre":"Pause";toast(state.paused?"Régie en pause":"Régie active")}
function render(){
 $("roundCounter").textContent="MANCHE "+state.round;$("pause").textContent=state.paused?"Reprendre":"Pause";
 const c=state.current,v=$("roundView");
 if(!c){v.className="roundview empty";v.textContent="Choisis un format puis lance ta première manche."}
 else{
  v.className="roundview";let out=`<div class="roundtitle">${state.mode==="quiz"?"Quiz rap":state.mode==="guess"?"Devine le rappeur":"Rappeur VS rappeur"}</div>`;
  if(c.type==="quiz"){out+=`<div class="roundquestion">${esc(c.q)}</div>`+c.choices.map((x,i)=>`<div class="option">${String.fromCharCode(65+i)} · ${esc(x)}</div>`).join("");if(state.revealed)out+=`<div class="answer">Réponse : ${esc(c.choices[c.a])}<br><small>${esc(c.why)}</small></div>`}
  if(c.type==="guess"){out+=`<div class="roundquestion">Qui suis-je ?</div>`+c.clues.slice(0,state.clueIndex).map((x,i)=>`<div class="clue">Indice ${i+1} : ${esc(x)}</div>`).join("");if(state.revealed)out+=`<div class="answer">Réponse : ${esc(c.a)}</div>`}
  if(c.type==="versus"){out+=`<div class="roundquestion">${esc(c.q)}</div><div class="versus"><div>${esc(c.a)}<br><small>${state.votes.A} votes</small></div><b>VS</b><div>${esc(c.b)}<br><small>${state.votes.B} votes</small></div></div>`;if(state.revealed)out+=`<div class="answer">Résultat : ${state.votes.A===state.votes.B?"Égalité":state.votes.A>state.votes.B?esc(c.a):esc(c.b)}</div>`}
  v.innerHTML=out;
 }
 $("scores").innerHTML=Object.entries(state.scores).sort((a,b)=>b[1]-a[1]).map((x,i)=>`<div class="scoreline"><span>${["🥇","🥈","🥉"][i]||"•"} ${esc(x[0])}</span><strong>${x[1]} pt</strong></div>`).join("")||'<p class="hint">Le classement apparaîtra ici.</p>';
}
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function submitAnswer(){if(state.current?.type!=="quiz"||state.revealed){toast("Aucun quiz ouvert");return}const name=$("player").value.trim()||"Spectateur",answer=$("answer").value.trim();if(!answer){toast("Saisis une réponse");return}if(answer.toLocaleLowerCase("fr")===state.current.choices[state.current.a].toLocaleLowerCase("fr")){state.scores[name]=(state.scores[name]||0)+1;toast("Bonne réponse : +1 point")}else toast("Réponse enregistrée comme incorrecte");$("answer").value="";save();render()}
function vote(side){if(state.current?.type!=="versus"||state.revealed){toast("Lance un duel avant de voter");return}state.votes[side]++;save();render()}
$("saveBrand").addEventListener("click",()=>{localStorage.setItem("rapLiveBrand",$("brand").value.trim());toast("Nom de compte enregistré")});
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>chooseMode(b.dataset.mode)));
$("next").addEventListener("click",nextRound);$("reveal").addEventListener("click",reveal);$("clue").addEventListener("click",nextClue);$("pause").addEventListener("click",pause);
$("submitAnswer").addEventListener("click",submitAnswer);$("voteA").addEventListener("click",()=>vote("A"));$("voteB").addEventListener("click",()=>vote("B"));
$("clearScores").addEventListener("click",()=>{if(confirm("Effacer tout le classement ?")){state.scores={};save();render();toast("Classement effacé")}});
$("installHelp").addEventListener("click",()=>alert("Pour installer : dans Safari, touche Partager (carré avec flèche vers le haut), puis « Sur l’écran d’accueil », puis Ajouter."));
window.addEventListener("beforeunload",save);
init();
