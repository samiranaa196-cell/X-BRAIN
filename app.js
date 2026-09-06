const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const welcome = document.getElementById("welcome");
const clearBtn = document.getElementById("clearBtn");

let history = [];
let busy = false;

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
  if (typing) typing.remove();
}

async function sendMessage() {
  if (busy) return;

  const message = input.value.trim();

  if (!message) return;

  busy = true;
  sendBtn.disabled = true;

  if (welcome) {
    welcome.style.display = "none";
  }

  addMessage(message, "user");

  input.value = "";
  addTyping();

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message,
        history
      })
    });

    const data = await response.json();

    removeTyping();

    if (!response.ok) {
      throw new Error(data.error || "Something went wrong.");
    }

    const reply = data.reply || "Sorry, I couldn't answer that.";

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

  } catch (error) {
    removeTyping();

    addMessage(
      "Sorry, X-BRAIN is temporarily unavailable. Please try again.",
      "ai"
    );

    console.error(error);

  } finally {
    busy = false;
    sendBtn.disabled = false;
    input.focus();
  }
}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    sendMessage();
  }
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    input.value = button.dataset.prompt;
    input.focus();
  });
});

clearBtn.addEventListener("click", () => {
  history = [];

  chat.innerHTML = "";

  const newWelcome = document.createElement("section");
  newWelcome.className = "welcome";

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

  newWelcome.querySelectorAll("[data-prompt]").forEach((button) => {
    button.addEventListener("click", () => {
      input.value = button.dataset.prompt;
      input.focus();
    });
  });

  input.focus();
});

input.focus();
