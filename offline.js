const OFFLINE_REPLIES = [
  "Abhi X-BRAIN offline mode mein hai. Internet connect karo to main full AI mode mein aa jaunga. 🤍",
  "Internet connection nahi mil raha. Main app ko offline mode mein chala raha hoon. ⚡",
  "Main abhi offline hoon. Basic app features available hain; full AI ke liye internet chahiye. 💙"
];

function getOfflineReply() {
  return OFFLINE_REPLIES[
    Math.floor(Math.random() * OFFLINE_REPLIES.length)
  ];
}

function isOnline() {
  return navigator.onLine;
}

window.addEventListener("online", () => {
  console.log("X-BRAIN: Online");
});

window.addEventListener("offline", () => {
  console.log("X-BRAIN: Offline");
});
