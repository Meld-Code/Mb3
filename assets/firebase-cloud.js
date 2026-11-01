// FreeForm cloud layer: Firebase Authentication + Realtime Database (JSON tree).
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, deleteUser } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getDatabase, ref, get, set, update, runTransaction, query, orderByChild, limitToLast } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';

let app, auth, db;
const ready = isFirebaseConfigured ? (() => {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app); db = getDatabase(app, firebaseConfig.databaseURL); return true;
})() : false;
const usernameKey = name => String(name).trim().toLowerCase();
function requireConfig(){ if(!ready) throw new Error('Firebase setup is incomplete. Add the exact web app config in firebase-config.js.'); }
function friendlyError(err){
  const map = {
    'auth/email-already-in-use':'That email is already registered.',
    'auth/invalid-email':'Enter a valid email address.',
    'auth/weak-password':'Choose a stronger password (at least 6 characters).',
    'auth/invalid-credential':'Email or password is incorrect.',
    'auth/user-not-found':'No account was found for that email.',
    'auth/wrong-password':'Email or password is incorrect.',
    'PERMISSION_DENIED':'Firebase denied this request. Check your Realtime Database Rules.',
    'permission-denied':'Firebase denied this request. Check your Realtime Database Rules.',
    'unavailable':'Firebase is temporarily unavailable. Check your internet connection.'
  };
  return map[err?.code] || err?.message || 'Something went wrong while contacting Firebase.';
}
async function createAccount({username,email,password}){
  requireConfig();
  const clean=String(username).trim(), key=usernameKey(clean), cleanEmail=String(email).trim();
  if(!/^[A-Za-z0-9_]{3,20}$/.test(clean)) throw new Error('Use 3–20 letters, numbers, or underscores for your username.');
  let cred;
  try {
    cred=await createUserWithEmailAndPassword(auth,cleanEmail,password);
    await updateProfile(cred.user,{displayName:clean});
    const nameRef=ref(db,`usernames/${key}`);
    const reservation=await runTransaction(nameRef,current=>current===null?{uid:cred.user.uid,username:clean,createdAt:Date.now()}:undefined);
    if(!reservation.committed){ await deleteUser(cred.user); throw new Error('That username is already taken. Try another one.'); }
    const userData={uid:cred.user.uid,username:clean,email:cleanEmail,avatar:{body:'#3976d2',head:'#f4c95d',legs:'#29343d'},createdAt:Date.now()};
    await set(ref(db,`users/${cred.user.uid}`),userData);
    localStorage.setItem('freeform.session',clean); return cred.user;
  } catch(e){ throw new Error(friendlyError(e)); }
}
async function signIn(email,password){
  requireConfig();
  try { const cred=await signInWithEmailAndPassword(auth,String(email).trim(),password); const snap=await get(ref(db,`users/${cred.user.uid}`)); const data=snap.val(); const username=data?.username||(cred.user.displayName||String(email).split('@')[0]); localStorage.setItem('freeform.session',username); return cred.user; }
  catch(e){ throw new Error(friendlyError(e)); }
}
async function signOutUser(){ if(ready) await signOut(auth); localStorage.removeItem('freeform.session'); }
async function getProfile(){ requireConfig(); const user=auth.currentUser; if(!user)return null; const snap=await get(ref(db,`users/${user.uid}`)); return snap.exists()?{...snap.val(),email:user.email,uid:user.uid}:null; }
async function saveAvatar(avatar){ requireConfig(); const user=auth.currentUser; if(!user)return false; await update(ref(db,`users/${user.uid}`),{avatar}); return true; }
async function addScore(game,points){
  requireConfig(); const user=auth.currentUser; if(!user)return false;
  const gameKey=String(game); const scoreRef=ref(db,`users/${user.uid}/scores/${gameKey}`);
  const profileSnap=await get(ref(db,`users/${user.uid}`)); const username=profileSnap.val()?.username||(user.displayName||'Player');
  const increment=Math.max(0,Number(points)||0);
  const result=await runTransaction(scoreRef,current=>({score:(Number(current?.score)||0)+increment,updatedAt:Date.now()}));
  const score=Number(result.snapshot.val()?.score)||0;
  await set(ref(db,`leaderboards/${gameKey}/players/${user.uid}`),{uid:user.uid,username,score,updatedAt:Date.now()});
  return true;
}
async function getLeaderboard(game){
  requireConfig(); const q=query(ref(db,`leaderboards/${String(game)}/players`),orderByChild('score'),limitToLast(8)); const snap=await get(q);
  const val=snap.val()||{}; return Object.values(val).map(d=>({name:d.username||'Player',score:Number(d.score)||0})).sort((a,b)=>b.score-a.score);
}
async function getScores(){
  requireConfig(); const user=auth.currentUser;if(!user)return{};const snap=await get(ref(db,`users/${user.uid}/scores`));const out={};const data=snap.val()||{};for(const [game,item] of Object.entries(data))out[game]=Number(item?.score)||0;return out;
}
if(ready){ onAuthStateChanged(auth,user=>{ if(user){ get(ref(db,`users/${user.uid}`)).then(s=>{if(s.exists())localStorage.setItem('freeform.session',s.val().username||user.displayName||'Player')}).catch(()=>{}); } }); }
window.FreeFormCloud={ready,createAccount,signIn,signOut:signOutUser,getProfile,saveAvatar,addScore,getLeaderboard,getScores,friendlyError};
if(ready) window.dispatchEvent(new CustomEvent('freeform-firebase-ready'));
if(!ready) window.dispatchEvent(new CustomEvent('freeform-firebase-status',{detail:{ready:false}}));
