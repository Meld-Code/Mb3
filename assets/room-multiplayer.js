// FreeForm room presence and player-position sync.
// Only authenticated players are published; Firebase Rules must permit /rooms/<room>/players.
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getDatabase, ref, onValue, set, onDisconnect, remove } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';

export function connectRoom({THREE, scene, player, makeAvatar, label, room}) {
  if (!isFirebaseConfigured) { console.warn('FreeForm multiplayer: Firebase is not configured.'); return; }
  const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  const auth = getAuth(app), db = getDatabase(app, firebaseConfig.databaseURL);
  let stopPlayers = null, timer = null, myRef = null, uid = null;
  const remote = new Map();
  const sessionName = () => window.FreeForm?.getSession?.() || auth.currentUser?.displayName || 'Player';
  const safeColors = c => ({
    body: typeof c?.body === 'string' ? c.body : '#3976d2',
    head: typeof c?.head === 'string' ? c.head : '#f4c95d',
    legs: typeof c?.legs === 'string' ? c.legs : '#29343d'
  });
  function clear() {
    if (timer) clearInterval(timer);
    timer = null;
    if (stopPlayers) stopPlayers();
    stopPlayers = null;
    for (const p of remote.values()) scene.remove(p.root);
    remote.clear();
  }
  function syncRemote(snapshot) {
    const data = snapshot.val() || {};
    for (const [id, p] of remote) {
      if (!data[id]) { scene.remove(p.root); remote.delete(id); }
    }
    for (const [id, d] of Object.entries(data)) {
      if (id === uid || !d || typeof d.x !== 'number' || typeof d.z !== 'number') continue;
      let p = remote.get(id);
      if (!p) {
        const root = makeAvatar(safeColors(d.avatar));
        root.add(label(String(d.username || 'Player').slice(0, 20)));
        scene.add(root);
        p = {root, lastSeen: Date.now()};
        remote.set(id, p);
      }
      p.root.position.set(d.x, Number(d.y) || 0, d.z);
      p.root.rotation.y = Number(d.rotationY) || 0;
      p.lastSeen = Date.now();
    }
  }
  onAuthStateChanged(auth, async user => {
    clear();
    uid = user?.uid || null;
    if (!user) return; // Account login is required for multiplayer.
    const roomRef = ref(db, `rooms/${room}/players`);
    myRef = ref(db, `rooms/${room}/players/${user.uid}`);
    try {
      await onDisconnect(myRef).remove();
      stopPlayers = onValue(roomRef, syncRemote, err => console.warn('FreeForm multiplayer read failed:', err));
      const initial = {
        uid: user.uid, username: sessionName(),
        avatar: safeColors(window.FreeForm?.getAvatar?.()),
        x: player.position.x, y: player.position.y, z: player.position.z,
        rotationY: player.rotation.y, updatedAt: Date.now()
      };
      await set(myRef, initial);
      timer = setInterval(() => {
        if (!auth.currentUser || !myRef) return;
        set(myRef, {
          uid: user.uid, username: sessionName(),
          avatar: safeColors(window.FreeForm?.getAvatar?.()),
          x: Number(player.position.x) || 0,
          y: Number(player.position.y) || 0,
          z: Number(player.position.z) || 0,
          rotationY: Number(player.rotation.y) || 0,
          updatedAt: Date.now()
        }).catch(err => console.warn('FreeForm multiplayer write failed:', err));
      }, 100);
    } catch (err) {
      console.warn('FreeForm multiplayer setup failed. Check Realtime Database Rules.', err);
    }
  });
  window.addEventListener('pagehide', () => {
    if (myRef) remove(myRef).catch(()=>{});
    clear();
  }, {once:true});
}
