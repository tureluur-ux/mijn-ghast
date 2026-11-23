const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

let window;
let tray;

function minimizeRoblox() {
  const script = `
$source = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public static class WindowsApi {
  public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);

  [DllImport("user32.dll")]
  public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);

  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

  [DllImport("user32.dll")]
  public static extern bool IsWindowVisible(IntPtr hWnd);

  [DllImport("user32.dll")]
  public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

  [DllImport("user32.dll", CharSet = CharSet.Unicode)]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
}
'@
Add-Type -TypeDefinition $source
$processIds = @{}
Get-Process -ErrorAction SilentlyContinue |
  Where-Object { $_.ProcessName -match 'Roblox|Bloxstrap' } |
  ForEach-Object { $processIds[[uint32]$_.Id] = $true }

[WindowsApi]::EnumWindows({
  param($hWnd, $lParam)
  $processId = [uint32]0
  [WindowsApi]::GetWindowThreadProcessId($hWnd, [ref]$processId) | Out-Null
  if ($processIds.ContainsKey($processId) -and [WindowsApi]::IsWindowVisible($hWnd)) {
    [WindowsApi]::ShowWindow($hWnd, 6) | Out-Null
  }
  return $true
}, [IntPtr]::Zero) | Out-Null
`;
  execFile("powershell.exe", ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-Command", script], () => {});
}

function lockDesktop() {
  execFile("rundll32.exe", ["user32.dll,LockWorkStation"], () => {});
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
  window.setAlwaysOnTop(true, "screen-saver");
  setTimeout(() => window.setAlwaysOnTop(false), 300);
}

function hidePrivateScreen() {
  if (window) window.hide();
}

function activateGhost() {
  minimizeRoblox();
  hidePrivateScreen();
  lockDesktop();
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, "icon.svg"));
  tray.setToolTip("Mijn Ghast");
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: "Open privé-scherm", click: showPrivateScreen },
    { label: "Verberg Roblox en vergrendel", click: activateGhost },
    { type: "separator" },
    { label: "Afsluiten", click: () => {
      globalShortcut.unregisterAll();
      window.destroy();
      app.quit();
    } },
  ]));

  globalShortcut.register("CommandOrControl+Shift+G", activateGhost);
});

app.on("window-all-closed", () => {});
app.on("will-quit", () => globalShortcut.unregisterAll());

ipcMain.on("show-private", showPrivateScreen);
ipcMain.on("hide-private", hidePrivateScreen);
ipcMain.on("activate-ghost", activateGhost);
