// preload bridge — exposes native fs to the web UI when running in Electron
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('naviRadioNative', {
  isElectron: true,
  pickMusicDir: () => ipcRenderer.invoke('navi-radio:pick-music-dir'),
  readFile: (filePath) => ipcRenderer.invoke('navi-radio:read-file', filePath),
});
