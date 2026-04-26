# Migration — v1 → v2

## What v1 got wrong (and what v2 does instead)

| Area | v1 | v2 |
|---|---|---|
| Crypto lib | `jquery-ecdsa` (jQuery plugin, hex output) | Native WebCrypto P-256 + SHA-256 (base64 output) |
| Private key storage | Uploaded to RTDB at `/Signature/<uid>/gen/private` | Stays in IndexedDB on the device, as a non-extractable `CryptoKey` |
| Public key location | Embedded in every chat message | One canonical write at `/publicKeys/<uid>` |
| When signature is computed | On every keystroke (raced the send) | Once, at send time, awaited before push |
| Sender identity | Free-form `Name` field, no enforcement | RTDB rules require `chat/$id/uid === auth.uid` |
| XSS | Stored XSS via `innerHTML` string-concat of message + name + photo URL | All user data rendered via `textContent`; `img.src` set as property |
| Render strategy | `onValue` re-rendered the entire list on every change | `onChildAdded` appends one card per new message |
| RTDB rules | Date-locked open: `now < 1669401000000` | Per-path rules with auth checks, type/length validation, and write-only-create on chat |
| Lock screen | Dead-end UI, broken state machine | Removed |
| Search button | No-op stub | Removed |
| Sign-out wiring | Inline `onclick="func()"` referring to undefined `func` | Real handler attached in `ui.bindHandlers` |
| Bundled libraries | jQuery, Bootstrap, jquery-ecdsa, Material Symbols, Quantico/Silkscreen fonts (~hundreds of KB on first paint) | Just our own JS + CSS |
| State globals | `signOff` (inverted name), shared `#hiddentinput` for verification, race-prone | Module-scoped vars in `main.js`, no shared DOM scratch space |

## Old data behavior

The v1 schema looked like:

```
/chat/{id}: { Name, Message, time, dp, sign, public }
/Signature/{uid}: { gen: { public, private } }
```

v2 reads the old `/chat/` records and renders them with the badge
**"Legacy message"** (no verification attempted — different signature
format). They are read-only from the UI's perspective; v2 does not
write into the old schema.

## Action items for the human deploying this

1. **Deploy hosting + rules:**

   ```
   firebase deploy
   ```

   This pushes `public/`, `database.rules.json`, and `firestore.rules`.

2. **Delete the old private-key tree from RTDB.** This is the one piece
   of cleanup that has to happen in the Firebase console. The new rules
   block all access to `/Signature/`, but the data still exists on the
   server. In the RTDB data viewer, delete the `Signature` node.

3. **Optional: delete the old `/chat/` records.** They will render as
   "Legacy message" forever. If you'd rather start fresh, delete the
   `chat` node in the console.

4. **Verify rules in the console** — the deploy will replace the old
   ruleset, but it's worth opening the rules tab and confirming the new
   rules are live and the simulator approves a write where
   `uid === auth.uid` and rejects one where it doesn't.

5. **Test the round trip on the live URL:**
   - Open in two browsers signed in as different Google accounts.
   - Each posts a message; both should render with green
     "Valid signature".
   - Toggle "Sign messages" off, post → should render "Unsigned".
   - Use a private window, clear IndexedDB, sign in as the same Google
     account → should generate a new keypair. Old messages from this
     user (signed with the previous key) will then render
     "Invalid signature" because the public key at `/publicKeys/<uid>`
     was overwritten. Expected behavior.

## Known gaps in v2

- **No rate limiting on writes.** A signed-in user can spam `/chat/`. RTDB
  rules can't natively rate-limit; a Cloud Function trigger or a counter
  rule pattern would be the right next step.
- **Public-key replacement loses history.** If a user clears IndexedDB or
  signs in on a new device, they generate a new keypair. The
  `/publicKeys/<uid>` write overwrites the old key. Older messages signed
  with the old private key will then verify-fail. There is no
  multi-device / key-history support.
- **No CSP header.** Firebase Hosting can serve a custom
  `Content-Security-Policy` via `firebase.json` headers — worth adding to
  defense-in-depth even though the renderer is XSS-safe by construction.
- **Visual design is functional, not polished.** The CSS is a clean base
  but doesn't preserve the v1 typography (Quantico, Silkscreen, large
  stacked headings). Add fonts back via `@import` if that look matters.
