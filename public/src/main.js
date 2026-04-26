import { onAuthChange, signInWithGoogle, signOut } from './auth.js';
import { getOrCreateLocalKeypair } from './crypto.js';
import { publishPublicKey, sendMessage, subscribeToMessages } from './messages.js';
import * as ui from './ui.js';

let currentUser = null;
let keypair = null;
let unsubscribeMessages = null;

ui.bindHandlers({
  onSignIn: handleSignIn,
  onSignOut: handleSignOut,
  onSend: handleSend,
});

onAuthChange(async (user) => {
  if (!user) {
    teardownSession();
    ui.showSignedOut();
    return;
  }

  try {
    keypair = await getOrCreateLocalKeypair(user.uid);
    await publishPublicKey(user.uid, keypair.keyId, keypair.publicJwk);
  } catch (err) {
    console.error('Key setup failed', err);
    alert('Could not set up signing keys. Please refresh and try again.');
    return;
  }

  currentUser = user;
  ui.showSignedIn(user);
  unsubscribeMessages = subscribeToMessages((message) => ui.appendMessage(message));
});

function teardownSession() {
  currentUser = null;
  keypair = null;
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
}

async function handleSignIn() {
  try {
    await signInWithGoogle();
  } catch (err) {
    console.error('Sign-in failed', err);
    alert(err?.message ?? 'Sign-in failed');
  }
}

async function handleSignOut() {
  try {
    await signOut();
  } catch (err) {
    console.error('Sign-out failed', err);
  }
}

async function handleSend() {
  if (!currentUser || !keypair) return;
  const text = ui.getInput();
  if (!text.trim()) return;

  try {
    await sendMessage({
      uid: currentUser.uid,
      keyId: keypair.keyId,
      name: currentUser.displayName ?? '',
      photoUrl: currentUser.photoURL,
      text,
      privateKey: ui.isSigningEnabled() ? keypair.privateKey : null,
    });
    ui.clearInput();
  } catch (err) {
    console.error('Send failed', err);
    alert('Could not send message. Try again.');
  }
}
