const { contextBridge } = require('electron')

// Expose a flag so the web app can detect it's running inside Electron
contextBridge.exposeInMainWorld('electronAPI', {
  isElectron: true,
  platform: process.platform,
})
