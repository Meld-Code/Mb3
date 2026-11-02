import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import {
getDatabase,
ref,
onValue,
set,
onDisconnect,
remove
} from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';
import { firebaseConfig, isFirebaseConfigured } from '../firebase-config.js';
const roomPlayerRoots = new Map();
window.FreeFormRoomPlayers = {
get(uid) {
if (!uid) return null;
return roomPlayerRoots.get(uid) || null;
}
};
export function connectRoom({ THREE, scene, player, makeAvatar, label, room }) {
if (!isFirebaseConfigured) {
console.warn('FreeForm multiplayer: Firebase is not configured.');
return;
}
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app, firebaseConfig.databaseURL);
let stopPlayers = null;
let timer = null;
let myRef = null;
let uid = null;
const remote = new Map();
const sessionName = () =>
window.FreeForm?.getSession?.() ||
auth.currentUser?.displayName ||
'Player';
const safeColors = colors => ({
body: typeof colors?.body === 'string' ? colors.body : '#3976d2',
head: typeof colors?.head === 'string' ? colors.head : '#f4c95d',
legs: typeof colors?.legs === 'string' ? colors.legs : '#29343d'
});
function clear() {
if (timer) clearInterval(timer);
timer = null;
if (stopPlayers) stopPlayers();
stopPlayers = null;

for (const [remoteUid, record] of remote) {
  scene.remove(record.root);
  roomPlayerRoots.delete(remoteUid);
}

remote.clear();

}
function syncRemote(snapshot) {
const data = snapshot.val() || {};
for (const [remoteUid, record] of remote) {
  if (!data[remoteUid]) {
    scene.remove(record.root);
    remote.delete(remoteUid);
    roomPlayerRoots.delete(remoteUid);
  }
}

for (const [remoteUid, playerData] of Object.entries(data)) {
  if (
    remoteUid === uid ||
    !playerData ||
    typeof playerData.x !== 'number' ||
    typeof playerData.z !== 'number'
  ) {
    continue;
  }

  let record = remote.get(remoteUid);

  if (!record) {
    const root = makeAvatar(safeColors(playerData.avatar));
    root.add(label(String(playerData.username || 'Player').slice(0, 20)));
    scene.add(root);

    record = { root, lastSeen: Date.now() };
    remote.set(remoteUid, record);
    roomPlayerRoots.set(remoteUid, root);
  }

  record.root.position.set(
    playerData.x,
    Number(playerData.y) || 0,
    playerData.z
  );
  record.root.rotation.y = Number(playerData.rotationY) || 0;
  record.lastSeen = Date.now();
}

}
onAuthStateChanged(auth, async user => {
clear();
uid = user?.uid || null;
myRef = null;
if (!user) return;

const playersRef = ref(db, `rooms/${room}/players`);
myRef = ref(db, `rooms/${room}/players/${user.uid}`);

try {
  await onDisconnect(myRef).remove();
  stopPlayers = onValue(
    playersRef,
    syncRemote,
    error => console.warn('FreeForm multiplayer read failed:', error)
  );

  const makePlayerData = () => ({
    uid: user.uid,
    username: sessionName(),
    avatar: safeColors(window.FreeForm?.getAvatar?.()),
    x: Number(player.position.x) || 0,
    y: Number(player.position.y) || 0,
    z: Number(player.position.z) || 0,
    rotationY: Number(player.rotation.y) || 0,
    updatedAt: Date.now()
  });

  await set(myRef, makePlayerData());

  timer = setInterval(() => {
    if (!auth.currentUser || !myRef) return;

    set(myRef, makePlayerData()).catch(error =>
      console.warn('FreeForm multiplayer write failed:', error)
    );
  }, 100);
} catch (error) {
  console.warn(
    'FreeForm multiplayer setup failed. Check Realtime Database Rules.',
    error
  );
}

});
window.addEventListener('pagehide', () => {
if (myRef) remove(myRef).catch(() => {});
clear();
}, { once: true });
}
