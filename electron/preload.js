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
    return () => ipcRenderer.removeListener('new-log-line', subscription);
  },
  // NOUVEAU : Pour les messages de mise à jour
  onUpdateStatus: (callback) => {
    const subscription = (_event, value) => callback(value);
    ipcRenderer.on('update-status', subscription);
    return () => ipcRenderer.removeListener('update-status', subscription);
  },
  startMonitoring: () => ipcRenderer.send('start-monitoring'),
  stopMonitoring: () => ipcRenderer.send('stop-monitoring'),
  clearAllListeners: () => {
    ipcRenderer.removeAllListeners('new-log-line');
    ipcRenderer.removeAllListeners('log-file-changed');
    ipcRenderer.removeAllListeners('log-status');
    ipcRenderer.removeAllListeners('update-status');
  }
});