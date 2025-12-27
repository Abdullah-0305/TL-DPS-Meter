const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater'); 
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');
const os = require('os');

let mainWindow;
const LOG_DIR = path.join(os.homedir(), 'AppData', 'Local', 'TL', 'Saved', 'CombatLogs');

let currentLogPath = null;
let currentOffset = 0;
let isMonitoring = false;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100, height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    backgroundColor: '#1a1a1a',
  });

  if (isDev && process.env.ELECTRON_START_URL) {
    mainWindow.loadURL(process.env.ELECTRON_START_URL);
  } else {
    const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
    mainWindow.loadFile(indexPath).catch(err => console.error(err));
  }

  mainWindow.webContents.on('did-finish-load', () => {
    initLogWatcher();
  });

  mainWindow.once('ready-to-show', () => {
    if (!isDev) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  });
}

// --- GESTION DES MISES À JOUR ---
autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('update-status', 'Vérification des mises à jour...');
});

autoUpdater.on('update-available', (info) => {
  mainWindow.webContents.send('update-status', `Mise à jour v${info.version} disponible !`);
});

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('update-status', ''); // On cache si rien n'est trouvé
});

autoUpdater.on('download-progress', (progressObj) => {
  const msg = `Téléchargement : ${Math.round(progressObj.percent)}%`;
  mainWindow.webContents.send('update-status', msg);
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-status', 'Mise à jour prête ! Redémarrez l\'application.');
});

autoUpdater.on('error', (err) => {
  mainWindow.webContents.send('update-status', `Erreur Update : ${err.message}`);
});

// --- LOGIQUE DE L'APP ---
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function getLatestLogFile(dir) {
  try {
    if (!fs.existsSync(dir)) return null;
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.log') || f.endsWith('.txt'))
      .map(f => ({
        name: f, path: path.join(dir, f),
        time: fs.statSync(path.join(dir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    return files.length > 0 ? files[0] : null;
  } catch (err) { return null; }
}

ipcMain.on('start-monitoring', () => {
  const file = getLatestLogFile(LOG_DIR);
  if (file) {
    currentLogPath = file.path;
    try {
      const stats = fs.statSync(currentLogPath);
      currentOffset = stats.size; 
      isMonitoring = true;
      mainWindow.webContents.send('log-status', `En attente de combat...`);
      mainWindow.webContents.send('log-file-changed', file.name);
    } catch (e) { console.error(e); }
  }
});

ipcMain.on('stop-monitoring', () => {
  isMonitoring = false;
  mainWindow.webContents.send('log-status', 'Pause');
});

function initLogWatcher() {
  const watcher = chokidar.watch(LOG_DIR, {
    persistent: true, ignoreInitial: true, depth: 0,
    usePolling: true, interval: 100
  });

  watcher.on('change', (filePath) => {
    if (!isMonitoring || filePath !== currentLogPath) return;
    try {
      const stats = fs.statSync(filePath);
      if (stats.size > currentOffset) {
        const stream = fs.createReadStream(filePath, { start: currentOffset, end: stats.size });
        let newData = '';
        stream.on('data', (chunk) => { newData += chunk.toString(); });
        stream.on('end', () => {
          currentOffset = stats.size;
          const lines = newData.split(/\r?\n/);
          lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed && trimmed.includes(',')) {
              mainWindow.webContents.send('new-log-line', trimmed);
            }
          });
        });
      }
    } catch (err) { console.error(err); }
  });
}