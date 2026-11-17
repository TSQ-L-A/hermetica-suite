'use strict';

// ═══════════════════════════════════════════════════════════════
//  TATTVAS — marés tattvicas (Rama Prasad, Nature's Finer Forces)
//  A partir do nascer do sol: Akasha, Vayu, Tejas, Prithivi, Apas,
//  24 min cada (ciclo de 2 h). Cada Tattva tem 5 sub-Tattvas de 4,8 min,
//  começando pelo próprio Tattva. Nome: "<sub> de <principal>".
// ═══════════════════════════════════════════════════════════════

const TATTVAS = [
  { nome: 'Akasha',   elemento: 'Espírito', forma: 'Ovo negro',          sentido: 'Audição', cor: '#23213a' },
  { nome: 'Vayu',     elemento: 'Ar',       forma: 'Círculo azul',       sentido: 'Tato',    cor: '#2f6fd0' },
  { nome: 'Tejas',    elemento: 'Fogo',     forma: 'Triângulo vermelho', sentido: 'Visão',   cor: '#cc2a1e' },
  { nome: 'Prithivi', elemento: 'Terra',    forma: 'Quadrado amarelo',   sentido: 'Olfato',  cor: '#e0b412' },
  { nome: 'Apas',     elemento: 'Água',     forma: 'Crescente prateado', sentido: 'Paladar', cor: '#9aa0ae' },
];

const MIN_TATTVA = 24 * 60000;
const MIN_SUB    = MIN_TATTVA / 5;

// ── Símbolos em SVG (o sub-Tattva fica dentro do principal, como nas cartas) ──
function formaSVG(i, cx, cy, r) {
  const t = TATTVAS[i];
  const borda = `stroke="rgba(40,30,10,0.55)" stroke-width="${Math.max(1, r * 0.04)}"`;
  switch (i) {
    case 0: return `<ellipse cx="${cx}" cy="${cy}" rx="${r * 0.68}" ry="${r}" fill="${t.cor}" ${borda}/>`;
    case 1: return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${t.cor}" ${borda}/>`;
    case 2: {
      const h = r * 1.5, base = h / Math.sqrt(3);
      return `<polygon points="${cx},${cy - h * 0.62} ${cx - base},${cy + h * 0.38} ${cx + base},${cy + h * 0.38}" fill="${t.cor}" ${borda}/>`;
    }
    case 3: return `<rect x="${cx - r * 0.85}" y="${cy - r * 0.85}" width="${r * 1.7}" height="${r * 1.7}" fill="${t.cor}" ${borda}/>`;
    case 4: {
      // crescente com as pontas para cima: círculo (r) menos círculo (0,95 r) deslocado 0,45 r para cima
      const r2 = r * 0.95, dy = r * 0.45;
      const yi = cy + (r2 * r2 - r * r - dy * dy) / (2 * dy);   // altura das pontas
      const xi = Math.sqrt(r * r - (yi - cy) ** 2);
      return `<path d="M ${cx - xi} ${yi} A ${r} ${r} 0 1 0 ${cx + xi} ${yi} A ${r2} ${r2} 0 0 1 ${cx - xi} ${yi} Z" fill="${t.cor}" ${borda}/>`;
    }
  }
  return '';
}

function simboloSVG(principal, sub, tamanho) {
  const c = tamanho / 2;
  const interno = sub != null && sub !== principal ? formaSVG(sub, c, principal === 2 ? c + tamanho * 0.08 : c, tamanho * 0.16) : '';
  return `<svg viewBox="0 0 ${tamanho} ${tamanho}" width="${tamanho}" height="${tamanho}" aria-hidden="true">
    ${formaSVG(principal, c, c, tamanho * 0.42)}${interno}</svg>`;
}

// ═══════════════════════════════════════════════════════════════
//  NASCER DO SOL (mesmo algoritmo do Horae)
// ═══════════════════════════════════════════════════════════════

