import {
  ref,
  push,
  set,
  serverTimestamp,
  onChildAdded,
  get,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';
import { db } from './firebase.js';
import { signMessage, verifyMessage } from './crypto.js';

const CHAT_PATH = 'chat';
const KEYS_PATH = 'publicKeys';

const publicKeyCache = new Map();

export async function publishPublicKey(uid, keyId, publicJwk) {
  await set(ref(db, `${KEYS_PATH}/${uid}/${keyId}`), publicJwk);
  publicKeyCache.set(`${uid}:${keyId}`, publicJwk);
}

async function getPublicKey(uid, keyId) {
  const cacheKey = `${uid}:${keyId}`;
  if (publicKeyCache.has(cacheKey)) return publicKeyCache.get(cacheKey);
  const snapshot = await get(ref(db, `${KEYS_PATH}/${uid}/${keyId}`));
  const jwk = snapshot.exists() ? snapshot.val() : null;
  publicKeyCache.set(cacheKey, jwk);
  return jwk;
}

export async function sendMessage({ uid, keyId, name, photoUrl, text, privateKey }) {
  const trimmed = text.trim();
  if (!trimmed) throw new Error('Message text is empty');

  const signature = privateKey ? await signMessage(privateKey, trimmed) : null;

  await set(push(ref(db, CHAT_PATH)), {
    uid,
    keyId,
    name,
    photoUrl: photoUrl ?? null,
    text: trimmed,
    signature,
    createdAt: serverTimestamp(),
  });
}

function normalize(snapshot) {
  const raw = snapshot.val();
  if (!raw || typeof raw !== 'object') return null;

  if (typeof raw.text === 'string' && typeof raw.uid === 'string') {
    return {
      id: snapshot.key,
      schema: 'v2',
      uid: raw.uid,
      keyId: typeof raw.keyId === 'string' ? raw.keyId : null,
      name: typeof raw.name === 'string' ? raw.name : '',
      photoUrl: typeof raw.photoUrl === 'string' ? raw.photoUrl : null,
      text: raw.text,
      signature: typeof raw.signature === 'string' ? raw.signature : null,
      createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : null,
    };
  }

  if (typeof raw.Message === 'string') {
    return {
      id: snapshot.key,
      schema: 'legacy',
      uid: null,
      name: typeof raw.Name === 'string' ? raw.Name : '',
      photoUrl: typeof raw.dp === 'string' ? raw.dp : null,
      text: raw.Message,
      signature: null,
      createdAt: null,
    };
  }

  return null;
}

async function statusFor(message) {
  if (message.schema === 'legacy') return 'legacy';
  if (!message.signature) return 'unsigned';
  if (!message.keyId) return 'unverifiable';
  const publicJwk = await getPublicKey(message.uid, message.keyId);
  if (!publicJwk) return 'unverifiable';
  const ok = await verifyMessage(publicJwk, message.signature, message.text);
  return ok ? 'valid' : 'invalid';
}

// Serialize verification work so messages render in the order they arrive,
// not in the order their async verifications complete.
let renderChain = Promise.resolve();

export function subscribeToMessages(handler) {
  return onChildAdded(ref(db, CHAT_PATH), (snapshot) => {
    renderChain = renderChain
      .then(async () => {
        const message = normalize(snapshot);
        if (!message) return;
        const status = await statusFor(message);
        handler({ ...message, status });
      })
      .catch((err) => console.error('Message handling failed', err));
  });
}
