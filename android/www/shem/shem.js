'use strict';

// ═══════════════════════════════════════════════════════════════
//  SHEM HAMEPHORASH — os 72 anjos, atribuição da Golden Dawn (Book T)
//  Quinários de 5° a partir de 0° Leão: Vehuiah e Yeliel no 1º decanato
//  de Leão (5 de Paus). Anjo do momento = quinário no Ascendente;
//  anjo dos dias = quinário do Sol.
// ═══════════════════════════════════════════════════════════════

// [transliteração usual (11 e 17 desambiguados: Leviah / Lauiah), raiz de 3 letras, sufixo]
// (sufixo 'IH' = יה, 'AL' = אל)
const ANJOS = [
  ['Vehuiah','והו','IH'],    ['Yeliel','ילי','AL'],     ['Sitael','סיט','AL'],     ['Elemiah','עלמ','IH'],
  ['Mahasiah','מהש','IH'],   ['Lelahel','ללה','AL'],    ['Achaiah','אכא','IH'],    ['Kahetel','כהת','AL'],
  ['Haziel','הזי','AL'],     ['Aladiah','אלד','IH'],    ['Leviah','לאו','IH'],     ['Hahaiah','ההע','IH'],
  ['Yezalel','יזל','AL'],    ['Mebahel','מבה','AL'],    ['Hariel','הרי','AL'],     ['Hakamiah','הקמ','IH'],
  ['Lauiah','לאו','IH'],     ['Kaliel','כלי','AL'],     ['Leuviah','לוו','IH'],    ['Pahaliah','פהל','IH'],
  ['Nelchael','נלכ','AL'],   ['Yeiayel','ייי','AL'],    ['Melahel','מלה','AL'],    ['Chahuiah','חהו','IH'],
  ['Nithaiah','נתה','IH'],   ['Haaiah','האא','IH'],     ['Yerathel','ירת','AL'],   ['Seheiah','שאה','IH'],
  ['Reiyel','ריי','AL'],     ['Omael','אומ','AL'],      ['Lekabel','לכב','AL'],    ['Vasariah','ושר','IH'],
  ['Yechuiah','יחו','IH'],   ['Lehachiah','להח','IH'],  ['Kevaqiah','כוק','IH'],   ['Menadel','מנד','AL'],
  ['Aniel','אני','AL'],      ['Chaamiah','חעמ','IH'],   ['Rehael','רהע','AL'],     ['Yeiazel','ייז','AL'],
  ['Hahahel','ההה','AL'],    ['Mikael','מיכ','AL'],     ['Veuliah','וול','IH'],    ['Yelahiah','ילה','IH'],
  ['Sealiah','סאל','IH'],    ['Ariel','ערי','AL'],      ['Asaliah','עשל','IH'],    ['Mihael','מיה','AL'],
  ['Vehuel','והו','AL'],     ['Daniel','דני','AL'],     ['Hachashiah','החש','IH'], ['Imamiah','עממ','IH'],
  ['Nanael','ננא','AL'],     ['Nithael','נית','AL'],    ['Mebahiah','מבה','IH'],   ['Poiel','פוי','AL'],
  ['Nemamiah','נממ','IH'],   ['Yeialel','ייל','AL'],    ['Harahel','הרח','AL'],    ['Mitzrael','מצר','AL'],
  ['Umabel','ומב','AL'],     ['Iahhel','יהה','AL'],     ['Anauel','ענו','AL'],     ['Mehiel','מחי','AL'],
  ['Damabiah','דמב','IH'],   ['Manakel','מנק','AL'],    ['Eiael','איע','AL'],      ['Chabuiah','חבו','IH'],
  ['Rochel','ראה','AL'],     ['Yabamiah','יבמ','IH'],   ['Haiaiel','היי','AL'],    ['Mumiah','מומ','IH'],
];