function calcSunriseSunset(lat, lon, date) {
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const T  = (date.getTime() / 86400000 + 2440587.5 - 2451545.0) / 36525.0;
  const L0 = (280.46646 + 36000.76983 * T) % 360;
  const Mr = ((357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360) * rad;
  const C  = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
           + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr) + 0.000289 * Math.sin(3 * Mr);
  const erad = (23.439291 - 0.013004 * T) * rad;
  const decl = Math.asin(Math.sin(erad) * Math.sin((L0 + C) * rad)) * deg;
  const y = Math.tan(erad / 2) ** 2, Lrad = L0 * rad;
  const EqT = 4 * deg * (y * Math.sin(2 * Lrad) - 2 * 0.016708634 * Math.sin(Mr)
            + 4 * 0.016708634 * y * Math.sin(Mr) * Math.cos(2 * Lrad)
            - 0.5 * y * y * Math.sin(4 * Lrad) - 1.25 * 0.016708634 * 0.016708634 * Math.sin(2 * Mr));
  const cosHA = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl * rad))
              / (Math.cos(lat * rad) * Math.cos(decl * rad));
  if (cosHA < -1) return { nascer: 0, poente: 1440 };
  if (cosHA >  1) return { nascer: 720, poente: 720 };
  const HA = Math.acos(cosHA) * deg, tz = -date.getTimezoneOffset();
  return {
    nascer: (((720 - 4 * (lon + HA) - EqT + tz) % 1440) + 1440) % 1440,
    poente: (((720 - 4 * (lon - HA) - EqT + tz) % 1440) + 1440) % 1440,
  };
}

function nascerDoSol(dia, lat, lon) {
  const d = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate());
  return d.getTime() + calcSunriseSunset(lat, lon, d).nascer * 60000;
}

// Ciclo do dia "tattvico": do nascer do sol de `dia` ao nascer seguinte
function calcDia(dia, lat, lon) {
  const ini = nascerDoSol(dia, lat, lon);
  const fim = nascerDoSol(new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1), lat, lon);
  const periodos = [];
  for (let k = 0, t = ini; t < fim; k++, t += MIN_TATTVA) {
    periodos.push({ idx: k % 5, inicio: t, fim: Math.min(t + MIN_TATTVA, fim) });
  }
  return { nascer: ini, proxNascer: fim, periodos };
}

// Dia tattvico que contém o instante t (antes do nascer do sol, vale o ciclo de ontem)
function diaQueContem(t, lat, lon) {
  const d = new Date(t);
  const hoje = calcDia(d, lat, lon);
  return t >= hoje.nascer ? hoje : calcDia(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1), lat, lon);
}

function tattvaEm(t, lat, lon) {
  const dia = diaQueContem(t, lat, lon);
  const p = dia.periodos.find(x => t >= x.inicio && t < x.fim) || dia.periodos[dia.periodos.length - 1];
  const k = Math.min(4, Math.floor((t - p.inicio) / MIN_SUB));
  const subInicio = p.inicio + k * MIN_SUB;
  return {
    dia, periodo: p,
    sub: (p.idx + k) % 5,
    subInicio, subFim: Math.min(subInicio + MIN_SUB, p.fim),
    subs: [0, 1, 2, 3, 4].map(j => ({
      idx: (p.idx + j) % 5,
      inicio: p.inicio + j * MIN_SUB,
      fim: Math.min(p.inicio + (j + 1) * MIN_SUB, p.fim),
    })).filter(s => s.inicio < p.fim),
  };
}

// ═══════════════════════════════════════════════════════════════
//  FORMATAÇÃO
// ═══════════════════════════════════════════════════════════════

const pad = n => String(n).padStart(2, '0');
const fmtHHMM = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtDDMM = t => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const nomeSub = (sub, principal) => `${TATTVAS[sub].nome} de ${TATTVAS[principal].nome}`;

// ═══════════════════════════════════════════════════════════════
//  LOCALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

const estado = { lat: -23.55, lon: -46.63, cidade: 'São Paulo', estado: 'SP', pais: 'Brasil' };
let diaVisto = null;   // null = hoje

function salvarLocalizacao() {
  localStorage.setItem('tattva_localizacao', JSON.stringify(estado));
  syncWidgetLocation();
}

// Usa a cidade do próprio módulo; na primeira vez, aproveita a de outro módulo
function carregarLocalizacao() {
  try {
    const proprio = localStorage.getItem('tattva_localizacao');
    if (proprio) { Object.assign(estado, JSON.parse(proprio)); return true; }
    for (const chave of ['shem_localizacao', 'hp_localizacao']) {
      const outro = localStorage.getItem(chave);
      if (outro) { Object.assign(estado, JSON.parse(outro)); salvarLocalizacao(); return true; }
    }
    const astra = JSON.parse(localStorage.getItem('astra_location') || 'null');
    if (astra && astra.lat != null) {
      Object.assign(estado, { lat: astra.lat, lon: astra.lon, cidade: astra.name, estado: astra.state || '', pais: 'Brasil' });
      salvarLocalizacao();
      return true;
    }
  } catch (_) {}
  return false;
}

