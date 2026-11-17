'use strict';

document.getElementById('btn-close').addEventListener('click', () => {
  if (window.electronAPI) window.electronAPI.closeApp();
});

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', () => {
    const appName = card.dataset.app;
    const page    = card.dataset.page;

    // Notifica o main process para redimensionar a janela
    if (window.electronAPI) window.electronAPI.navigate(appName);

    // Navega para a página do app após pequeno delay (janela redimensiona)
    setTimeout(() => {
      window.location.href = page;
    }, 120);
  });
});
