'use strict';

const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path  = require('path');
const fs    = require('fs');
const os    = require('os');
const https = require('https');

let mainWindow;

// Tamanhos por app
const APP_SIZES = {
  hub:       { width: 520,  height: 550,  minWidth: 420,  minHeight: 480 },
  astra:     { width: 860,  height: 520,  minWidth: 600,  minHeight: 380 },
  geomantia: { width: 900,  height: 680,  minWidth: 720,  minHeight: 540 },
  horae:     { width: 720,  height: 560,  minWidth: 640,  minHeight: 480 },
  shem:      { width: 720,  height: 640,  minWidth: 600,  minHeight: 480 },
  tattvas:   { width: 720,  height: 640,  minWidth: 600,  minHeight: 480 },
};

function createWindow() {
  const s = APP_SIZES.hub;
  mainWindow = new BrowserWindow({
    width:     s.width,
    height:    s.height,
    minWidth:  s.minWidth,
    minHeight: s.minHeight,
    frame:     false,
    transparent: true,
    resizable: true,
    hasShadow: false,
    webPreferences: {
      preload:          path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration:  false,
      webSecurity:      false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// ── Navegação: redimensiona a janela ao trocar de app ─────────────────────────
ipcMain.on('navigate', (_, appName) => {
  const s = APP_SIZES[appName] || APP_SIZES.hub;
  if (mainWindow) {
    mainWindow.setMinimumSize(s.minWidth, s.minHeight);
    mainWindow.setSize(s.width, s.height, true);
    mainWindow.center();
  }
});

// ── Fechar app ────────────────────────────────────────────────────────────────
ipcMain.on('close-app', () => {
  if (mainWindow) mainWindow.close();
});

// ── Helpers HTTP ──────────────────────────────────────────────────────────────
function fetchJSON(url, headers = {}) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'HermeticaSuite/1.0', ...headers } }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

// ── Localização por IP ────────────────────────────────────────────────────────
ipcMain.handle('detect-location', async () => {
  try {
    const data = await fetchJSON('https://ipwho.is/');
    if (data && data.success) {
      return { ok: true, name: data.city || '', lat: data.latitude, lon: data.longitude };
    }
    return { ok: false };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── Busca cidades (IBGE + Nominatim) ─────────────────────────────────────────
ipcMain.handle('search-cities', async (_, query) => {
  try {
    const all = await fetchJSON('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome');
    const term = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matches = all
      .filter(m => m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').startsWith(term))
      .slice(0, 12)
      .map(m => ({
        name:  m.nome,
        state: m['regiao-imediata']['regiao-intermediaria'].UF.sigla,
      }));
    return matches;
  } catch (e) { return []; }
});

// ── Coordenadas por cidade (Nominatim) ───────────────────────────────────────
ipcMain.handle('get-city-coords', async (_, name, state) => {
  try {
    const q = encodeURIComponent(`${name}, ${state}, Brasil`);
    const results = await fetchJSON(
      `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=br`,
      { 'Accept-Language': 'pt-BR' }
    );
    if (results.length > 0) {
      return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
    }
    throw new Error('Não encontrado');
  } catch (e) { throw e; }
});

// ── Busca cidades Nominatim genérica (Horas) ─────────────────────────────────
ipcMain.handle('search-cities-nominatim', async (_, q) => {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8&accept-language=pt-BR`;
    const data = await fetchJSON(url);
    return { ok: true, results: data };
  } catch (e) { return { ok: false, error: e.message }; }
});

// ── Salvar PDF (Geomantia) ────────────────────────────────────────────────────
ipcMain.handle('save-pdf', async (_, pdfBase64, fileName) => {
  try {
    const buf     = Buffer.from(pdfBase64, 'base64');
    const geoDir  = path.join(os.homedir(), 'Documents', 'Geomantia Hermetica');
    if (!fs.existsSync(geoDir)) fs.mkdirSync(geoDir, { recursive: true });
    const filePath = path.join(geoDir, fileName);
    fs.writeFileSync(filePath, buf);
    shell.openPath(filePath);
    return { ok: true, path: filePath };
  } catch (e) { return { ok: false, error: e.message }; }
});
