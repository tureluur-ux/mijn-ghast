const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("ghast", {
  showPrivate: () => ipcRenderer.send("show-private"),
  hidePrivate: () => ipcRenderer.send("hide-private"),
  activateGhost: () => ipcRenderer.send("activate-ghost"),
});
