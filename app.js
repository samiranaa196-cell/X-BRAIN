const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const clearBtn = document.getElementById("clearBtn");

let history = JSON.parse(localStorage.getItem("xbrain_history") || "[]");
let busy = false;

const OFFLINE_REPLIES = [
  "Abhi X-BRAIN offline mode mein hai. Internet connect karo to full AI mode available ho jayega. 🤍",
  "Internet connection nahi mil raha. Basic X-BRAIN offline mode active hai. ⚡",
  "Main abhi offline hoon. Internet connect karne ke baad main tumhare messages ka AI answer de sakta hoon. 💙"
];

function saveHistory() {
  localStorage.setItem(
    "xbrain_history",
    JSON.stringify(history.slice(-20))
  );
}

function addMessage(text, type) {
  const row = document.createElement("div");
  row.className = `message-row ${type}`;

  const bubble = document.createElement("div");
  bubble.className = "message";
  bubble.textContent = text;

  row.appendChild(bubble);
  chat.appendChild(row);

  chat.scrollTop = chat.scrollHeight;

  return row;
}

function addTyping() {
  const row = document.createElement("div");
  row.className = "message-row ai";
  row.id = "typing";

  row.innerHTML = `
    <div class="message">
      <div class="typing">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  `;

  chat.appendChild(row);
  chat.scrollTop = chat.scrollHeight;
}

function removeTyping() {
  const typing = document.getElementById("typing");

  if (typing) {
    typing.remove();
  }
}

function getOfflineReply() {
  return OFFLINE_REPLIES[
    Math.floor(Math.random() * OFFLINE_REPLIES.length)
  ];
}

function hideWelcome() {
  const currentWelcome = document.getElementById("welcome");

  if (currentWelcome) {
    currentWelcome.style.display = "none";
  }
}

function addSavedMessages() {
  if (!history.length) return;

  hideWelcome();

  history.forEach((item) => {
    if (
      item &&
      (item.role === "user" || item.role === "assistant") &&
      typeof item.content === "string"
    ) {
      addMessage(
        item.content,
        item.role === "user" ? "user" : "ai"
      );
    }
  });
}

async function sendMessage() {
  if (busy) return;

  const message = input.value.trim();

  if (!message) return;

  busy = true;
  sendBtn.disabled = true;

  hideWelcome();

  addMessage(message, "user");

  input.value = "";

  /*
   * OFFLINE MODE
   */
  if (!navigator.onLine) {
    addTyping();

    setTimeout(() => {
      removeTyping();

      const reply = getOfflineReply();

      addMessage(reply, "ai");

      history.push({
        role: "user",
        content: message
      });

      history.push({
        role: "assistant",
        content: reply
      });

      saveHistory();

      busy = false;
      sendBtn.disabled = false;
      input.focus();
    }, 500);

    return;
  }

  /*
   * ONLINE AI MODE
   */

  addTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        message,
        history: history.slice(-20)
      })
    });

    const data = await response.json();

    removeTyping();

    if (!response.ok) {
      throw new Error(
        data.error || "Something went wrong."
      );
    }

    const reply =
      data.reply ||
      "Sorry, I couldn't answer that.";

    addMessage(reply, "ai");

    history.push({
      role: "user",
      content: message
    });

    history.push({
      role: "assistant",
      content: reply
    });

    history = history.slice(-20);

    saveHistory();

  } catch (error) {

    removeTyping();

    console.error("X-BRAIN:", error);

    const reply =
      "Internet connection ya server mein problem hai. Thori der baad dobara try karo. ⚡";

    addMessage(reply, "ai");

  } finally {

    busy = false;
    sendBtn.disabled = false;
    input.focus();

  }
}


/*
 * SEND BUTTON
 */

sendBtn.addEventListener("click", sendMessage);


/*
 * ENTER TO SEND
 */

input.addEventListener("keydown", (event) => {

  if (event.key === "Enter") {

    event.preventDefault();

    sendMessage();

  }

});


/*
 * SUGGESTION BUTTONS
 */

function setupSuggestions() {

  document
    .querySelectorAll("[data-prompt]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        input.value = button.dataset.prompt;

        input.focus();

      });

    });

}

setupSuggestions();


/*
 * NEW CHAT
 */

clearBtn.addEventListener("click", () => {

  history = [];

  localStorage.removeItem("xbrain_history");

  chat.innerHTML = "";

  const newWelcome =
    document.createElement("section");

  newWelcome.className = "welcome";

  newWelcome.id = "welcome";

  newWelcome.innerHTML = `
    <div class="hero-logo">
      <span>X</span>
    </div>

    <h2>Hello 👋</h2>

    <h3>I'm <strong>X-BRAIN</strong></h3>

    <p>
      Your friendly AI assistant.<br>
      Ask me anything and let's get started.
    </p>

    <div class="suggestions">

      <button data-prompt="Explain something to me in a simple way">
        <b>🧠 Explain</b>
        <small>Make something easy to understand</small>
      </button>

      <button data-prompt="Help me create a website">
        <b>💻 Coding</b>
        <small>Build websites and apps</small>
      </button>

      <button data-prompt="Give me a creative idea">
        <b>💡 Ideas</b>
        <small>Creative ideas and solutions</small>
      </button>

      <button data-prompt="Help me write something">
        <b>✍️ Write</b>
        <small>Messages, posts and more</small>
      </button>

    </div>
  `;

  chat.appendChild(newWelcome);

  newWelcome
    .querySelectorAll("[data-prompt]")
    .forEach((button) => {

      button.addEventListener("click", () => {

        input.value =
          button.dataset.prompt;

        input.focus();

      });

    });

  input.focus();

});


/*
 * ONLINE / OFFLINE STATUS
 */

window.addEventListener("online", () => {

  console.log("X-BRAIN: Internet connected");

});


window.addEventListener("offline", () => {

  console.log("X-BRAIN: Offline mode");

});


/*
 * SERVICE WORKER
 */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker
      .register("/sw.js")
      .then(() => {

        console.log(
          "X-BRAIN: Offline system ready"
        );

      })
      .catch((error) => {

        console.error(
          "Service Worker Error:",
          error
        );

      });

  });

}


/*
 * LOAD PREVIOUS CHAT
 */

window.addEventListener("DOMContentLoaded", () => {

  addSavedMessages();

  input.focus();

});
