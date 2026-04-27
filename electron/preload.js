const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose any specific electron functions here if needed
  // For this app, we communicate with the backend via HTTP, so this might be mostly empty
  getVersion: () => process.versions.electron
});