// U+FE0E força o glifo de texto (sem virar emoji colorido no Android)
const SIGNOS = [
  { nome: 'Áries',  sym: '♈\uFE0E' }, { nome: 'Touro',     sym: '♉\uFE0E' }, { nome: 'Gêmeos',      sym: '♊\uFE0E' },
  { nome: 'Câncer', sym: '♋\uFE0E' }, { nome: 'Leão',      sym: '♌\uFE0E' }, { nome: 'Virgem',      sym: '♍\uFE0E' },
  { nome: 'Libra',  sym: '♎\uFE0E' }, { nome: 'Escorpião', sym: '♏\uFE0E' }, { nome: 'Sagitário',   sym: '♐\uFE0E' },
  { nome: 'Capricórnio', sym: '♑\uFE0E' }, { nome: 'Aquário', sym: '♒\uFE0E' }, { nome: 'Peixes',   sym: '♓\uFE0E' },
];

// Ordem caldaica — regentes dos decanatos (1º decanato de Áries = Marte)
const CALDEIA = [
  { nome: 'Saturno',  sym: '♄', cor: '#555060' }, { nome: 'Júpiter', sym: '♃', cor: '#1a4a8a' },
  { nome: 'Marte',    sym: '♂', cor: '#aa2020' }, { nome: 'Sol',     sym: '☉', cor: '#c4890a' },
  { nome: 'Vênus',    sym: '♀', cor: '#8a2a6a' }, { nome: 'Mercúrio',sym: '☿', cor: '#3a7a3a' },
  { nome: 'Lua',      sym: '☽', cor: '#7a7a9a' },
];

// Naipes por elemento do signo (Fogo, Terra, Ar, Água) e títulos da Golden Dawn (2 a 10)
const NAIPES = ['Paus', 'Ouros', 'Espadas', 'Copas'];
const TITULOS = [
  ['do Domínio', 'da Força Estabelecida', 'da Obra Perfeita', 'da Luta', 'da Vitória', 'do Valor', 'da Rapidez', 'da Grande Força', 'da Opressão'],
  ['da Mudança Harmoniosa', 'das Obras Materiais', 'do Poder Terreno', 'da Dificuldade Material', 'do Sucesso Material', 'do Sucesso Não Realizado', 'da Prudência', 'do Ganho Material', 'da Riqueza'],
  ['da Paz Restaurada', 'da Tristeza', 'do Descanso da Luta', 'da Derrota', 'do Sucesso Merecido', 'do Esforço Instável', 'da Força Encurtada', 'do Desespero e Crueldade', 'da Ruína'],
  ['do Amor', 'da Abundância', 'do Prazer Mesclado', 'da Perda no Prazer', 'do Prazer', 'do Sucesso Ilusório', 'do Sucesso Abandonado', 'da Felicidade Material', 'do Sucesso Perfeito'],
];

const INICIO_LEAO = 120;  // 0° Leão

// Formas finais para a última letra do nome divino isolado (מיכ → מיך, עלמ → עלם)
const FINAIS = { 'כ': 'ך', 'מ': 'ם', 'נ': 'ן', 'פ': 'ף', 'צ': 'ץ' };

function anjoInfo(i) {
  const [nome, raiz, suf] = ANJOS[i];
  const hebraico = raiz + (suf === 'IH' ? 'יה' : 'אל');
  // Nome divino de três letras (Êxodo 14:19–21) que dá origem ao anjo
  const nomeDivino   = raiz.slice(0, 2) + (FINAIS[raiz[2]] || raiz[2]);

  const ini    = norm360(INICIO_LEAO + i * 5);
  const signo  = Math.floor(ini / 30);
  const grau   = ini - signo * 30;
  const decAbs = Math.floor(ini / 10);                 // decanato contado a partir de Áries
  const regente = CALDEIA[(2 + decAbs) % 7];
  const num    = [2, 5, 8][signo % 3] + (decAbs % 3);  // cardinal 2–4, fixo 5–7, mutável 8–10
  const naipe  = signo % 4;
  return {
    num: i + 1, nome, hebraico, nomeDivino, signo, grau, regente,
    carta: `${num} de ${NAIPES[naipe]}`,
    titulo: `Senhor ${TITULOS[naipe][num - 2]}`,
    quinario: `${SIGNOS[signo].sym} ${grau}°–${grau + 5}° ${SIGNOS[signo].nome}`,
  };
}

const quinarioDe = lon => Math.floor(norm360(lon - INICIO_LEAO) / 5);

// ═══════════════════════════════════════════════════════════════
//  CÁLCULOS ASTRONÔMICOS (mesmo motor do Astra)
// ═══════════════════════════════════════════════════════════════

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }
function norm360(x) { return ((x % 360) + 360) % 360; }

