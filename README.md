<img width="1920" height="1080" alt="939shots_so" src="https://github.com/user-attachments/assets/810998cb-25d5-481d-824b-0f750d5f2e8b" />


# LECS-chat

A web chat where every message is cryptographically signed in your browser and verified by everyone who reads it.

**Try here:** https://lecs-chat.web.app

## How it works

1. **Sign in with Google** → your browser generates an ECDSA P-256 keypair. The private key stays on-device in IndexedDB and is non-extractable (JS can sign with it but can't read its bytes). The public key is uploaded to Firebase, keyed by `(your uid, a per-device keyId)`.
2. **Send a message** → your browser signs the text and pushes `{ uid, keyId, text, signature, … }` to Realtime Database.
3. **Other browsers** look up your public key at `/publicKeys/<uid>/<keyId>`, verify the signature against the text, and render the chat card with a green "Valid signature" or red "Invalid signature" badge.

Same user signed in on multiple devices = multiple keypairs, all valid side-by-side. Tampering with a message in the database (text or signature) makes it render red on the next refresh.
