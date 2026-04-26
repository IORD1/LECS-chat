import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { auth } from './firebase.js';

const provider = new GoogleAuthProvider();

export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export function signInWithGoogle() {
  return signInWithPopup(auth, provider);
}

export function signOut() {
  return firebaseSignOut(auth);
}
