# Architecture — v2

There is still no backend code. The app is one HTML page, six JS modules,
and one CSS file talking directly to Firebase.

## Module graph

```
       ┌──────────────┐
       │   main.js    │   entrypoint; holds session state
       └──┬──┬──┬─────┘
          │  │  └──────────────┐
          │  └──────┐          │
          ▼         ▼          ▼
       ┌─────┐  ┌──────────┐  ┌──────────┐
       │ ui  │  │ auth.js  │  │messages.js│
       └─────┘  └────┬─────┘  └────┬─────┘
                     │             │
                     ▼             ▼
                 ┌────────────────────┐
                 │    firebase.js     │   (initializeApp, auth, db)
                 └────────────────────┘
                       
       ┌────────────┐
       │ crypto.js  │   imported by main.js (key gen/load) and
       └────────────┘   messages.js (sign/verify)
```

- `firebase.js`: single `initializeApp` call, exports `auth` and `db`.
  Everything that touches Firebase imports from here.
- `auth.js`: thin wrappers — `onAuthChange(cb)`, `signInWithGoogle()`,
  `signOut()`. No state of its own.
- `crypto.js`: WebCrypto + IndexedDB. Exports
  `getOrCreateLocalKeypair(uid)`, `signMessage(privateKey, text)`,
  `verifyMessage(publicJwk, sigB64, text)`. The private CryptoKey returned
  is non-extractable.
- `messages.js`: the data layer. `publishPublicKey(uid, jwk)`,
  `sendMessage({...})`, `subscribeToMessages(handler)`. Owns an in-memory
  cache of `uid → publicJwk` to avoid re-fetching on every verification,
  and a serialization queue so messages render in arrival order even if
  verifications resolve out of order.
- `ui.js`: queries known DOM IDs at module load and exposes setters
  (`appendMessage`, `showSignedIn`, `setSigningEnabled`, `bindHandlers`,
  ...). Renders chat cards via `createElement` + `textContent` only — no
  `innerHTML` for any user data.
- `main.js`: holds the three pieces of session state
  (`currentUser`, `keypair`, `signingEnabled`) and an unsubscribe handle.
  Wires UI events to auth/messages.

## Firebase services

| Service | Use |
|---|---|
| Auth | Google sign-in popup. |
| Realtime Database | `/chat/` and `/publicKeys/`. |
| Hosting | Serves `public/` with `**` → `/index.html`. |
| Firestore | **Unused.** Rules deny all. |

## RTDB schema (v2)

```
/
├── publicKeys/
│   └── {uid}/                 # JWK for one user's ECDSA P-256 public key
│       ├── kty: "EC"
│       ├── crv: "P-256"
│       ├── x:   <base64url>
│       └── y:   <base64url>
│
└── chat/
    └── {pushId}/              # one message
        ├── uid:        string  # sender's auth uid (enforced by rules)
        ├── name:       string  # auth.displayName at send time
        ├── photoUrl:   string|null
        ├── text:       string  # message body, 1–4000 chars
        ├── signature:  string|null  # base64 of WebCrypto signature, or null if unsigned
        └── createdAt:  number  # serverTimestamp()
```

The public key is *not* embedded in each message anymore — it lives at one
canonical path that rules pin to the owning user. That closes the v1
spoofing hole.

## End-to-end flow

### Boot

1. `index.html` loads, splash overlay shown.
2. `main.js` (ES module, deferred) imports the other modules.
3. `ui.bindHandlers({...})` attaches click/keydown listeners.
4. `ui.setSigningEnabled(true)` paints the toggle button as active.
5. `onAuthChange(...)` registered.
6. Splash auto-fades after 0.6 s via CSS animation — JS doesn't manage it.

### Sign-in

`onAuthChange` callback fires with the `User`:

1. `getOrCreateLocalKeypair(user.uid)` —
   - Open IndexedDB `lecs-chat`/`keypairs`. Look up `user.uid`.
   - **Hit:** return `{privateKey: CryptoKey, publicJwk, isNew: false}`.
   - **Miss:** generate a fresh extractable keypair, export both halves to
     JWK, re-import the private as non-extractable, store
     `{privateKey, publicJwk}` under the uid, return with `isNew: true`.
