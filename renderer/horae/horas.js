'use strict';

// ── Dados dos planetas ────────────────────────────────────────────────────────
const PLANETAS = [
  { nome: 'Sol',      sym: '☉', cor: '#c4890a' },
  { nome: 'Lua',      sym: '☽', cor: '#7a7a9a' },
  { nome: 'Marte',    sym: '♂', cor: '#aa2020' },
  { nome: 'Mercúrio', sym: '☿', cor: '#3a7a3a' },
  { nome: 'Júpiter',  sym: '♃', cor: '#1a4a8a' },
  { nome: 'Vênus',    sym: '♀', cor: '#8a2a6a' },
  { nome: 'Saturno',  sym: '♄', cor: '#555060' },
];

// Ordem caldeia: Saturno=6, Júpiter=4, Marte=2, Sol=0, Vênus=5, Mercúrio=3, Lua=1
const ORDEM_CALDEIA = [6, 4, 2, 0, 5, 3, 1];

// Regente do dia: 0=Dom(Sol), 1=Seg(Lua), 2=Ter(Marte), 3=Qua(Merc), 4=Qui(Jup), 5=Sex(Ven), 6=Sab(Sat)
const REGENTE_DIA_IDX = [0, 1, 2, 3, 4, 5, 6]; // índice em PLANETAS

// ── Sunrise / Sunset (algoritmo NOAA simplificado) ────────────────────────────
/**
 * Retorna { nascer, poente } em minutos desde meia-noite (hora local).
 * lat, lon em graus decimais. date é um objeto Date.
 */
function calcSunriseSunset(lat, lon, date) {
  const rad = Math.PI / 180;
  const deg = 180 / Math.PI;

  // Dia juliano
  const JD = (date.getTime() / 86400000) + 2440587.5;

  // Século juliano desde J2000.0
  const T = (JD - 2451545.0) / 36525.0;

  // Longitude média do Sol (graus)
  const L0 = (280.46646 + 36000.76983 * T) % 360;

  // Anomalia média do Sol (graus)
  const M = (357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360;
  const Mrad = M * rad;

  // Equação do centro
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad)
          + (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad)
          + 0.000289 * Math.sin(3 * Mrad);

  // Longitude verdadeira do Sol
  const sunLon = L0 + C;

  // Obliquidade da eclíptica
  const e = 23.439291 - 0.013004 * T;
  const erad = e * rad;

  // Ascensão reta do Sol
  const sinSunLon = Math.sin(sunLon * rad);
  const RA = Math.atan2(Math.cos(erad) * sinSunLon, Math.cos(sunLon * rad)) * deg;

  // Declinação do Sol
  const decl = Math.asin(Math.sin(erad) * sinSunLon) * deg;

  // Equação do tempo (minutos)
  const y = Math.tan(erad / 2) ** 2;
  const Lrad = L0 * rad;
  const Mrad2 = M * rad;
  const EqT = 4 * deg * (
    y * Math.sin(2 * Lrad)
    - 2 * 0.016708634 * Math.sin(Mrad2)
    + 4 * 0.016708634 * y * Math.sin(Mrad2) * Math.cos(2 * Lrad)
    - 0.5 * y * y * Math.sin(4 * Lrad)
    - 1.25 * 0.016708634 * 0.016708634 * Math.sin(2 * Mrad2)
  );

  // Ângulo horário do nascer/poente do Sol (zenith = 90.833°)
  const zenith = 90.833;
  const cosHA = (Math.cos(zenith * rad) - Math.sin(lat * rad) * Math.sin(decl * rad))
              / (Math.cos(lat * rad) * Math.cos(decl * rad));

  if (cosHA < -1) return { nascer: 0, poente: 1440 };     // sol de meia-noite
  if (cosHA >  1) return { nascer: 720, poente: 720 };    // noite polar

  const HA = Math.acos(cosHA) * deg;

  // Offset de fuso horário em minutos
  const tzOffset = -date.getTimezoneOffset(); // getTimezoneOffset retorna offset invertido

  // Nascer e poente em minutos desde meia-noite UTC, depois convertemos para local
  const nascer = 720 - 4 * (lon + HA) - EqT + tzOffset;
  const poente = 720 - 4 * (lon - HA) - EqT + tzOffset;

  return {
    nascer: ((nascer % 1440) + 1440) % 1440,
    poente: ((poente % 1440) + 1440) % 1440,
  };
}

