const screen = document.querySelector("#screen");
const decoy = document.querySelector("#decoy");
const clock = document.querySelector("#clock");
const shortcutText = document.querySelector("#shortcutText");
const appNameTitle = document.querySelector("#appNameTitle");
const modeEyebrow = document.querySelector("#modeEyebrow");
const settingsDialog = document.querySelector("#settingsDialog");
const helpDialog = document.querySelector("#helpDialog");
let config = null;

function formatShortcut(value) {
  if (!value) return "Niet ingesteld";
  return value
    .replaceAll("CommandOrControl", "Ctrl")
    .replaceAll("+", " + ")
    .replaceAll("Control", "Ctrl");
}

function showPrivate() {
  decoy.style.visibility = "hidden";
  screen.classList.add("is-visible");
  modeEyebrow.textContent = config?.mode === "normal" ? "NORMALE MODUS" : "PRIVATE SPACE";
  appNameTitle.textContent = `${config?.appName || "Ghast"}.`;
}

function hidePrivate() {
  screen.classList.remove("is-visible");
  decoy.style.visibility = "visible";
  if (window.ghast) window.ghast.hidePrivate();
}

function updateClock() {
  clock.textContent = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function addAppRow(app = { label: "", processName: "" }) {
  const row = document.createElement("div");
  row.className = "app-row";
  row.innerHTML = `
    <input class="app-label" maxlength="40" value="${escapeHtml(app.label)}" placeholder="Naam" aria-label="Appnaam" />
    <input class="app-process" maxlength="100" value="${escapeHtml(app.processName)}" placeholder="Procesnaam" aria-label="Procesnaam" />
    <button class="remove-app" type="button" aria-label="App verwijderen">Verwijderen</button>`;
  row.querySelector(".remove-app").addEventListener("click", () => row.remove());
  document.querySelector("#appRows").append(row);
}

function escapeHtml(value) {
  const element = document.createElement("span");
  element.textContent = value || "";
  return element.innerHTML;
}

async function openSettings() {
  if (window.ghast) config = await window.ghast.getConfig();
  config ||= {
    appName: "Ghast",
    ghostShortcut: "CommandOrControl+Shift+G",
    mode: "ghost",
    hideApps: true,
    hideWindowOnGhost: true,
    lockOnGhost: false,
    apps: [],
  };
  document.querySelector("#appName").value = config.appName || "Ghast";
  document.querySelector("#modeSelect").value = config.mode || "ghost";
  document.querySelector("#shortcutCapture").value = config.ghostShortcut || "";
  document.querySelector("#hideApps").checked = config.hideApps !== false;
  document.querySelector("#hideWindow").checked = config.hideWindowOnGhost !== false;
  document.querySelector("#lockDesktop").checked = Boolean(config.lockOnGhost);
  document.querySelector("#appRows").replaceChildren();
  (config.apps || []).forEach(addAppRow);
  settingsDialog.showModal();
}

async function saveSettings(event) {
  event.preventEvent?.();
  event.preventDefault();
  const nextConfig = {
    appName: document.querySelector("#appName").value.trim() || "Ghast",
    ghostShortcut: document.querySelector("#shortcutCapture").value.trim(),
    mode: document.querySelector("#modeSelect").value,
    hideApps: document.querySelector("#hideApps").checked,
    hideWindowOnGhost: document.querySelector("#hideWindow").checked,
    lockOnGhost: document.querySelector("#lockDesktop").checked,
    apps: [...document.querySelectorAll(".app-row")].map((row) => ({
      label: row.querySelector(".app-label").value.trim(),
      processName: row.querySelector(".app-process").value.trim(),
    })).filter((app) => app.processName),
  };
  if (window.ghast) config = await window.ghast.saveConfig(nextConfig);
  else config = nextConfig;
  shortcutText.textContent = formatShortcut(config.ghostShortcut);
  showPrivate();
  settingsDialog.close();
}

async function resetSettings() {
  if (window.ghast) config = await window.ghast.resetConfig();
  else config = null;
  await openSettings();
}

document.querySelector("#hideButton").addEventListener("click", hidePrivate);
document.querySelector("#settingsButton").addEventListener("click", openSettings);
document.querySelector("#helpButton").addEventListener("click", () => helpDialog.showModal());
document.querySelector("#ghostAction").addEventListener("click", () => window.ghast?.activateGhost());
document.querySelector("#addApp").addEventListener("click", () => addAppRow());
document.querySelector("#settingsForm").addEventListener("submit", saveSettings);
document.querySelector("#resetConfig").addEventListener("click", resetSettings);
document.querySelectorAll("[data-close-dialog]").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.closeDialog}`).close());
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !document.querySelector("dialog[open]")) hidePrivate();
});

let tapCount = 0;
let tapTimer;
decoy.addEventListener("click", () => {
  tapCount += 1;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => { tapCount = 0; }, 900);
  if (tapCount === 5) {
    tapCount = 0;
    showPrivate();
  }
});

updateClock();
setInterval(updateClock, 30_000);
if (window.ghast) {
  window.ghast.onOpenSettings(() => openSettings());
  window.ghast.getConfig().then((stored) => {
    config = stored;
    shortcutText.textContent = formatShortcut(config.ghostShortcut);
    showPrivate();
  });
} else {
  hidePrivate();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js"));
}