// Informa a cidade ao widget nativo do Android (sem efeito fora do app Android)
function syncWidgetLocation() {
  try {
    const cap = window.Capacitor;
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return;
    const bridge = (cap.Plugins && cap.Plugins.WidgetBridge) || cap.registerPlugin('WidgetBridge');
    bridge.setTattvaLocation({ lat: estado.lat, lon: estado.lon, name: estado.cidade || '' }).catch(() => {});
  } catch (_) {}
}

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
    if (window.electronAPI && window.electronAPI.searchCitiesNominatim) {
      const r = await window.electronAPI.searchCitiesNominatim(q);
      results = r.ok ? r.results : [];
    } else {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&addressdetails=1&limit=8&accept-language=pt-BR`;
      const res = await fetch(url, { headers: { 'User-Agent': 'HermeticaSuite/1.0' } });
      results = await res.json();
    }
    lista.innerHTML = '';
    if (!results.length) { lista.innerHTML = '<div class="city-loading">Nenhum resultado.</div>'; return; }
    results.forEach(item => {
      const addr    = item.address || {};
      const city    = addr.city || addr.town || addr.village || addr.municipality || item.display_name.split(',')[0];
      const state   = addr.state || '';
      const country = addr.country || '';
      const div = document.createElement('div');
      div.className = 'city-item';
      div.innerHTML = `<span class="city-name">${city}</span><span class="city-info">${state}${state && country ? ', ' : ''}${country}</span>`;
      div.addEventListener('click', () => {
        Object.assign(estado, { lat: parseFloat(item.lat), lon: parseFloat(item.lon), cidade: city, estado: state, pais: country });
        salvarLocalizacao();
        fecharModalCidade();
        document.getElementById('btn-cidade').textContent = `📍 ${city}`;
        atualizarTudo(true);
      });
      lista.appendChild(div);
    });
  } catch (e) {
    lista.innerHTML = `<div class="city-loading">Erro: ${e.message}</div>`;
  }
}

async function detectarLocalizacao() {
  try {
    const res  = await fetch('https://ipwho.is/');
    const data = await res.json();
    if (!data.success) return;
    Object.assign(estado, { lat: data.latitude, lon: data.longitude, cidade: data.city || '', estado: data.region || '', pais: data.country || '' });
    salvarLocalizacao();
    document.getElementById('btn-cidade').textContent = `📍 ${estado.cidade}`;
    atualizarTudo(true);
  } catch (e) {
    console.warn('Detecção por IP falhou:', e.message);
  }
}

// ═══════════════════════════════════════════════════════════════
//  RENDERIZAÇÃO
// ═══════════════════════════════════════════════════════════════

function renderPainel(agora) {
  const at = tattvaEm(agora, estado.lat, estado.lon);
  const p = TATTVAS[at.periodo.idx], s = TATTVAS[at.sub];

  document.getElementById('painel-simbolo').innerHTML = simboloSVG(at.periodo.idx, at.sub, 84);
  document.getElementById('painel-nome').textContent = p.nome;
  document.getElementById('painel-nome').style.color = p.cor === '#e0b412' ? '#a07c08' : p.cor;
  document.getElementById('painel-elem').textContent = `${p.elemento} · ${p.forma} · ${p.sentido}`;
  document.getElementById('painel-intervalo').textContent = `${fmtHHMM(at.periodo.inicio)} – ${fmtHHMM(at.periodo.fim)}`;

  document.getElementById('painel-sub').innerHTML =
    `${simboloSVG(at.periodo.idx, at.sub, 26)} <b>${nomeSub(at.sub, at.periodo.idx)}</b>` +
    `<span class="sub-hora">${fmtHHMM(at.subInicio)} – ${fmtHHMM(at.subFim)}</span>`;

  const prox = TATTVAS[(at.periodo.idx + 1) % 5];
  const min = Math.max(0, Math.ceil((at.periodo.fim - agora) / 60000));
  document.getElementById('painel-prox').innerHTML = `${simboloSVG((at.periodo.idx + 1) % 5, null, 22)} ${prox.nome} em ${min} min`;

  // Sequência dos sub-Tattvas do período atual
  document.getElementById('subs').innerHTML = at.subs.map(x => {
    const atual = agora >= x.inicio && agora < x.fim;
    return `<div class="sub-item${atual ? ' sub-atual' : ''}">
      ${simboloSVG(at.periodo.idx, x.idx, 30)}
      <span class="sub-nome">${TATTVAS[x.idx].nome}</span>
      <span class="sub-h">${fmtHHMM(x.inicio)}</span>
    </div>`;
  }).join('');

  document.getElementById('info-nascer').textContent = fmtHHMM(at.dia.nascer);
  document.getElementById('info-prox-nascer').textContent = fmtHHMM(at.dia.proxNascer);
}

function renderTabela(dia, agora, rolar) {
  const tbody = document.getElementById('tabela-body');
  tbody.innerHTML = '';
  let linhaAtual = null;
  dia.periodos.forEach((p, n) => {
    const t = TATTVAS[p.idx];
    const tr = document.createElement('tr');
    const atual = agora >= p.inicio && agora < p.fim;
    tr.className = atual ? 'hora-atual' : (Math.floor(n / 5) % 2 ? 'ciclo-par' : '');
    tr.innerHTML = `
      <td class="col-num">${Math.floor(n / 5) + 1}</td>
      <td class="col-inicio">${fmtHHMM(p.inicio)}</td>
      <td class="col-fim">${fmtHHMM(p.fim)}</td>
      <td class="col-tattva">${simboloSVG(p.idx, null, 22)}<span class="tab-nome">${t.nome}</span><span class="tab-elem">${t.elemento}</span></td>`;
    tbody.appendChild(tr);
    if (atual) linhaAtual = tr;
  });
  if (linhaAtual && rolar) setTimeout(() => linhaAtual.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
}

let ultimaChave = null;

function atualizarTudo(forcar = false) {
  const agora = Date.now();
  renderPainel(agora);

  const hojeDia = diaQueContem(agora, estado.lat, estado.lon);
  const dia = diaVisto ? calcDia(diaVisto, estado.lat, estado.lon) : hojeDia;
  const chave = `${dia.nascer}|${estado.lat}|${estado.lon}`;
  renderTabela(dia, agora, forcar || chave !== ultimaChave);
  ultimaChave = chave;

  const ehHoje = dia.nascer === hojeDia.nascer;
  document.getElementById('tabela-dia').textContent = ehHoje ? `Hoje · ${fmtDDMM(dia.nascer)}` : fmtDDMM(dia.nascer);
  document.getElementById('btn-hoje').style.visibility = ehHoje ? 'hidden' : 'visible';
}

function mudarDia(delta) {
  const base = diaVisto || new Date(diaQueContem(Date.now(), estado.lat, estado.lon).nascer);
  diaVisto = new Date(base.getFullYear(), base.getMonth(), base.getDate() + delta);
  if (calcDia(diaVisto, estado.lat, estado.lon).nascer === diaQueContem(Date.now(), estado.lat, estado.lon).nascer) diaVisto = null;
  atualizarTudo(true);
}

function atualizarRelogio() {
  const d = new Date();
  document.getElementById('relogio').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ═══════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-hub').addEventListener('click', () => {
    if (window.electronAPI) window.electronAPI.navigate('hub');
    setTimeout(() => { window.location.href = '../index.html'; }, 120);
  });

  document.getElementById('btn-cidade').addEventListener('click', abrirModalCidade);
  document.getElementById('modal-overlay').addEventListener('click', fecharModalCidade);
  document.getElementById('btn-modal-fechar').addEventListener('click', fecharModalCidade);
  document.getElementById('input-cidade').addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => buscarCidades(e.target.value.trim()), 400);
  });
  document.getElementById('input-cidade').addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharModalCidade();
  });

  document.getElementById('btn-dia-ant').addEventListener('click', () => mudarDia(-1));
  document.getElementById('btn-dia-prox').addEventListener('click', () => mudarDia(1));
  document.getElementById('btn-hoje').addEventListener('click', () => { diaVisto = null; atualizarTudo(true); });

  if (carregarLocalizacao()) {
    document.getElementById('btn-cidade').textContent = `📍 ${estado.cidade}`;
    syncWidgetLocation();
  } else {
    detectarLocalizacao();
  }

  atualizarTudo(true);
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
  setInterval(() => atualizarTudo(false), 15000);
});