function jdn(date) { return date.getTime() / 86400000 + 2440587.5; }

// ΔT (TT − UT) em segundos — aproximação a partir de Espenak & Meeus
function deltaT(jd) {
  const y = 2000 + (jd - 2451545.0) / 365.25;
  if (y >= 2015 && y < 2050) return 69.2;
  if (y >= 2005 && y < 2015) return 64.7 + 0.29 * (y - 2005);
  if (y >= 1986 && y < 2005) { const t = y - 2000; return 63.86 + 0.3345*t - 0.060374*t*t + 0.0017275*t**3 + 0.000651814*t**4 + 0.00002373599*t**5; }
  const u = (y - 1820) / 100;
  return -20 + 32*u*u;
}

function julianCenturies(date) { return (jdn(date) - 2451545.0) / 36525.0; }
function julianCenturiesTT(date) {
  const jd = jdn(date);
  return (jd + deltaT(jd) / 86400 - 2451545.0) / 36525.0;
}

function nutation(T) {
  const Om = toRad(125.04452 - 1934.136261*T);
  const Ls = toRad(280.4665 + 36000.7698*T);
  const Lm = toRad(218.3165 + 481267.8813*T);
  const dPsi = (-17.20*Math.sin(Om) - 1.32*Math.sin(2*Ls) - 0.23*Math.sin(2*Lm) + 0.21*Math.sin(2*Om)) / 3600;
  const dEps = (  9.20*Math.cos(Om) + 0.57*Math.cos(2*Ls) + 0.10*Math.cos(2*Lm) - 0.09*Math.cos(2*Om)) / 3600;
  const eps0 = 23.439291111 - 0.0130041667*T - 1.64e-7*T*T + 5.036e-7*T*T*T;
  return { dPsi, eps: eps0 + dEps };
}

function sunLon(date) {
  const T  = julianCenturiesTT(date);
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const Mr = toRad(norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T));
  const C  = (1.914602 - 0.004817*T - 0.000014*T*T) * Math.sin(Mr)
           + (0.019993 - 0.000101*T) * Math.sin(2*Mr)
           + 0.000289 * Math.sin(3*Mr);
  const Om = toRad(125.04 - 1934.136 * T);
  return norm360(L0 + C - 0.00569 - 0.00478 * Math.sin(Om));
}

function ascendente(date, lat, lon) {
  const T = julianCenturies(date), D = jdn(date) - 2451545.0;
  const { dPsi, eps } = nutation(T);
  const ramc = norm360(280.46061837 + 360.98564736629*D + 0.000387933*T*T - T*T*T/38710000
                     + dPsi * Math.cos(toRad(eps)) + lon);
  const e = toRad(eps), RA = toRad(ramc), la = toRad(lat);
  return norm360(toDeg(Math.atan2(Math.cos(RA), -(Math.sin(RA)*Math.cos(e) + Math.tan(la)*Math.sin(e)))));
}

// Bisseção: primeiro instante em (t0, t1] em que cond(t) passa a ser verdadeira
function transicao(t0, t1, cond) {
  while (t1 - t0 > 1000) {
    const m = (t0 + t1) / 2;
    if (cond(m)) t1 = m; else t0 = m;
  }
  return t1;
}

// Anjos do Ascendente ao longo de um dia civil (meia-noite a meia-noite, hora local)
function calcDia(dia, lat, lon) {
  const ini = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate()).getTime();
  const fim = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1).getTime();
  const q   = t => quinarioDe(ascendente(new Date(t), lat, lon));
  const passo = 60 * 1000;

  const periodos = [];
  let tIni = ini, idx = q(ini);
  for (let t = ini + passo; t <= fim; t += passo) {
    const k = q(t);
    if (k !== idx) {
      const troca = transicao(t - passo, t, s => q(s) !== idx);
      periodos.push({ idx, inicio: tIni, fim: troca });
      tIni = troca; idx = k;
    }
  }
  if (fim > tIni) periodos.push({ idx, inicio: tIni, fim });
  return periodos;
}

