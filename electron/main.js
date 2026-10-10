// navi-radio Electron main process
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    backgroundColor: '#0a0a0f',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // load the local index.html (same file that ships to Pages)
  // packaged at the app root via the build's from/to file mapping
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- native filesystem bridge (bypasses Brave's disabled File System Access API) ---

const AUDIO_EXTS = new Set(['.mp3', '.flac', '.ogg', '.oga', '.wav', '.m4a', '.aac', '.opus', '.wma', '.aiff']);

function scanDir(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      scanDir(full, out);
    } else if (e.isFile() && AUDIO_EXTS.has(path.extname(e.name).toLowerCase())) {
      out.push(full);
    }
  }
}

ipcMain.handle('navi-radio:pick-music-dir', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Select your music folder',
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  const dir = result.filePaths[0];
  const files = [];
  scanDir(dir, files);
  files.sort();
  return { dir, files };
});

ipcMain.handle('navi-radio:read-file', async (_event, filePath) => {
  // return as base64 data URL for <audio> playback
  const data = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = {
    '.mp3': 'audio/mpeg', '.flac': 'audio/flac', '.ogg': 'audio/ogg',
    '.oga': 'audio/ogg', '.wav': 'audio/wav', '.m4a': 'audio/mp4',
    '.aac': 'audio/aac', '.opus': 'audio/opus', '.wma': 'audio/x-ms-wma',
    '.aiff': 'audio/aiff',
  }[ext] || 'audio/mpeg';
  return `data:${mime};base64,${data.toString('base64')}`;
});