// ── Cálculo das horas planetárias ─────────────────────────────────────────────
/**
 * Retorna array de 24 objetos de hora planetária.
 */
function calcHoras(lat, lon, date) {
  const now = Date.now();

  // Início do dia local (meia-noite)
  const meiaNocte = new Date(date);
  meiaNocte.setHours(0, 0, 0, 0);
  const meiaNocteMs = meiaNocte.getTime();

  // Nascer/pôr do sol em ms desde meia-noite
  const { nascer, poente } = calcSunriseSunset(lat, lon, date);
  const nascerMs = meiaNocteMs + nascer * 60000;
  const poenteMs = meiaNocteMs + poente * 60000;

  // Nascer do sol do dia seguinte (para calcular horas noturnas)
  const amanha = new Date(date);
  amanha.setDate(amanha.getDate() + 1);
  const { nascer: nascerAmanha } = calcSunriseSunset(lat, lon, amanha);
  const meiaNocteAmanhaMs = new Date(amanha).setHours(0, 0, 0, 0);
  const nascerAmanhaMs = meiaNocteAmanhaMs + nascerAmanha * 60000;

  // Duração de cada hora diurna/noturna em ms
  const durDiurnaMs   = (poenteMs - nascerMs) / 12;
  const durNoturnaMs  = (nascerAmanhaMs - poenteMs) / 12;

  // Regente do dia: dia da semana de 'date'
  const diaSemana = date.getDay(); // 0=Dom ... 6=Sab
  const planetaRegenteDia = REGENTE_DIA_IDX[diaSemana]; // índice em PLANETAS

  // Encontrar posição do regente do dia na ordem caldeia
  const posRegenteNaCaldeia = ORDEM_CALDEIA.indexOf(planetaRegenteDia);

  // Gerar as 24 horas
  const horas = [];
  for (let i = 0; i < 24; i++) {
    const diurna = i < 12;
    let inicioMs, fimMs;

    if (diurna) {
      inicioMs = nascerMs + i * durDiurnaMs;
      fimMs    = nascerMs + (i + 1) * durDiurnaMs;
    } else {
      const j = i - 12;
      inicioMs = poenteMs + j * durNoturnaMs;
      fimMs    = poenteMs + (j + 1) * durNoturnaMs;
    }

    // Planeta da hora (sequência caldeia a partir do regente do dia)
    const idxCaldeia = (posRegenteNaCaldeia + i) % 7;
    const idxPlaneta = ORDEM_CALDEIA[idxCaldeia];

    horas.push({
      numero:  i + 1,
      inicio:  new Date(inicioMs),
      fim:     new Date(fimMs),
      planeta: idxPlaneta,
      diurna:  diurna,
      atual:   now >= inicioMs && now < fimMs,
    });
  }

  return {
    horas,
    regenteDia: planetaRegenteDia,
    nascerMs,
    poenteMs,
    nascerAmanhaMs,
  };
}

// ── Utilitários de formatação ─────────────────────────────────────────────────
function fmtHHMM(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}

function fmtRelogio(date) {
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  const s = date.getSeconds().toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

function minRestantes(fimDate) {
  const diff = fimDate.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / 60000);
}

// ── Estado global ─────────────────────────────────────────────────────────────
const estado = {
  lat:      -23.55, // padrão São Paulo
  lon:      -46.63,
  cidade:   'São Paulo',
  estado:   'SP',
  pais:     'Brasil',
};

// ── Salvar / carregar localização ─────────────────────────────────────────────
function salvarLocalizacao() {
  localStorage.setItem('hp_localizacao', JSON.stringify({
    lat:    estado.lat,
    lon:    estado.lon,
    cidade: estado.cidade,
    estado: estado.estado,
    pais:   estado.pais,
  }));
}

function carregarLocalizacao() {
  try {
    const raw = localStorage.getItem('hp_localizacao');
    if (raw) {
      const d = JSON.parse(raw);
      estado.lat    = d.lat;
      estado.lon    = d.lon;
      estado.cidade = d.cidade || '';
      estado.estado = d.estado || '';
      estado.pais   = d.pais   || '';
      return true;
    }
  } catch (e) {}
  return false;
}