// Período do Sol no quinário atual (≈ 5 dias)
function calcQuinarioSolar(date) {
  const t  = date.getTime(), dia = 86400000;
  const q  = s => quinarioDe(sunLon(new Date(s)));
  const idx = q(t);
  let a = t; while (q(a - dia) === idx) a -= dia;
  let b = t; while (q(b + dia) === idx) b += dia;
  const inicio = transicao(a - dia, a, s => q(s) === idx);
  const fim    = transicao(b, b + dia, s => q(s) !== idx);
  return { idx, inicio, fim, sol: sunLon(date) };
}

// ═══════════════════════════════════════════════════════════════
//  HORAS PLANETÁRIAS (mesmo algoritmo do Horae)
// ═══════════════════════════════════════════════════════════════

// Regente de cada dia da semana (Dom → Sáb), pelo nome em CALDEIA
const REGENTE_SEMANA = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];

// Nascer e pôr do sol em minutos desde a meia-noite local (NOAA simplificado)
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

// Hora planetária que contém o instante t → { planeta, inicio, fim }
function horaPlanetaria(t, lat, lon) {
  const d = new Date(t);
  for (const delta of [0, -1]) {
    const dia    = new Date(d.getFullYear(), d.getMonth(), d.getDate() + delta);
    const amanha = new Date(dia.getFullYear(), dia.getMonth(), dia.getDate() + 1);
    const sol    = calcSunriseSunset(lat, lon, dia);
    const nascer = dia.getTime() + sol.nascer * 60000;
    const poente = dia.getTime() + sol.poente * 60000;
    const prox   = amanha.getTime() + calcSunriseSunset(lat, lon, amanha).nascer * 60000;
    if (t < nascer || t >= prox) continue;

    const diurna = t < poente;
    const dur = diurna ? (poente - nascer) / 12 : (prox - poente) / 12;
    const base = diurna ? nascer : poente;
    const k = Math.min(11, Math.floor((t - base) / dur));
    const n = (diurna ? 0 : 12) + k;
    const pos = CALDEIA.findIndex(p => p.nome === REGENTE_SEMANA[dia.getDay()]);
    return { planeta: CALDEIA[(pos + n) % 7], inicio: base + k * dur, fim: base + (k + 1) * dur };
  }
  return null;
}

// Próximas vezes em que o anjo `idx` sobe no Ascendente, com as horas planetárias do período.
// soRegente: só períodos que coincidem com a hora do regente do decanato do anjo.
function proximasOcorrencias(idx, lat, lon, soRegente, limite = 10, maxDias = 60) {
  const agora   = Date.now();
  const regente = anjoInfo(idx).regente;
  const hoje    = new Date(agora);
  const achados = [];
  let anterior  = null;

  for (let k = 0; k < maxDias && (soRegente || achados.length < limite); k++) {
    const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + k);
    for (const p of calcDia(dia, lat, lon)) {
      if (p.idx !== idx || p.fim <= agora) continue;
      // período que atravessa a meia-noite vem partido em dois dias
      if (anterior && anterior.fim === p.inicio) { anterior.fim = p.fim; continue; }
      anterior = { inicio: Math.max(p.inicio, agora), fim: p.fim };
      achados.push(anterior);
    }
  }

  const resultado = [];
  for (const oc of achados) {
    const horas = [];
    for (let t = oc.inicio; t < oc.fim; ) {
      const h = horaPlanetaria(t, lat, lon);
      if (!h) break;
      horas.push(h);
      t = Math.max(h.fim, t) + 1;   // 1 ms além do fim: evita repetir a hora por arredondamento
    }
    const doRegente = horas.filter(h => h.planeta.nome === regente.nome);
    if (soRegente && !doRegente.length) continue;
    // janela em que anjo e hora do regente coincidem
    const janela = doRegente.length
      ? { inicio: Math.max(oc.inicio, doRegente[0].inicio), fim: Math.min(oc.fim, doRegente[doRegente.length - 1].fim) }
      : null;
    resultado.push({ ...oc, horas, janela });
    if (resultado.length >= limite) break;
  }
  return resultado;
}

// ═══════════════════════════════════════════════════════════════
//  FORMATAÇÃO
// ═══════════════════════════════════════════════════════════════

