// electron/preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  onLogFileChanged: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('log-file-changed', subscription);
    return () => ipcRenderer.removeListener('log-file-changed', subscription);
  },
  onStatusUpdate: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('log-status', subscription);
    return () => ipcRenderer.removeListener('log-status', subscription);
  },
  onNewLogLine: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('new-log-line', subscription);
    // On retourne une fonction pour supprimer spécifiquement cet écouteur
    return () => ipcRenderer.removeListener('new-log-line', subscription);
  },
  startMonitoring: () => ipcRenderer.send('start-monitoring'),
  stopMonitoring: () => ipcRenderer.send('stop-monitoring'),
  // Méthode de secours pour tout nettoyer d'un coup
  clearAllListeners: () => {
    ipcRenderer.removeAllListeners('new-log-line');
    ipcRenderer.removeAllListeners('log-file-changed');
    ipcRenderer.removeAllListeners('log-status');
  }
});