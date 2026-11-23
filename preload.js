const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ghast", {
  showPrivate: () => ipcRenderer.send("show-private"),
  hidePrivate: () => ipcRenderer.send("hide-private"),
  activateGhost: () => ipcRenderer.send("activate-ghost"),
  getConfig: () => ipcRenderer.invoke("get-config"),
  saveConfig: (config) => ipcRenderer.invoke("save-config", config),
  resetConfig: () => ipcRenderer.invoke("reset-config"),
  onOpenSettings: (callback) => ipcRenderer.on("open-settings", callback),
});