const pad = n => String(n).padStart(2, '0');
const fmtHHMM = t => { const d = new Date(t); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const fmtDDMM = t => { const d = new Date(t); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };
const fmtGrau = lon => { const s = Math.floor(lon / 30), g = lon - s * 30; return `${Math.floor(g)}°${pad(Math.floor((g % 1) * 60))}' ${SIGNOS[s].sym}`; };

function heb(texto, cls = 'heb') { return `<span class="${cls}" dir="rtl" lang="he">${texto}</span>`; }

// ═══════════════════════════════════════════════════════════════
//  LOCALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

const estado = { lat: -23.55, lon: -46.63, cidade: 'São Paulo', estado: 'SP', pais: 'Brasil' };
let diaVisto = null;   // null = hoje

function salvarLocalizacao() {
  localStorage.setItem('shem_localizacao', JSON.stringify(estado));
  syncWidgetLocation();
}

// Usa a cidade do próprio módulo; na primeira vez, aproveita a do Horae ou do Astra
function carregarLocalizacao() {
  try {
    const proprio = localStorage.getItem('shem_localizacao');
    if (proprio) { Object.assign(estado, JSON.parse(proprio)); return true; }
    const horae = localStorage.getItem('hp_localizacao');
    if (horae) { Object.assign(estado, JSON.parse(horae)); salvarLocalizacao(); return true; }
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
    bridge.setShemLocation({ lat: estado.lat, lon: estado.lon, name: estado.cidade || '' }).catch(() => {});
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

function renderPainelAtual(agora, periodosHoje) {
  const atualIdx = periodosHoje.findIndex(p => agora >= p.inicio && agora < p.fim);
  const atual    = periodosHoje[atualIdx];
  if (!atual) return;
  const a = anjoInfo(atual.idx);
  painelIdx.momento = atual.idx;

  document.getElementById('painel-heb').textContent      = a.hebraico;
  document.getElementById('painel-nome').textContent     = a.nome;
  document.getElementById('painel-num').textContent      = `Anjo nº ${a.num} · ${a.quinario}`;
  document.getElementById('painel-intervalo').textContent = `${fmtHHMM(atual.inicio)} – ${fmtHHMM(atual.fim)}`;
  document.getElementById('painel-carta').innerHTML =
    `<div>Nome divino: ${heb(a.nomeDivino, 'heb-sm')}</div>` +
    `<div>Decanato: <span style="color:${a.regente.cor}">${a.regente.sym}</span> ${a.regente.nome} em ${SIGNOS[a.signo].nome} · ${a.carta} — ${a.titulo}</div>`;

  // Próximo anjo (pode cair no dia seguinte)
  let prox = periodosHoje[atualIdx + 1];
  if (!prox) prox = { idx: (atual.idx + 1) % 72 };
  const pa  = anjoInfo(prox.idx);
  const min = Math.max(0, Math.ceil((atual.fim - agora) / 60000));
  document.getElementById('painel-prox').innerHTML = `${heb(pa.hebraico, 'heb-sm')} ${pa.nome} em ${min} min`;

  // Anjo dos dias — quinário do Sol
  const qs = calcQuinarioSolar(new Date(agora));
  painelIdx.sol = qs.idx;
  const s  = anjoInfo(qs.idx);
  document.getElementById('painel-sol').innerHTML =
    `${heb(s.hebraico, 'heb-sm')} <b>${s.nome}</b><span class="sol-sub">☉ ${fmtGrau(qs.sol)} · ${fmtDDMM(qs.inicio)} a ${fmtDDMM(qs.fim)}</span>`;
}

function renderTabela(periodos, agora, rolar) {
  const tbody = document.getElementById('tabela-body');
  tbody.innerHTML = '';
  let linhaAtual = null;

  periodos.forEach(p => {
    const a  = anjoInfo(p.idx);
    const tr = document.createElement('tr');
    const atual = agora >= p.inicio && agora < p.fim;
    tr.className = atual ? 'hora-atual' : '';
    tr.dataset.idx = p.idx;
    tr.innerHTML = `
      <td class="col-num">${a.num}</td>
      <td class="col-inicio">${fmtHHMM(p.inicio)}</td>
      <td class="col-fim">${fmtHHMM(p.fim)}</td>
      <td class="col-anjo">
        <div class="anjo-linha">${heb(a.hebraico)}<span class="tab-nome">${a.nome}</span></div>
        <div class="anjo-sub">${a.quinario}</div>
        <div class="anjo-sub">${heb(a.nomeDivino, 'heb-xs')} · <span style="color:${a.regente.cor}">${a.regente.sym}</span> ${a.regente.nome} · ${a.carta}</div>
      </td>`;
    tbody.appendChild(tr);
    if (atual) linhaAtual = tr;
  });

  if (linhaAtual && rolar) {
    setTimeout(() => linhaAtual.scrollIntoView({ behavior: 'smooth', block: 'center' }), 100);
  }
}

let ultimoDiaRender = null;

function atualizarTudo(forcar = false) {
  const agora = Date.now();
  const hoje  = new Date(agora);
  const dia   = diaVisto || hoje;
  const chave = `${dia.toDateString()}|${estado.lat}|${estado.lon}`;

  const periodosHoje = calcDia(hoje, estado.lat, estado.lon);
  renderPainelAtual(agora, periodosHoje);

  const periodos = diaVisto ? calcDia(dia, estado.lat, estado.lon) : periodosHoje;
  renderTabela(periodos, agora, forcar || chave !== ultimoDiaRender);
  ultimoDiaRender = chave;

  const ehHoje = !diaVisto || dia.toDateString() === hoje.toDateString();
  document.getElementById('tabela-dia').textContent = ehHoje ? `Hoje · ${fmtDDMM(dia)}` : fmtDDMM(dia);
  document.getElementById('btn-hoje').style.visibility = ehHoje ? 'hidden' : 'visible';
}

function mudarDia(delta) {
  const base = diaVisto || new Date();
  diaVisto = new Date(base.getFullYear(), base.getMonth(), base.getDate() + delta);
  if (diaVisto.toDateString() === new Date().toDateString()) diaVisto = null;
  atualizarTudo(true);
}

function atualizarRelogio() {
  const d = new Date();
  document.getElementById('relogio').textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// ═══════════════════════════════════════════════════════════════
//  FICHA DO ANJO E LISTA DOS 72
// ═══════════════════════════════════════════════════════════════

const painelIdx = { momento: null, sol: null };
const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
let fichaIdx = null;

function abrirSheet()  { document.getElementById('modal-ficha').style.display = 'flex'; }
function fecharSheet() { document.getElementById('modal-ficha').style.display = 'none'; }

function linhaFicha(rotulo, valor) {
  return `<div class="ficha-linha"><span class="ficha-rot">${rotulo}</span><span class="ficha-val">${valor}</span></div>`;
}

function abrirFicha(idx) {
  fichaIdx = idx;
  const a = anjoInfo(idx);
  const g = SIGNO_GD[a.signo];
  const [coro, sephirah, arcanjoCoro] = COROS[Math.floor(idx / 8)];
  const [ref, versiculo] = SALMOS[idx];
  const reg = `<span style="color:${a.regente.cor}">${a.regente.sym}</span> ${a.regente.nome}`;

  document.getElementById('ficha-titulo').textContent = `Anjo nº ${a.num}`;
  document.getElementById('ficha-corpo').innerHTML = `
    <div class="ficha-topo">
      ${heb(a.hebraico, 'ficha-heb')}
      <div>
        <div class="ficha-nome">${a.nome}</div>
        <div class="ficha-sub">${a.quinario}</div>
      </div>
    </div>

    <div class="ficha-versiculo">
      <div class="ficha-ref">${ref}</div>
      <div class="ficha-texto">“${versiculo}”</div>
    </div>

    <div class="ficha-secao">Golden Dawn</div>
    ${linhaFicha('Nome divino', heb(a.nomeDivino, 'heb-sm'))}
    ${linhaFicha('Decanato', `${reg} em ${SIGNOS[a.signo].nome}`)}
    ${linhaFicha('Carta', `${a.carta} — ${a.titulo}`)}
    ${linhaFicha('Arcanos', `${g.arcano} · ${ARCANO_PLANETA[a.regente.nome]}`)}
    ${linhaFicha('Signo', `${SIGNOS[a.signo].sym} ${heb(g.yhvh, 'heb-sm')} · ${g.arcanjo} (arcanjo) · ${g.anjo} (anjo)`)}
    ${linhaFicha('Coro', `${coro} · ${sephirah} · ${arcanjoCoro}`)}

    <div class="ficha-secao">Próximas vezes no Ascendente · ${estado.cidade || ''}</div>
    <label class="ficha-filtro">
      <input type="checkbox" id="ficha-so-regente" />
      Só na hora de ${reg} (regente do decanato)
    </label>
    <div id="ficha-ocorrencias"><div class="city-loading">Calculando…</div></div>
  `;
  document.getElementById('ficha-so-regente').addEventListener('change', renderOcorrencias);
  abrirSheet();
  document.getElementById('ficha-corpo').scrollTop = 0;
  setTimeout(renderOcorrencias, 30);   // deixa a ficha aparecer antes do cálculo
}

function renderOcorrencias() {
  const caixa = document.getElementById('ficha-ocorrencias');
  if (!caixa || fichaIdx == null) return;
  const so = document.getElementById('ficha-so-regente').checked;
  const regente = anjoInfo(fichaIdx).regente;
  caixa.innerHTML = '<div class="city-loading">Calculando…</div>';

  setTimeout(() => {
    const lista = proximasOcorrencias(fichaIdx, estado.lat, estado.lon, so);
    if (!lista.length) {
      caixa.innerHTML = '<div class="city-loading">Nenhuma ocorrência nos próximos 60 dias.</div>';
      return;
    }
    caixa.innerHTML = lista.map(o => {
      const d = new Date(o.inicio);
      const horas = o.horas.map(h =>
        `<span class="oc-hora${h.planeta.nome === regente.nome ? ' oc-regente' : ''}" style="color:${h.planeta.cor}">${h.planeta.sym} ${h.planeta.nome}</span>`
      ).join(' → ');
      const janela = o.janela
        ? `<div class="oc-janela">✦ Hora de ${regente.nome}: ${fmtHHMM(o.janela.inicio)} – ${fmtHHMM(o.janela.fim)}</div>` : '';
      return `<div class="oc-item${o.janela ? ' oc-com-regente' : ''}">
        <div class="oc-quando"><b>${DIAS_SEMANA[d.getDay()]} ${fmtDDMM(o.inicio)}</b> · ${fmtHHMM(o.inicio)} – ${fmtHHMM(o.fim)}</div>
        <div class="oc-horas">${horas}</div>
        ${janela}
      </div>`;
    }).join('');
  }, 10);
}

function abrirLista() {
  fichaIdx = null;
  document.getElementById('ficha-titulo').textContent = 'Os 72 Anjos';
  document.getElementById('ficha-corpo').innerHTML = ANJOS.map((_, i) => {
    const a = anjoInfo(i);
    return `<div class="lista-item" data-idx="${i}">
      <span class="lista-num">${a.num}</span>
      ${heb(a.hebraico)}
      <span class="lista-nome">${a.nome}</span>
      <span class="lista-quin">${a.quinario}</span>
    </div>`;
  }).join('');
  abrirSheet();
  document.getElementById('ficha-corpo').scrollTop = 0;
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

  // Ficha do anjo: linhas da tabela, anjo do momento, anjo dos dias, lista dos 72
  document.getElementById('tabela-body').addEventListener('click', (e) => {
    const tr = e.target.closest('tr[data-idx]');
    if (tr) abrirFicha(Number(tr.dataset.idx));
  });
  document.getElementById('bloco-planeta').addEventListener('click', () => {
    if (painelIdx.momento != null) abrirFicha(painelIdx.momento);
  });
  document.getElementById('painel-sol').addEventListener('click', () => {
    if (painelIdx.sol != null) abrirFicha(painelIdx.sol);
  });
  document.getElementById('btn-lista').addEventListener('click', abrirLista);
  document.getElementById('ficha-corpo').addEventListener('click', (e) => {
    const item = e.target.closest('.lista-item');
    if (item) abrirFicha(Number(item.dataset.idx));
  });
  document.getElementById('ficha-overlay').addEventListener('click', fecharSheet);
  document.getElementById('btn-ficha-fechar').addEventListener('click', fecharSheet);

  if (carregarLocalizacao()) {
    document.getElementById('btn-cidade').textContent = `📍 ${estado.cidade}`;
    syncWidgetLocation();
  } else {
    detectarLocalizacao();
  }

  atualizarTudo(true);
  atualizarRelogio();
  setInterval(atualizarRelogio, 1000);
  setInterval(() => atualizarTudo(false), 30000);
});
