'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Navegação entre apps (redimensiona janela)
  navigate:           (appName) => ipcRenderer.send('navigate', appName),
  closeApp:           ()        => ipcRenderer.send('close-app'),

  // Localização (Astra + Horas)
  detectLocation:     ()             => ipcRenderer.invoke('detect-location'),
  searchCities:       (q)            => ipcRenderer.invoke('search-cities', q),
  getCityCoords:      (name, state)  => ipcRenderer.invoke('get-city-coords', name, state),
  searchCitiesNominatim: (q)         => ipcRenderer.invoke('search-cities-nominatim', q),

  // Geomantia
  savePdf:            (b64, fileName) => ipcRenderer.invoke('save-pdf', b64, fileName),
});
