const screen = document.querySelector("#screen");
const decoy = document.querySelector("#decoy");
const clock = document.querySelector("#clock");
const shortcutText = document.querySelector("#shortcutText");
const shortcutDialog = document.querySelector("#shortcutDialog");
const shortcutCapture = document.querySelector("#shortcutCapture");

const DEFAULT_SHORTCUT = ["Control", "Shift", "g"];
let capturedKeys = [];
let shortcut = JSON.parse(localStorage.getItem("mijn-ghast-shortcut") || "null") || DEFAULT_SHORTCUT;

function showPrivate() {
  decoy.style.visibility = "hidden";
  screen.classList.add("is-visible");
}

function hidePrivate() {
  screen.classList.remove("is-visible");
  decoy.style.visibility = "visible";
}

function formatShortcut(keys) {
  return keys.map((key) => {
    if (key === "Control") return "Ctrl";
    if (key === " ") return "Space";
    return key.length === 1 ? key.toUpperCase() : key;
  }).join(" + ");
}

function isShortcut(event) {
  if (!shortcut.length) return false;
  return shortcut.every((key) => {
    if (key === "Control") return event.ctrlKey;
    if (key === "Alt") return event.altKey;
    if (key === "Shift") return event.shiftKey;
    if (key === "Meta") return event.metaKey;
    return event.key.toLowerCase() === key.toLowerCase();
  });
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function captureKeys(event) {
  event.preventEvent?.();
  if (["Tab", "Enter", "Escape", "Backspace"].includes(event.key)) return;
  const keys = [];
  if (event.ctrlKey) keys.push("Control");
  if (event.altKey) keys.push("Alt");
  if (event.shiftKey) keys.push("Shift");
  if (event.metaKey) keys.push("Meta");
  if (!["Control", "Alt", "Shift", "Meta"].includes(event.key)) keys.push(event.key);
  capturedKeys = [...new Set(keys)];
  shortcutCapture.value = formatShortcut(capturedKeys);
}

document.addEventListener("keydown", (event) => {
  if (shortcutDialog.open) captureKeys(event);
  if (isShortcut(event) && !shortcutDialog.open) {
    event.preventDefault();
    showPrivate();
  }
  if (event.key === "Escape") hidePrivate();
});

document.querySelector("#hideButton").addEventListener("click", hidePrivate);
document.querySelector("#switchMode").addEventListener("click", () => {
  screen.classList.toggle("is-visible");
  decoy.style.visibility = screen.classList.contains("is-visible") ? "hidden" : "visible";
});

document.querySelector("#editShortcut").addEventListener("click", () => {
  capturedKeys = [];
  shortcutCapture.value = "";
  shortcutDialog.showModal();
  shortcutCapture.focus();
});

document.querySelector("#shortcutForm").addEventListener("submit", (event) => {
  if (event.submitter?.value === "default" && capturedKeys.length) {
    shortcut = capturedKeys;
    localStorage.setItem("mijn-ghast-shortcut", JSON.stringify(shortcut));
    shortcutText.textContent = formatShortcut(shortcut);
  }
});

let touchStart = null;
document.addEventListener("touchstart", (event) => {
  touchStart = { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY };
}, { passive: true });

document.addEventListener("touchend", (event) => {
  if (!touchStart) return;
  const dx = event.changedTouches[0].clientX - touchStart.x;
  const dy = event.changedTouches[0].clientY - touchStart.y;
  if (Math.abs(dy) > 80 && dy < 0) showPrivate();
  if (screen.classList.contains("is-visible") && dx > 120) hidePrivate();
  touchStart = null;
}, { passive: true });

let tapCount = 0;
let tapTimer;
document.querySelector(".decoy").addEventListener("click", () => {
  tapCount += 1;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount = 0; }, 900);
  if (tapCount === 5) {
    tapCount = 0;
    showPrivate();
  }
});

shortcutText.textContent = formatShortcut(shortcut);
updateClock();
setInterval(updateClock, 30_000);
hidePrivate();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
if (window.ghast) {
  document.querySelector("#hideButton")?.addEventListener("click", () => window.ghast.activateGhost());
  document.querySelector("#switchMode")?.addEventListener("click", () => window.ghast.hidePrivate());
}
