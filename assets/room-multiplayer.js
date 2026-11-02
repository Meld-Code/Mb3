<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#101713">
  <title>FreeForm In-Game Chat</title>
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
  <style>
    :root {
      --green: #39d278;
      --panel: rgba(16, 23, 19, .97);
      --line: rgba(255,255,255,.13);
      --text: #f2f7f3;
      --muted: #a6b2a9;
    }

    * { box-sizing: border-box; }

    html, body {
      width: 100%;
      height: 100%;
      margin: 0;
      overflow: hidden;
      background: transparent;
      color: var(--text);
      font-family: Arial, Helvetica, sans-serif;
    }

    .chat-shell {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
      box-shadow: 0 10px 35px rgba(0,0,0,.35);
      backdrop-filter: blur(10px);
    }

    .chat-header {
      min-height: 43px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 0 11px;
      border-bottom: 1px solid var(--line);
    }

    .chat-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 700;
    }

    .chat-title i { color: var(--green); }

    .chat-header-actions {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .chat-status {
      display: flex;
      align-items: center;
      gap: 6px;
      color: var(--muted);
      font-size: 10px;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #e6b84f;
    }

    .status-dot.online { background: var(--green); }
    .status-dot.error { background: #ff7066; }

    .close-button {
      width: 28px;
      height: 28px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--text);
      cursor: pointer;
    }

    .close-button:hover { background: rgba(255,255,255,.1); }

    .messages {
      flex: 1;
      min-height: 0;
      display: flex;
      flex-direction: column;
      gap: 9px;
      overflow-y: auto;
      padding: 10px;
      scrollbar-color: #44574a transparent;
      scrollbar-width: thin;
    }

    .empty {
      margin: auto;
      color: var(--muted);
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
    }

    .empty i {
      display: block;
      margin-bottom: 8px;
      color: #748279;
      font-size: 22px;
    }

    .message {
      max-width: 95%;
      align-self: flex-start;
    }

    .message.own { align-self: flex-end; }

    .message-meta {
      display: flex;
      gap: 6px;
      margin: 0 4px 4px;
      color: var(--muted);
      font-size: 10px;
    }

    .message.own .message-meta { justify-content: flex-end; }
    .message-name { color: #c8f2d6; font-weight: 700; }

    .message-text {
      padding: 8px 10px;
      border: 1px solid var(--line);
      border-radius: 10px 10px 10px 3px;
      background: #18221c;
      color: var(--text);
      font-size: 12px;
      line-height: 1.4;
      overflow-wrap: anywhere;
      white-space: pre-wrap;
    }

    .message.own .message-text {
      border-color: rgba(57,210,120,.25);
      border-radius: 10px 10px 3px 10px;
      background: rgba(27,155,82,.25);
    }

    .chat-error {
      min-height: 16px;
      padding: 0 10px 4px;
      color: #ffaaa2;
      font-size: 10px;
    }

    .chat-form {
      display: flex;
      align-items: end;
      gap: 7px;
      padding: 9px;
      border-top: 1px solid var(--line);
    }

    .chat-input {
      width: 100%;
      min-height: 36px;
      max-height: 88px;
      resize: none;
      padding: 9px 10px;
      border: 1px solid var(--line);
      border-radius: 8px;
      outline: none;
      background: rgba(0,0,0,.2);
      color: var(--text);
      font: inherit;
      font-size: 12px;
      line-height: 1.4;
    }

    .chat-input::placeholder { color: #87948b; }
    .chat-input:focus { border-color: rgba(57,210,120,.65); }

    .send-button {
      width: 37px;
      height: 36px;
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: 8px;
      background: var(--green);
      color: #102016;
      cursor: pointer;
    }

    .send-button:disabled { cursor: not-allowed; opacity: .45; }

    .chat-closed {
      width: 100%;
      height: 100%;
      display: none;
      place-items: center;
      border: 1px solid var(--line);
      border-radius: 12px;
      background: var(--panel);
    }

    .chat-closed button {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border: 0;
      border-radius: 8px;
      background: var(--green);
      color: #102016;
      cursor: pointer;
      font-weight: 700;
    }

    body.is-closed .chat-shell { display: none; }
    body.is-closed .chat-closed { display: grid; }

    @media (max-width: 520px) {
      .chat-header { min-height: 38px; }
      .messages { padding: 8px; }
      .chat-form { padding: 7px; }
    }
  </style>
</head>
<body>
  <section class="chat-shell" aria-label="In-game chat">
    <header class="chat-header">
      <div class="chat-title">
        <i class="fa-solid fa-comments" aria-hidden="true"></i>
        <span>Game chat</span>
      </div>
  <div class="chat-header-actions">
    <div class="chat-status" aria-live="polite">
      <span class="status-dot" id="statusDot"></span>
      <span id="statusText">Connecting…</span>
    </div>

    <button class="close-button" id="closeChat" type="button" aria-label="Close chat">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>
  </div>
</header>

<div class="messages" id="messages" role="log" aria-live="polite">
  <div class="empty" id="emptyState">
    <i class="fa-regular fa-message" aria-hidden="true"></i>
    Join the room and send the first message.
  </div>
</div>

<div class="chat-error" id="chatError" aria-live="polite"></div>

<form class="chat-form" id="chatForm">
  <textarea
    class="chat-input"
    id="chatInput"
    maxlength="180"
    rows="1"
    placeholder="Type a message..."
    aria-label="Type a chat message"></textarea>

  <button class="send-button" id="sendButton" type="submit" aria-label="Send message">
    <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
  </button>
</form>

  </section>
  <div class="chat-closed">
    <button id="openChat" type="button">
      <i class="fa-solid fa-comments" aria-hidden="true"></i>
      Chat
    </button>
  </div>
  <script>
    document.getElementById('closeChat').addEventListener('click', () => {
      document.body.classList.add('is-closed');
      window.parent.postMessage({ type: 'freeform-chat-closed' }, location.origin);
    });

    document.getElementById('openChat').addEventListener('click', () => {
      document.body.classList.remove('is-closed');
      window.parent.postMessage({ type: 'freeform-chat-opened' }, location.origin);
    });

    window.addEventListener('pagehide', () => {
      window.parent.postMessage({ type: 'freeform-chat-leaving' }, location.origin);
    });
  </script>
  <script type="module">
    import { initializeApp, getApps } from
      'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
    import { getAuth, onAuthStateChanged } from
      'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
    import {
      getDatabase,
      ref,
      push,
      set,
      remove,
      query,
      orderByChild,
      limitToLast,
      onChildAdded
    } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js';

    const firebaseConfig = {
      apiKey: 'AIzaSyAMBBUEHWeeZNhlRVVHTfwfky0vlMFdTlk',
      authDomain: 'freeform-4f8df.firebaseapp.com',
      databaseURL: 'https://freeform-4f8df-default-rtdb.firebaseio.com',
      projectId: 'freeform-4f8df',
      storageBucket: 'freeform-4f8df.firebasestorage.app',
      messagingSenderId: '591893852633',
      appId: '1:591893852633:web:f7a79fbe4d4cc89834e9c8',
      measurementId: 'G-GTE4S0JSMX'
    };

    const room = (new URLSearchParams(location.search).get('game') || 'game')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .slice(0, 40);

    const messagesElement = document.getElementById('messages');
    const form = document.getElementById('chatForm');
    const input = document.getElementById('chatInput');
    const sendButton = document.getElementById('sendButton');
    const errorElement = document.getElementById('chatError');
    const statusText = document.getElementById('statusText');
    const statusDot = document.getElementById('statusDot');

    let database = null;
    let currentUser = null;
    let currentUsername = 'Player';
    let stopListening = null;
    const seenMessageIds = new Set();

    function setStatus(text, state = '') {
      statusText.textContent = text;
      statusDot.className = 'status-dot' + (state ? ' ' + state : '');
    }

    function getUsername(user) {
      try {
        const saved = localStorage.getItem('freeformUsername');
        if (saved && saved.trim()) return saved.trim().slice(0, 20);
      } catch {}

      return String(user.displayName || 'Player').slice(0, 20);
    }

    function showEmptyIfNeeded() {
      if (messagesElement.querySelector('.message')) return;

      if (!document.getElementById('emptyState')) {
        const empty = document.createElement('div');
        empty.className = 'empty';
        empty.id = 'emptyState';
        empty.innerHTML =
          '<i class="fa-regular fa-message" aria-hidden="true"></i>' +
          'Join the room and send the first message.';
        messagesElement.appendChild(empty);
      }
    }

    function clearChatDisplay() {
      messagesElement.replaceChildren();
      seenMessageIds.clear();
      showEmptyIfNeeded();
    }

    function addMessage(id, data) {
      if (!data || typeof data.text !== 'string' || seenMessageIds.has(id)) return;

      seenMessageIds.add(id);
      document.getElementById('emptyState')?.remove();

      const own = data.uid === currentUser?.uid;
      const article = document.createElement('article');
      article.className = 'message' + (own ? ' own' : '');

      const meta = document.createElement('div');
      meta.className = 'message-meta';

      const name = document.createElement('span');
      name.className = 'message-name';
      name.textContent = String(data.username || 'Player').slice(0, 20);

      const time = document.createElement('time');
      const date = new Date(Number(data.createdAt) || Date.now());
      time.dateTime = date.toISOString();
      time.textContent = date.toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit'
      });

      const text = document.createElement('div');
      text.className = 'message-text';
      text.textContent = data.text.slice(0, 180);

      meta.append(name, time);
      article.append(meta, text);
      messagesElement.appendChild(article);
      messagesElement.scrollTop = messagesElement.scrollHeight;

      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'freeform-chat-message',
          messageId: id,
          uid: data.uid,
          name: String(data.username || 'Player').slice(0, 20),
          text: data.text.slice(0, 180)
        }, location.origin);
      }
    }

    function listenToRoom() {
      if (!database || !currentUser) return;

      if (typeof stopListening === 'function') {
        stopListening();
        stopListening = null;
      }

      clearChatDisplay();

      const roomQuery = query(
        ref(database, 'gameChats/' + room),
        orderByChild('createdAt'),
        limitToLast(60)
      );

      stopListening = onChildAdded(roomQuery, snapshot => {
        addMessage(snapshot.key, snapshot.val());
      });

      setStatus('Connected', 'online');
    }

    async function leaveRoom() {
      if (typeof stopListening === 'function') {
        stopListening();
        stopListening = null;
      }

      if (!database || !currentUser) {
        clearChatDisplay();
        return;
      }

      try {
        /*
          Remove only this player's messages from this game room.
          The supplied rules must allow an authenticated user to delete
          their own message record.
        */
        const ownMessagesQuery = query(
          ref(database, 'gameChats/' + room),
          orderByChild('uid'),
          limitToLast(1000)
        );

        const { get, orderByChild: orderByChildFn, query: makeQuery, ref: makeRef } =
          await import('https://www.gstatic.com/firebasejs/11.6.0/firebase-database.js');

        const ownQuery = makeQuery(
          makeRef(database, 'gameChats/' + room),
          orderByChildFn('uid')
        );

        const result = await get(ownQuery);
        const deletions = [];

        result.forEach(snapshot => {
          if (snapshot.val()?.uid === currentUser.uid) {
            deletions.push(remove(ref(database, `gameChats/${room}/${snapshot.key}`)));
          }
        });

        await Promise.all(deletions);
        void ownMessagesQuery;
      } catch (error) {
        console.warn('Could not remove this player’s room chat messages:', error);
      }

      clearChatDisplay();
    }

    form.addEventListener('submit', async event => {
      event.preventDefault();

      const text = input.value.trim().slice(0, 180);
      if (!text) return;

      if (!currentUser || !database) {
        errorElement.textContent = 'Sign in to FreeForm to use shared chat.';
        return;
      }

      sendButton.disabled = true;
      errorElement.textContent = '';

      try {
        const messageRef = push(ref(database, 'gameChats/' + room));

        await set(messageRef, {
          uid: currentUser.uid,
          username: currentUsername,
          text,
          createdAt: Date.now()
        });

        input.value = '';
        input.style.height = '36px';
        input.focus();
      } catch (error) {
        console.error('Chat message failed:', error);
        errorElement.textContent =
          'Message failed. Check Firebase sign-in and Realtime Database rules.';
      } finally {
        sendButton.disabled = false;
      }
    });

    input.addEventListener('keydown', event => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    input.addEventListener('input', () => {
      input.style.height = '36px';
      input.style.height = Math.min(input.scrollHeight, 88) + 'px';
    });

    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== window.parent) return;

      if (event.data?.type === 'freeform-chat-leaving') {
        leaveRoom();
      }
    });

    try {
      const app = getApps().length
        ? getApps()[0]
        : initializeApp(firebaseConfig);

      const auth = getAuth(app);
      database = getDatabase(app, firebaseConfig.databaseURL);

      onAuthStateChanged(auth, user => {
        currentUser = user;

        if (!user) {
          setStatus('Sign in required', 'error');
          errorElement.textContent =
            'Sign in to FreeForm before using shared game chat.';
          sendButton.disabled = true;

          if (typeof stopListening === 'function') {
            stopListening();
            stopListening = null;
          }
          clearChatDisplay();
          return;
        }

        currentUsername = getUsername(user);
        errorElement.textContent = '';
        sendButton.disabled = false;
        listenToRoom();
      });
    } catch (error) {
      console.error('Firebase chat initialization failed:', error);
      setStatus('Connection error', 'error');
      errorElement.textContent =
        'Could not connect. Check Firebase configuration and database rules.';
      sendButton.disabled = true;
    }

    window.addEventListener('pagehide', leaveRoom);
  </script>
</body>
</html>
