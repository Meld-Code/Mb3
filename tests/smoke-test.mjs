import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = p => readFileSync(join(root, p), 'utf8');
const required = ['index.html','auth.html','profile.html','skinCustomization.html','murderMysteryRoom.html','swordFightRoom.html','Character.html','latency.html','assets/freeform.css','assets/freeform.js','assets/default-face.svg','firebase-config.js','assets/firebase-cloud.js','database.rules.json'];
for (const f of required) assert.ok(existsSync(join(root,f)), `Missing ${f}`);
const home=read('index.html');
for(const link of ['murderMysteryRoom.html','swordFightRoom.html','skinCustomization.html','profile.html'])assert.ok(home.includes(link),`Home missing ${link}`);
assert.ok(!home.includes('latency.html')&&!home.includes('Character.html'),'Only the two intended game rooms should be presented as games on the hub');
for(const [file,terms] of [['murderMysteryRoom.html',['three.module.js','RoundedBoxGeometry','makeClue','function accuse','requestAnimationFrame','freeform-firebase-ready']],['swordFightRoom.html',['three.module.js','RoundedBoxGeometry','function attack','makeBot','requestAnimationFrame','freeform-firebase-ready']]]){const html=read(file);for(const term of terms)assert.ok(html.includes(term),`${file} missing ${term}`);assert.ok(html.includes('id="world"'),`${file} must render a 3D canvas`)}
const auth=read('auth.html');for(const term of ['FreeFormCloud','email','confirm-password','Firebase is not configured'])assert.ok(auth.includes(term),`Auth missing ${term}`);
assert.ok(read('skinCustomization.html').includes('FreeForm.saveAvatar'));assert.ok(read('profile.html').includes('FreeForm.getScores'));assert.ok(read('assets/firebase-cloud.js').includes('createUserWithEmailAndPassword'));assert.ok(read('assets/firebase-cloud.js').includes('getLeaderboard'));assert.ok(read('database.rules.json').includes('auth.uid == $uid')); assert.ok(read('firebase-config.js').includes('https://freeform-4f8df-default-rtdb.firebaseio.com')); assert.ok(read('assets/firebase-cloud.js').includes('firebase-database.js')); 
console.log(`FreeForm smoke checks passed (${required.length} required files; two Three.js rooms).`);