2. `publishPublicKey(user.uid, publicJwk)` — RTDB `set` at
   `/publicKeys/<uid>`. Idempotent. Cached in `messages.js`.
3. `ui.showSignedIn(user)` — swaps sections, sets greeting + avatar.
4. `subscribeToMessages(handler)` — registers `onChildAdded` on `/chat/`.
   Returns an unsubscribe function which `main.js` stashes for later.

### Sign-out

`onAuthChange` fires with `null`:

1. Tear down: clear `currentUser`, `keypair`, call the stored
   unsubscribe.
2. `ui.showSignedOut()` — swaps back to the landing section, clears the
   message list.

The IndexedDB keypair stays — signing back in on the same device skips
key generation.

### Sending

User types into `#input`, presses Enter or clicks Send → `handleSend`:

1. Read text, trim, abort if empty.
2. `sendMessage({ uid, name, photoUrl, text, privateKey })`:
   - If `privateKey` is non-null, `signMessage(privateKey, text)` runs
     `crypto.subtle.sign('ECDSA SHA-256', privateKey, encoder.encode(text))`.
     Result is base64-encoded.
   - Push a new child under `/chat/` with the schema above.
   - `createdAt` uses `serverTimestamp()` — the server expands the
     `{".sv":"timestamp"}` placeholder to a number, and rules validate
     it as `<= now`.
3. Clear and refocus the input.

The signature is computed **at send time**, not on every keystroke. This
eliminates the v1 race where the signature lagged the input.

### Receiving

`onChildAdded` fires for each historical message at subscribe time, then
once per new message. For each:

1. `normalize(snapshot)` returns one of:
   - A v2 record (has `uid` + `text`).
   - A legacy v1 record (has `Message`, `Name`, `dp`).
   - `null` if the data doesn't look like either (skipped).
2. `statusFor(message)`:
   - Legacy → `'legacy'`.
   - v2, no signature → `'unsigned'`.
   - v2, has signature, no public key in cache or RTDB → `'unverifiable'`.
   - v2, verified true → `'valid'`.
   - v2, verified false → `'invalid'`.
3. `handler({...message, status})` is called via a serialization chain
   (each call awaits the previous), so visual ordering matches arrival
   order even if verifications complete out of order.
4. `ui.appendMessage` builds a card with `createElement`, sets all user
   text via `textContent`, sets the avatar `src` as a property (not
   string-concatenated into HTML), tags it with `chat-badge-<status>`,
   and scrolls to bottom.

## Security model

Threat → mitigation:

| Threat | Mitigation |
|---|---|
| **Stored XSS via message body / display name / photo URL** | `textContent` only; `img.src` set as property. |
| **Sender spoofs another user's identity** | Rules enforce `chat/$id/uid === auth.uid` on write. The renderer always shows the verified-against-public-key claim, not a free-form sender field. |
| **Private key exfiltration** | Private key never leaves the browser. Stored in IndexedDB as a non-extractable `CryptoKey`. |
| **Replay (re-posting another user's signed text)** | Doesn't help an attacker — the rules require the chat record's `uid` to be theirs, but verification resolves the public key by that `uid`. The replayed signature won't match the attacker's public key, so the badge shows "Invalid signature". |
| **Unauthenticated read/write** | Rules deny all by default. `/chat` and `/publicKeys` require `auth != null`. |
| **Unbounded message size** | `text` validated 1–4000 chars at the rule level. |
| **Unknown fields** | Per-message `$other` validate is `false` — only the documented fields are allowed. |
| **Spam / rate limiting** | Not solved at the rules level. RTDB rules can't natively rate-limit. Worth adding later via a server-side check or a counter pattern. |

## Things deliberately not in v2

- Lock screen — was a dead-end UI in v1, not a real security control
  against device theft.
- Search button — was a stub in v1.
- Edit / delete messages — out of scope.
- Multiple rooms / DMs — single global room only, like v1.
- Server-side rendering / SSR — pure client app.
