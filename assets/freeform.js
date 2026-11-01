(() => {
  const KEYS={session:'freeform.session',accounts:'freeform.accounts',avatar:'freeform.avatar',scores:'freeform.scores'};
  const defaults={body:'#3976d2',head:'#f4c95d',legs:'#29343d'};
  const safeParse=(s,fallback)=>{try{return JSON.parse(s)||fallback}catch{return fallback}};
  const getSession=()=>localStorage.getItem(KEYS.session)||'';
  const getAvatar=()=>({...defaults,...safeParse(localStorage.getItem(KEYS.avatar),{})});
  const saveAvatar=a=>localStorage.setItem(KEYS.avatar,JSON.stringify(a));
  const getScores=()=>safeParse(localStorage.getItem(KEYS.scores),{});
  const addScore=(game,score)=>{const all=getScores(),name=getSession()||'Guest';all[game]??={};all[game][name]=Math.max(0,Number(all[game][name]||0)+Number(score||0));localStorage.setItem(KEYS.scores,JSON.stringify(all));};
  const getLeaderboard=(game)=>Object.entries(getScores()[game]||{}).map(([name,score])=>({name,score})).sort((a,b)=>b.score-a.score).slice(0,8);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  window.FreeForm={KEYS,defaults,getSession,getAvatar,saveAvatar,getScores,addScore,getLeaderboard,esc};
  document.querySelectorAll('[data-ff-username]').forEach(el=>el.textContent=getSession()||'Guest');
  document.querySelectorAll('[data-ff-signout]').forEach(el=>el.addEventListener('click',async()=>{try{if(window.FreeFormCloud?.signOut)await window.FreeFormCloud.signOut();else localStorage.removeItem(KEYS.session)}catch{}location.href='index.html'}));
})();