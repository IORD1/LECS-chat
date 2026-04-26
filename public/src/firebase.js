import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

const firebaseConfig = {
  apiKey: 'AIzaSyDURV-9NnakYNiBlyMUbIqykhOl2hQCYQ0',
  authDomain: 'lecs-chat.firebaseapp.com',
  databaseURL: 'https://lecs-chat-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'lecs-chat',
  storageBucket: 'lecs-chat.appspot.com',
  messagingSenderId: '199711899591',
  appId: '1:199711899591:web:fe8db5b1909721243163e2',
  measurementId: 'G-R3CLB772MX',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
