const DB_NAME = 'lecs-chat';
const DB_VERSION = 1;
const STORE = 'keypairs';

const ALGORITHM = { name: 'ECDSA', namedCurve: 'P-256' };
const SIGN_PARAMS = { name: 'ECDSA', hash: 'SHA-256' };

const encoder = new TextEncoder();
const publicKeyCache = new Map();

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function awaitRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function loadKeypair(uid) {
  const db = await openDb();
  try {
    return await awaitRequest(db.transaction(STORE, 'readonly').objectStore(STORE).get(uid));
  } finally {
    db.close();
  }
}

async function storeKeypair(uid, record) {
  const db = await openDb();
  try {
    await awaitRequest(db.transaction(STORE, 'readwrite').objectStore(STORE).put(record, uid));
  } finally {
    db.close();
  }
}

async function generateKeypair() {
  const pair = await crypto.subtle.generateKey(ALGORITHM, true, ['sign', 'verify']);
  const publicJwk = await crypto.subtle.exportKey('jwk', pair.publicKey);
  const privateJwk = await crypto.subtle.exportKey('jwk', pair.privateKey);

  // Re-import the private key as non-extractable so it cannot be exfiltrated
  // by future code, even if a bug or injection grabs the CryptoKey object.
  const privateKey = await crypto.subtle.importKey('jwk', privateJwk, ALGORITHM, false, ['sign']);

  const keyId = crypto.randomUUID();
  return { privateKey, publicJwk, keyId };
}

export async function getOrCreateLocalKeypair(uid) {
  const existing = await loadKeypair(uid);
  if (existing && existing.keyId) return { ...existing, isNew: false };

  const fresh = await generateKeypair();
  await storeKeypair(uid, fresh);
  return { ...fresh, isNew: true };
}

async function importPublicKey(jwk) {
  const cacheKey = JSON.stringify(jwk);
  let key = publicKeyCache.get(cacheKey);
  if (!key) {
    key = await crypto.subtle.importKey('jwk', jwk, ALGORITHM, false, ['verify']);
    publicKeyCache.set(cacheKey, key);
  }
  return key;
}

function bytesToBase64(bytes) {
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function signMessage(privateKey, message) {
  const sig = await crypto.subtle.sign(SIGN_PARAMS, privateKey, encoder.encode(message));
  return bytesToBase64(new Uint8Array(sig));
}

export async function verifyMessage(publicJwk, signatureB64, message) {
  try {
    const publicKey = await importPublicKey(publicJwk);
    return await crypto.subtle.verify(
      SIGN_PARAMS,
      publicKey,
      base64ToBytes(signatureB64),
      encoder.encode(message),
    );
  } catch {
    return false;
  }
}
