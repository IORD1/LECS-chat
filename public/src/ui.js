const els = {
  signedOut: document.querySelector('#signedOut'),
  signedIn: document.querySelector('#signedIn'),
  signInBtn: document.querySelector('#signInBtn'),
  signOutBtn: document.querySelector('#signOutBtn'),
  greeting: document.querySelector('#greeting'),
  avatar: document.querySelector('#avatar'),
  display: document.querySelector('#display'),
  input: document.querySelector('#input'),
  sendBtn: document.querySelector('#sendBtn'),
  signToggleBtn: document.querySelector('#signToggleBtn'),
};

let currentUid = null;

const STATUS_LABELS = {
  valid: 'Valid signature',
  invalid: 'Invalid signature',
  unsigned: 'Unsigned',
  unverifiable: 'Signer key not found',
  legacy: 'Legacy message',
};

export function showSignedOut() {
  currentUid = null;
  els.signedOut.hidden = false;
  els.signedIn.hidden = true;
  els.display.replaceChildren();
}

export function showSignedIn(user) {
  currentUid = user.uid;
  els.signedOut.hidden = true;
  els.signedIn.hidden = false;
  const firstName = user.displayName?.split(' ')[0] ?? '';
  els.greeting.textContent = firstName ? `Hello ${firstName}` : 'Hello';
  if (user.photoURL) els.avatar.src = user.photoURL;
}

export function appendMessage(message) {
  els.display.appendChild(buildMessageCard(message));
  els.display.scrollTop = els.display.scrollHeight;
}

export function getInput() {
  return els.input.value;
}

export function clearInput() {
  els.input.value = '';
  els.input.focus();
}

export function isSigningEnabled() {
  return els.signToggleBtn.checked;
}

export function bindHandlers({ onSignIn, onSignOut, onSend }) {
  els.signInBtn.addEventListener('click', onSignIn);
  els.signOutBtn.addEventListener('click', onSignOut);
  els.sendBtn.addEventListener('click', onSend);
  els.input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  });
}

function buildMessageCard(message) {
  const isMine = message.uid && message.uid === currentUid;

  const card = document.createElement('div');
  card.className = isMine ? 'chat chat-mine' : 'chat';

  const avatarBox = document.createElement('div');
  avatarBox.className = 'chat-avatar';
  if (message.photoUrl) {
    const img = document.createElement('img');
    img.src = message.photoUrl;
    img.alt = '';
    img.referrerPolicy = 'no-referrer';
    avatarBox.appendChild(img);
  }

  const body = document.createElement('div');
  body.className = 'chat-body';

  const meta = document.createElement('div');
  meta.className = 'chat-meta';
  meta.textContent = formatMeta(message);

  const text = document.createElement('div');
  text.className = 'chat-text';
  text.textContent = message.text;

  const badge = document.createElement('div');
  badge.className = `chat-badge chat-badge-${message.status}`;
  badge.textContent = STATUS_LABELS[message.status] ?? message.status;

  body.append(meta, text, badge);
  card.append(avatarBox, body);
  return card;
}

function formatMeta(message) {
  const author = message.name || 'Anonymous';
  if (!message.createdAt) return author;
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${author} · ${time}`;
}