// ── Modal de cidade ───────────────────────────────────────────────────────────
let searchTimer = null;

function abrirModalCidade() {
  document.getElementById('modal-cidade').style.display = 'flex';
  document.getElementById('input-cidade').value = '';
  document.getElementById('lista-cidades').innerHTML = '';
  document.getElementById('input-cidade').focus();
}

function fecharModalCidade() {
  document.getElementById('modal-cidade').style.display = 'none';
}

async function buscarCidades(q) {
  const lista = document.getElementById('lista-cidades');
  if (!q || q.length < 2) { lista.innerHTML = ''; return; }

  lista.innerHTML = '<div class="city-loading">Buscando…</div>';

  try {
    let results;
    // Electron: usa IPC; Android/browser: usa fetch direto
    if (window.electronAPI) {
      const r = await window.electronAPI.searchCitiesNominatim(q);
      results = r.ok ? r.results : [];
    } else {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8&accept-language=pt-BR`;
      const res = await fetch(url, { headers: { 'User-Agent': 'HorasPlanetarias/1.0' } });
      results = await res.json();
    }

    lista.innerHTML = '';
    if (!results.length) {
      lista.innerHTML = '<div class="city-loading">Nenhum resultado.</div>';
      return;
    }

    results.forEach(item => {
      const addr = item.address || {};
      const city  = addr.city || addr.town || addr.village || addr.municipality || item.display_name.split(',')[0];
      const state = addr.state || '';
      const country = addr.country || '';
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);

      const div = document.createElement('div');
      div.className = 'city-item';
      div.innerHTML = `<span class="city-name">${city}</span><span class="city-info">${state}${state && country ? ', ' : ''}${country}</span>`;
      div.addEventListener('click', () => {
        estado.lat    = lat;
        estado.lon    = lon;
        estado.cidade = city;
        estado.estado = state;
        estado.pais   = country;
        salvarLocalizacao();
        fecharModalCidade();
        atualizarTudo();
        document.getElementById('btn-cidade').textContent = `📍 ${city}`;
      });
      lista.appendChild(div);
    });
  } catch (e) {
    lista.innerHTML = `<div class="city-loading">Erro: ${e.message}</div>`;
  }
}

// ── Detectar localização por IP ───────────────────────────────────────────────
async function detectarLocalizacao() {
  try {
    let data;
    if (window.electronAPI) {
      data = await window.electronAPI.detectLocation();
      if (!data.ok) return;
    } else {
      const res = await fetch('https://ipwho.is/');
      data = await res.json();
      if (!data.success) return;
      data = { ok: true, city: data.city, region: data.region, country: data.country, lat: data.latitude, lon: data.longitude };
    }
    estado.lat    = data.lat;
    estado.lon    = data.lon;
    estado.cidade = data.city   || '';
    estado.estado = data.region || '';
    estado.pais   = data.country || '';
    salvarLocalizacao();
    document.getElementById('btn-cidade').textContent = `📍 ${estado.cidade}`;
    atualizarTudo();
  } catch (e) {
    console.warn('Detecção por IP falhou:', e.message);
  }
}

// ── Renderização ──────────────────────────────────────────────────────────────
function renderPainelAtual(horas, regenteDia) {
  const horaAtual = horas.find(h => h.atual);
  if (!horaAtual) return;

  const planeta = PLANETAS[horaAtual.planeta];
  const regente = PLANETAS[regenteDia];

  // Símbolo grande
  document.getElementById('painel-sym').textContent = planeta.sym;
  document.getElementById('painel-sym').style.color = planeta.cor;
  document.getElementById('painel-nome').textContent = planeta.nome;
  document.getElementById('painel-nome').style.color = planeta.cor;

  // Número da hora
  const tipoHora = horaAtual.diurna ? 'Diurna' : 'Noturna';
  const numNoTipo = horaAtual.diurna ? horaAtual.numero : horaAtual.numero - 12;
  document.getElementById('painel-num').textContent = `Hora ${numNoTipo} de 12 (${tipoHora})`;

  // Regente do dia
  document.getElementById('painel-reg-sym').textContent = regente.sym;
  document.getElementById('painel-reg-sym').style.color = regente.cor;
  document.getElementById('painel-reg-nome').textContent = regente.nome;
  document.getElementById('painel-reg-nome').style.color = regente.cor;

  // Próxima hora
  const idxAtual = horas.indexOf(horaAtual);
  const proxima = horas[idxAtual + 1];
  if (proxima) {
    const proxPlaneta = PLANETAS[proxima.planeta];
    const min = minRestantes(horaAtual.fim);
    document.getElementById('painel-prox').innerHTML =
      `<span style="color:${proxPlaneta.cor}">${proxPlaneta.sym} ${proxPlaneta.nome}</span> em ${min} min`;
  } else {
    document.getElementById('painel-prox').textContent = '—';
  }

  // Intervalo da hora atual
  document.getElementById('painel-intervalo').textContent =
    `${fmtHHMM(horaAtual.inicio)} – ${fmtHHMM(horaAtual.fim)}`;
}

function renderTabela(horas) {
  const tbody = document.getElementById('tabela-body');
  tbody.innerHTML = '';

  let idxAtual = -1;

  horas.forEach((h, i) => {
    const planeta = PLANETAS[h.planeta];
    const tr = document.createElement('tr');
    tr.className = h.atual ? 'hora-atual' : (h.diurna ? 'hora-diurna' : 'hora-noturna');
    if (h.atual) idxAtual = i;

    tr.innerHTML = `
      <td class="col-num">${h.numero}</td>
      <td class="col-tipo">${h.diurna ? '☀' : '☾'}</td>
      <td class="col-inicio">${fmtHHMM(h.inicio)}</td>
      <td class="col-fim">${fmtHHMM(h.fim)}</td>
      <td class="col-planeta">
        <span class="tab-sym" style="color:${planeta.cor}">${planeta.sym}</span>
        <span class="tab-nome" style="color:${planeta.cor}">${planeta.nome}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Scroll automático para a hora atual
  if (idxAtual >= 0) {
    const rows = tbody.querySelectorAll('tr');
    if (rows[idxAtual]) {
      setTimeout(() => {
        rows[idxAtual].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }
}

function atualizarTudo() {
  const agora = new Date();
  const { horas, regenteDia, nascerMs, poenteMs } = calcHoras(estado.lat, estado.lon, agora);

  renderPainelAtual(horas, regenteDia);
  renderTabela(horas);

  // Info de nascer/pôr do sol
  document.getElementById('info-nascer').textContent = fmtHHMM(new Date(nascerMs));
  document.getElementById('info-poente').textContent = fmtHHMM(new Date(poenteMs));
}

function atualizarRelogio() {
  document.getElementById('relogio').textContent = fmtRelogio(new Date());
}

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Botão fechar (Electron only)
  const btnClose = document.getElementById('btn-close');
  if (btnClose) {
    btnClose.addEventListener('click', () => {
      if (window.electronAPI) window.electronAPI.closeApp();
    });
  }

  // Botão hub
  const btnHub = document.getElementById('btn-hub');
  if (btnHub) {
    btnHub.addEventListener('click', () => {
      if (window.electronAPI) window.electronAPI.navigate('hub');
      setTimeout(() => { window.location.href = '../index.html'; }, 120);
    });
  }

  // Botão cidade
  document.getElementById('btn-cidade').addEventListener('click', abrirModalCidade);

  // Modal cidade
  document.getElementById('modal-overlay').addEventListener('click', fecharModalCidade);
  document.getElementById('btn-modal-fechar').addEventListener('click', fecharModalCidade);

  document.getElementById('input-cidade').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => buscarCidades(e.target.value.trim()), 400);
  });

  document.getElementById('input-cidade').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModalCidade();
  });

  // Carregar localização salva ou detectar por IP
  const temLocSalva = carregarLocalizacao();
  if (temLocSalva) {
    document.getElementById('btn-cidade').textContent = `📍 ${estado.cidade}`;
  } else {
    detectarLocalizacao();
  }

  // Primeira renderização
  atualizarTudo();
  atualizarRelogio();

  // Relógio: atualiza a cada segundo
  setInterval(atualizarRelogio, 1000);

  // Horas planetárias: atualiza a cada 30 segundos
  setInterval(atualizarTudo, 30000);
});
