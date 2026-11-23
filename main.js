const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const { execFile } = require("child_process");
const fs = require("fs");

let window;
let tray;
let config;

const DEFAULT_CONFIG = {
  appName: "Ghast",
  ghostShortcut: "CommandOrControl+Shift+G",
  mode: "ghost",
  hideApps: true,
  lockOnGhost: false,
  hideWindowOnGhost: true,
  apps: [
    { label: "Roblox", processName: "RobloxPlayerBeta" },
    { label: "Bloxstrap", processName: "Bloxstrap" },
  ],
};

function configPath() {
  return path.join(app.getPath("userData"), "config.json");
}

function loadConfig() {
  try {
    const stored = JSON.parse(fs.readFileSync(configPath(), "utf8"));
    config = {
      ...DEFAULT_CONFIG,
      ...stored,
      apps: Array.isArray(stored.apps) ? stored.apps : DEFAULT_CONFIG.apps,
    };
  } catch {
    config = structuredClone(DEFAULT_CONFIG);
  }
}

function saveConfig(nextConfig) {
  config = {
    ...DEFAULT_CONFIG,
    ...nextConfig,
    apps: Array.isArray(nextConfig.apps)
      ? nextConfig.apps.filter((app) => app.processName?.trim()).map((app) => ({
          label: app.label?.trim() || app.processName.trim(),
          processName: app.processName.trim(),
        }))
      : [],
  };
  fs.mkdirSync(path.dirname(configPath()), { recursive: true });
  fs.writeFileSync(configPath(), JSON.stringify(config, null, 2), "utf8");
  registerGhostShortcut();
  return config;
}

function minimizeConfiguredApps() {
  if (!config.hideApps || !config.apps.length) return;
  const processNames = config.apps.map((app) => app.processName);
  const script = `
$names = $env:GHAST_APP_NAMES -split '\\|'
Add-Type @'
using System;
using System.Runtime.InteropServices;
using System.Text;
public static class GhastWindows {
  [DllImport("user32.dll")]
  public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
  [DllImport("user32.dll")]
  public static extern bool IsWindowVisible(IntPtr hWnd);
  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
}
'@
$processIds = @{}
Get-Process -ErrorAction SilentlyContinue |
  Where-Object { $names -contains $_.ProcessName } |
  ForEach-Object { $processIds[[uint32]$_.Id] = $true }
[GhastWindows]::EnumWindows({
  param($hWnd, $lParam)
  $processId = [uint32]0
  [GhastWindows]::GetWindowThreadProcessId($hWnd, [ref]$processId) | Out-Null
  if ($processIds.ContainsKey($processId) -and [GhastWindows]::IsWindowVisible($hWnd)) {
    [GhastWindows]::ShowWindow($hWnd, 6) | Out-Null
  }
  return $true
}, [IntPtr]::Zero) | Out-Null
`;
  const buffer = Buffer.from(script, "utf16le");
  execFile(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-EncodedCommand", buffer.toString("base64")],
    { env: { ...process.env, GHAST_APP_NAMES: processNames.join("|") }, windowsHide: true },
    () => {},
  );
}

function lockDesktop() {
  if (config.lockOnGhost) {
    execFile("rundll32.exe", ["user32.dll,LockWorkStation"], { windowsHide: true }, () => {});
  }
}

function createWindow() {
  window = new BrowserWindow({
    width: 900,
    height: 600,
    frame: false,
    transparent: false,
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "icon.svg"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  window.loadFile("index.html");
  window.on("close", (event) => {
    event.preventDefault();
    window.hide();
  });
}

function showPrivateScreen() {
  if (!window) return;
  window.show();
  window.focus();
}

function hidePrivateScreen() {
  if (window) window.hide();
}

function activateGhost() {
  minimizeConfiguredApps();
  if (config.hideWindowOnGhost) hidePrivateScreen();
  lockDesktop();
}

function registerGhostShortcut() {
  globalShortcut.unregisterAll();
  if (config.ghostShortcut) {
    try {
      globalShortcut.register(config.ghostShortcut, activateGhost);
    } catch {}
  }
}

app.whenReady().then(() => {
  loadConfig();
  createWindow();

  tray = new Tray(path.join(__dirname, "icon.svg"));
  tray.setToolTip("Mijn Ghast");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Open normaal / privé", click: showPrivateScreen },
    { label: "Ghost-modus activeren", click: activateGhost },
    { label: "Instellingen", click: () => {
      showPrivateScreen();
      window.webContents.send("open-settings");
    } },
    { type: "separator" },
    { label: "Afsluiten", click: () => {
      globalShortcut.unregisterAll();
      window.destroy();
      app.quit();
    } },
  ]));
  registerGhostShortcut();
});

app.on("window-all-closed", () => {});
app.on("will-quit", () => globalShortcut.unregisterAll());

ipcMain.on("show-private", showPrivateScreen);
ipcMain.on("hide-private", hidePrivateScreen);
ipcMain.on("activate-ghost", activateGhost);
ipcMain.handle("get-config", () => config);
ipcMain.handle("save-config", (_event, nextConfig) => saveConfig(nextConfig));
ipcMain.handle("reset-config", () => saveConfig(structuredClone(DEFAULT_CONFIG)));
