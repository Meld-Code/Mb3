# FreeForm

FreeForm is a browser-based game prototype with exactly two playable rooms on the hub: **Sword Fight** and **Murder Mystery**. Both rooms use Three.js. Avatar Studio, Profile, and the account page are supporting pages; `Character.html` and `latency.html` remain development demos.

## Run locally

Use a local web server (ES modules and Firebase do not work reliably from `file://`):

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`. Internet access is required for the Firebase and Three.js CDN modules.

## Firebase setup

This project is configured with the Firebase web app values provided for project `freeform-4f8df` and its Realtime Database URL.

1. Open the [Firebase Console](https://console.firebase.google.com/) and select **freeform-4f8df**.
2. Under **Build → Authentication → Sign-in method**, enable **Email/Password**.
3. Open **Realtime Database → Rules** and publish the contents of `database.rules.json`. Do not use public test rules.
4. Under Authentication settings, ensure your deployed site domain is in **Authorized domains**. Add `localhost` if needed for local testing.
5. Serve the project over localhost or HTTPS, then create a test account.

The Firebase client configuration is in `firebase-config.js`. Web app configuration is used by client-side apps and is not a service-account secret; keep database rules enabled and never put private service-account keys in this project.

## Cloud-backed features

- Firebase Authentication handles email/password accounts. Sign-up also asks for a public username.
- Realtime Database stores username reservations, user profile/avatar data, per-user scores, and shared leaderboard rows.
- Avatar changes sync for signed-in users. Game pages submit scores to the cloud leaderboard when configured and signed in.
- Guest play and local scores can still work without Firebase.

## Security notes

The rules restrict profile reads/writes to the signed-in owner and allow signed-in players to read leaderboard rows and write only their own row. They validate basic leaderboard fields, but they cannot prove that a submitted score was earned fairly. A competitive public game should validate score submissions in trusted server-side code, such as Cloud Functions.

## Project files

- `index.html` — hub with the two playable rooms
- `auth.html` — Firebase sign-up/sign-in
- `profile.html` — profile and scores
- `skinCustomization.html` — avatar color editor
- `murderMysteryRoom.html` — Three.js mystery room
- `swordFightRoom.html` — Three.js sword-fight room
- `Character.html`, `latency.html` — Three.js development demos
- `firebase-config.js` — Firebase web app configuration
- `assets/firebase-cloud.js` — Firebase Authentication and Realtime Database integration
- `database.rules.json` — Realtime Database security rules
- `tests/smoke-test.mjs` — static smoke checks
