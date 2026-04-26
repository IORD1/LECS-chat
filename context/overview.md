# Overview — LECS-chat v2

A single-room public web chat app where every message is signed with the
sender's personal ECDSA P-256 key and re-verified client-side on read.

The "Linear Elliptic Curve Signaturing" name is the original author's
coinage — under the hood this is plain ECDSA over P-256 with SHA-256.

Live URL (per old README): https://lecs-chat.web.app

## Stack

- **Frontend:** plain HTML + CSS + native ES modules. No jQuery, no
  Bootstrap, no bundler, no build step. System fonts.
- **Crypto:** WebCrypto (`crypto.subtle`). The private key is generated
  client-side with `extractable: true`, immediately re-imported as
  non-extractable, and stored in IndexedDB. It never leaves the browser.
- **Backend:** Firebase only.
  - **Auth** — Google sign-in.
  - **Realtime Database** — chat messages and per-user public keys.
  - **Hosting** — serves `public/` with a `**` rewrite to `/index.html`.
  - **Firestore** — locked to deny-all (unused; defended by rules in case
    someone enables it later).

## Project layout

```
LECS-chat/
├── public/                     # everything Firebase Hosting serves
│   ├── index.html              # minimal markup, three sections
│   ├── styles.css              # responsive CSS, sage palette
│   └── src/
│       ├── main.js             # entrypoint, wires modules together
│       ├── firebase.js         # initializeApp + exports auth, db
│       ├── auth.js             # signInWithGoogle, signOut, onAuthChange
│       ├── crypto.js           # WebCrypto + IndexedDB key manager
│       ├── messages.js         # send / subscribe / verify pipeline
│       └── ui.js               # safe DOM rendering (createElement only)
├── firebase.json               # hosting + RTDB + Firestore config
├── database.rules.json         # real RTDB rules — auth-bound write/validate
├── firestore.rules             # deny-all (Firestore is unused)
├── firestore.indexes.json
├── .firebaserc
├── package.json                # name + deploy script, no runtime deps
├── README.md
└── context/                    # these docs
```

## What a user does

1. Land on the page → splash overlay fades after ~1 s (CSS animation).
2. See the landing card with a "Sign in with Google" button.
3. Sign in.
   - **First time on this device:** generate a P-256 keypair, persist the
     non-extractable `CryptoKey` for the private side in IndexedDB, upload
     the public JWK to `/publicKeys/<uid>` in RTDB.
   - **Returning on this device:** load the existing private CryptoKey from
     IndexedDB. Re-publish the public JWK (idempotent set).
4. Chat view: header (avatar, greeting, sign-toggle, sign-out), message
   list, footer (input + send).
5. Type a message. Click send (or hit Enter). The message is signed *at
   send time* (not on every keystroke) and pushed to `/chat/`.
6. All connected clients receive new messages via `onChildAdded`, look up
   the sender's public key from `/publicKeys/<senderUid>`, verify the
   signature, and render the card with a status badge:
   - **Valid signature** — green.
   - **Invalid signature** — red.
   - **Unsigned** — neutral. (Sender opted out via the sign-toggle.)
   - **Signer key not found** — amber. (No public key registered for the
     sender's uid — shouldn't happen under v2 rules, but possible if data
     was tampered with.)
   - **Legacy message** — neutral. (Old v1 records that don't follow the
     v2 schema. Read-only, never re-verified.)

## What changed from v1

See [migration.md](migration.md). Headline changes:

- Private keys no longer uploaded to the server.
- All user data rendered via `textContent`, no XSS surface.
- Senders can no longer spoof other users — RTDB rules enforce
  `uid === auth.uid` on every chat write.
- Lock screen and search button removed (both were broken stubs).
- jQuery and `jquery-ecdsa` removed; switched to native WebCrypto.
- RTDB rules rewritten from a date-locked open ruleset to per-path
  validated rules.
