'use strict';

// ═══════════════════════════════════════════════════════════════
//  DADOS
// ═══════════════════════════════════════════════════════════════

const PLANETS = [
  { id: 'sun',     name: 'Sol',      sym: '☉', color: '#e8b820' },
  { id: 'moon',    name: 'Lua',      sym: '☽', color: '#b0b0e0' },
  { id: 'mercury', name: 'Mercúrio', sym: '☿', color: '#70a8e0' },
  { id: 'venus',   name: 'Vênus',    sym: '♀', color: '#e080a0' },
  { id: 'mars',    name: 'Marte',    sym: '♂', color: '#cc2828' },
  { id: 'jupiter', name: 'Júpiter',  sym: '♃', color: '#e09030' },
  { id: 'saturn',  name: 'Saturno',  sym: '♄', color: '#b09050' },
  { id: 'uranus',  name: 'Urano',    sym: '♅', color: '#50c8e8' },
  { id: 'neptune', name: 'Netuno',   sym: '♆', color: '#6060e0' },
  { id: 'pluto',   name: 'Plutão',   sym: '♇', color: '#a060c0' },
  { id: 'node',    name: 'Nodo ☊',  sym: '☊', color: '#c0a0d0' },
];

const SIGNS = [
  { name: 'Áries',       sym: '♈', color: '#e05050' },
  { name: 'Touro',       sym: '♉', color: '#70b050' },
  { name: 'Gêmeos',      sym: '♊', color: '#c8a820' },
  { name: 'Câncer',      sym: '♋', color: '#8888d0' },
  { name: 'Leão',        sym: '♌', color: '#e08818' },
  { name: 'Virgem',      sym: '♍', color: '#78b878' },
  { name: 'Libra',       sym: '♎', color: '#d080a8' },
  { name: 'Escorpião',   sym: '♏', color: '#b02020' },
  { name: 'Sagitário',   sym: '♐', color: '#d06820' },
  { name: 'Capricórnio', sym: '♑', color: '#808898' },
  { name: 'Aquário',     sym: '♒', color: '#4090d8' },
  { name: 'Peixes',      sym: '♓', color: '#7060b8' },
];

const ASPECTS = [
  { name: 'Conjunção',  sym: '☌', angle: 0,   orb: 8, color: '#e8b820' },
  { name: 'Sextil',     sym: '⚹', angle: 60,  orb: 6, color: '#50c050' },
  { name: 'Quadratura', sym: '□', angle: 90,  orb: 7, color: '#cc2828' },
  { name: 'Trígono',    sym: '△', angle: 120, orb: 8, color: '#4878e0' },
  { name: 'Oposição',   sym: '☍', angle: 180, orb: 8, color: '#9050b8' },
];

const CIDADES_BR = [
  { name: 'Belém',          state: 'PA', lat: -1.4558,  lon: -48.5044 },
  { name: 'Belo Horizonte', state: 'MG', lat: -19.9191, lon: -43.9386 },
  { name: 'Boa Vista',      state: 'RR', lat:  2.8235,  lon: -60.6758 },
  { name: 'Brasília',       state: 'DF', lat: -15.7801, lon: -47.9292 },
  { name: 'Campo Grande',   state: 'MS', lat: -20.4697, lon: -54.6201 },
  { name: 'Cuiabá',         state: 'MT', lat: -15.5989, lon: -56.0949 },
  { name: 'Curitiba',       state: 'PR', lat: -25.4284, lon: -49.2733 },
  { name: 'Florianópolis',  state: 'SC', lat: -27.5954, lon: -48.5480 },
  { name: 'Fortaleza',      state: 'CE', lat: -3.7172,  lon: -38.5433 },
  { name: 'Goiânia',        state: 'GO', lat: -16.6869, lon: -49.2648 },
  { name: 'João Pessoa',    state: 'PB', lat: -7.1195,  lon: -34.8450 },
  { name: 'Macapá',         state: 'AP', lat:  0.0349,  lon: -51.0694 },
  { name: 'Maceió',         state: 'AL', lat: -9.6658,  lon: -35.7350 },
  { name: 'Manaus',         state: 'AM', lat: -3.1190,  lon: -60.0217 },
  { name: 'Natal',          state: 'RN', lat: -5.7945,  lon: -35.2110 },
  { name: 'Palmas',         state: 'TO', lat: -10.2491, lon: -48.3243 },
  { name: 'Porto Alegre',   state: 'RS', lat: -30.0346, lon: -51.2177 },
  { name: 'Porto Velho',    state: 'RO', lat: -8.7612,  lon: -63.9004 },
  { name: 'Recife',         state: 'PE', lat: -8.0476,  lon: -34.8770 },
  { name: 'Rio Branco',     state: 'AC', lat: -9.9754,  lon: -67.8249 },
  { name: 'Rio de Janeiro', state: 'RJ', lat: -22.9068, lon: -43.1729 },
  { name: 'Salvador',       state: 'BA', lat: -12.9714, lon: -38.5014 },
  { name: 'São Luís',       state: 'MA', lat: -2.5391,  lon: -44.2829 },
  { name: 'São Paulo',      state: 'SP', lat: -23.5505, lon: -46.6333 },
  { name: 'Teresina',       state: 'PI', lat: -5.0892,  lon: -42.8019 },
  { name: 'Vitória',        state: 'ES', lat: -20.2976, lon: -40.2958 },
];

// ═══════════════════════════════════════════════════════════════
//  API — substitui ipcMain/electronAPI por fetch() direto
// ═══════════════════════════════════════════════════════════════

async function searchCities(query) {
  const term = query.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const res  = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome');
  const all  = await res.json();
  return all
    .filter(m => {
      const name = m.nome.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      return name.startsWith(term);
    })
    .slice(0, 12)
    .map(m => ({
      name:    m.nome,
      state:   m['regiao-imediata']['regiao-intermediaria'].UF.sigla,
      ibgeId:  m.id,
    }));
}

async function getCityCoords(name, state) {
  const q   = encodeURIComponent(`${name}, ${state}, Brasil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1&countrycodes=br`;
  const res = await fetch(url, { headers: { 'User-Agent': 'AstraHermetica/1.0' } });
  const results = await res.json();
  if (results.length === 0) throw new Error('Cidade não encontrada');
  return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
}

function detectLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalização não disponível'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      err => reject(err),
      { timeout: 8000, maximumAge: 60000 }
    );
  });
}

// ═══════════════════════════════════════════════════════════════
//  CÁLCULOS ASTRONÔMICOS
// ═══════════════════════════════════════════════════════════════

function toRad(d) { return d * Math.PI / 180; }
function toDeg(r) { return r * 180 / Math.PI; }
function norm360(x) { return ((x % 360) + 360) % 360; }

function jdn(date) {
  // Data juliana (UT) a partir do timestamp
  return date.getTime() / 86400000 + 2440587.5;
}

// ΔT (TT − UT) em segundos — aproximação a partir de Espenak & Meeus
function deltaT(jd) {
  const y = 2000 + (jd - 2451545.0) / 365.25;
  if (y >= 2015 && y < 2050) return 69.2;
  if (y >= 2005 && y < 2015) return 64.7 + 0.29 * (y - 2005);
  if (y >= 1986 && y < 2005) { const t = y - 2000; return 63.86 + 0.3345*t - 0.060374*t*t + 0.0017275*t**3 + 0.000651814*t**4 + 0.00002373599*t**5; }
  if (y >= 1961 && y < 1986) { const t = y - 1975; return 45.45 + 1.067*t - t*t/260 - t**3/718; }
  if (y >= 1941 && y < 1961) { const t = y - 1950; return 29.07 + 0.407*t - t*t/233 + t**3/2547; }
  if (y >= 1920 && y < 1941) { const t = y - 1920; return 21.20 + 0.84493*t - 0.076100*t*t + 0.0020936*t**3; }
  if (y >= 1900 && y < 1920) { const t = y - 1900; return -2.79 + 1.494119*t - 0.0598939*t*t + 0.0061966*t**3 - 0.000197*t**4; }
  const u = (y - 1820) / 100;
  return -20 + 32*u*u;
}

function julianCenturies(date) { return (jdn(date) - 2451545.0) / 36525.0; }
function julianCenturiesTT(date) {
  const jd = jdn(date);
  return (jd + deltaT(jd) / 86400 - 2451545.0) / 36525.0;
}

// Nutação em longitude (graus) e obliquidade verdadeira — Meeus cap. 22 (baixa precisão)
function nutation(T) {
  const Om = toRad(125.04452 - 1934.136261*T);
  const Ls = toRad(280.4665 + 36000.7698*T);
  const Lm = toRad(218.3165 + 481267.8813*T);
  const dPsi = (-17.20*Math.sin(Om) - 1.32*Math.sin(2*Ls) - 0.23*Math.sin(2*Lm) + 0.21*Math.sin(2*Om)) / 3600;
  const dEps = (  9.20*Math.cos(Om) + 0.57*Math.cos(2*Ls) + 0.10*Math.cos(2*Lm) - 0.09*Math.cos(2*Om)) / 3600;
  const eps0 = 23.439291111 - 0.0130041667*T - 1.64e-7*T*T + 5.036e-7*T*T*T;
  return { dPsi, eps: eps0 + dEps };
}

// Elementos keplerianos aproximados (JPL, Standish — válidos 1800–2050)
// [a, e, I, L, ϖ, Ω] e taxas por século, referidos à eclíptica J2000
const ORBITS = {
  mercury: [[0.38709927, 0.20563593, 7.00497902, 252.25032350, 77.45779628, 48.33076593],
            [0.00000037, 0.00001906, -0.00594749, 149472.67411175, 0.16047689, -0.12534081]],
  venus:   [[0.72333566, 0.00677672, 3.39467605, 181.97909950, 131.60246718, 76.67984255],
            [0.00000390, -0.00004107, -0.00078890, 58517.81538729, 0.00268329, -0.27769418]],
  earth:   [[1.00000261, 0.01671123, -0.00001531, 100.46457166, 102.93768193, 0.0],
            [0.00000562, -0.00004392, -0.01294668, 35999.37244981, 0.32327364, 0.0]],
  mars:    [[1.52371034, 0.09339410, 1.84969142, -4.55343205, -23.94362959, 49.55953891],
            [0.00001847, 0.00007882, -0.00813131, 19140.30268499, 0.44441088, -0.29257343]],
  jupiter: [[5.20288700, 0.04838624, 1.30439695, 34.39644051, 14.72847983, 100.47390909],
            [-0.00011607, -0.00013253, -0.00183714, 3034.74612775, 0.21252668, 0.20469106]],
  saturn:  [[9.53667594, 0.05386179, 2.48599187, 49.95424423, 92.59887831, 113.66242448],
            [-0.00125060, -0.00050991, 0.00193609, 1222.49362201, -0.41897216, -0.28867794]],
  uranus:  [[19.18916464, 0.04725744, 0.77263783, 313.23810451, 170.95427630, 74.01692503],
            [-0.00196176, -0.00004397, -0.00242939, 428.48202785, 0.40805281, 0.04240589]],
  neptune: [[30.06992276, 0.00859048, 1.77004347, -55.12002969, 44.96476227, 131.78422574],
            [0.00026291, 0.00005105, 0.00035372, 218.45945325, -0.32241464, -0.00508664]],
  pluto:   [[39.48211675, 0.24882730, 17.14001206, 238.92903833, 224.06891629, 110.30393684],
            [-0.00031596, 0.00005170, 0.00004818, 145.20780515, -0.04062942, -0.01183482]],
};

// Posição heliocêntrica eclíptica (J2000) em UA
function helioXYZ(id, T) {
  const [el, rt] = ORBITS[id];
  const a = el[0] + rt[0]*T, e = el[1] + rt[1]*T, I = toRad(el[2] + rt[2]*T);
  const L = el[3] + rt[3]*T, w = el[4] + rt[4]*T, O = el[5] + rt[5]*T;
  const M = toRad(norm360(L - w));
  let E = M + e*Math.sin(M);
  for (let k = 0; k < 10; k++) {
    const dE = (E - e*Math.sin(E) - M) / (1 - e*Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  const xp = a*(Math.cos(E) - e), yp = a*Math.sqrt(1 - e*e)*Math.sin(E);
  const om = toRad(w - O), Or = toRad(O);
  const co = Math.cos(om), so = Math.sin(om), cO = Math.cos(Or), sO = Math.sin(Or), cI = Math.cos(I), sI = Math.sin(I);
  return [
    (co*cO - so*sO*cI)*xp + (-so*cO - co*sO*cI)*yp,
    (co*sO + so*cO*cI)*xp + (-so*sO + co*cO*cI)*yp,
    (so*sI)*xp + (co*sI)*yp,
  ];
}

// Longitude geocêntrica aparente (eclíptica e equinócio da data)
function planetLon(id, T, dPsi) {
  const E = helioXYZ('earth', T);
  let P = helioXYZ(id, T), d = 0;
  for (let k = 0; k < 2; k++) {          // correção de tempo-luz
    d = Math.hypot(P[0]-E[0], P[1]-E[1], P[2]-E[2]);
    P = helioXYZ(id, T - d * 0.0057755183 / 36525);
  }
  const lonJ2000 = toDeg(Math.atan2(P[1]-E[1], P[0]-E[0]));
  // precessão J2000 → data, nutação e aberração (aprox.)
  return norm360(lonJ2000 + 1.396971*T + 0.0003086*T*T + dPsi);
}

function sunLon(T) {
  const L0 = norm360(280.46646 + 36000.76983 * T + 0.0003032 * T * T);
  const M  = norm360(357.52911 + 35999.05029 * T - 0.0001537 * T * T);
  const Mr = toRad(M);
  const C  = (1.914602 - 0.004817*T - 0.000014*T*T) * Math.sin(Mr)
           + (0.019993 - 0.000101*T) * Math.sin(2*Mr)
           + 0.000289 * Math.sin(3*Mr);
  const Om = toRad(125.04 - 1934.136 * T);
  return norm360(L0 + C - 0.00569 - 0.00478 * Math.sin(Om));  // longitude aparente
}

// Lua — Meeus cap. 47 (termos principais da tabela 47.A, unidades de 1e-6 grau)
const MOON_TERMS = [
  [0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],
  [0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],
  [0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
  [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],
  [2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],
  [4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],
  [1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069],[2,-2,-1,0,2048],
  [2,0,1,-2,-1773],[2,0,0,2,-1595],[4,-1,-1,0,1215],[0,0,2,2,-1110],[3,0,-1,0,-892],
  [2,1,1,0,-810],[4,-1,-2,0,759],[0,2,-1,0,-713],[2,2,-1,0,-700],[2,1,-2,0,691],
  [2,-1,0,-2,596],[4,0,1,0,549],[0,0,4,0,537],[4,-1,0,0,520],[1,0,-2,0,-487],
  [2,1,0,-2,-399],[0,0,2,-2,-381],[1,1,1,0,351],[3,0,-2,0,-340],[4,0,-3,0,330],
  [2,-1,2,0,327],[0,2,1,0,-323],[1,1,-1,0,299],[2,0,3,0,294],
];

function moonArgs(T) {
  return {
    Lp: norm360(218.3164477 + 481267.88123421*T - 0.0015786*T*T),
    D:  norm360(297.8501921 + 445267.1114034*T - 0.0018819*T*T),
    M:  norm360(357.5291092 + 35999.0502909*T - 0.0001536*T*T),
    Mp: norm360(134.9633964 + 477198.8675055*T + 0.0087414*T*T),
    F:  norm360( 93.2720950 + 483202.0175233*T - 0.0036539*T*T),
  };
}

function moonLon(T, dPsi) {
  const { Lp, D, M, Mp, F } = moonArgs(T);
  const E = 1 - 0.002516*T - 0.0000074*T*T;
  let sum = 0;
  for (const [d, m, mp, f, c] of MOON_TERMS) {
    const k = Math.abs(m) === 1 ? E : Math.abs(m) === 2 ? E*E : 1;
    sum += c * k * Math.sin(toRad(d*D + m*M + mp*Mp + f*F));
  }
  const A1 = toRad(119.75 + 131.849*T), A2 = toRad(53.09 + 479264.290*T);
  sum += 3958*Math.sin(A1) + 1962*Math.sin(toRad(Lp - F)) + 318*Math.sin(A2);
  return norm360(Lp + sum / 1e6 + dPsi);
}

function nodeLon(T) {
  // Nodo Lunar Verdadeiro (Cabeça do Dragão) — nodo médio + correções periódicas (Meeus)
  const { D, M, Mp, F } = moonArgs(T);
  const mean = 125.0445479 - 1934.1362891*T + 0.0020754*T*T;
  return norm360(mean
    - 1.4979*Math.sin(toRad(2*(D - F)))
    - 0.1500*Math.sin(toRad(M))
    - 0.1226*Math.sin(toRad(2*D))
    + 0.1176*Math.sin(toRad(2*F))
    - 0.0801*Math.sin(toRad(2*(Mp - F))));
}

function calcPlanets(date) {
  const T = julianCenturiesTT(date);
  const { dPsi } = nutation(T);
  return {
    sun:     sunLon(T),
    moon:    moonLon(T, dPsi),
    mercury: planetLon('mercury', T, dPsi),
    venus:   planetLon('venus',   T, dPsi),
    mars:    planetLon('mars',    T, dPsi),
    jupiter: planetLon('jupiter', T, dPsi),
    saturn:  planetLon('saturn',  T, dPsi),
    uranus:  planetLon('uranus',  T, dPsi),
    neptune: planetLon('neptune', T, dPsi),
    pluto:   planetLon('pluto',   T, dPsi),
    node:    nodeLon(T),
  };
}

// Detecta retrogradação: compara longitude 12h depois vs. 12h antes.
// Planetas retrógrados movem-se para trás (longitude diminui).
// O nodo lunar é quase sempre retrógrado por definição — não marcamos.
function calcRetrogrades(date) {
  const ms12h = 12 * 3600 * 1000;
  const posA  = calcPlanets(new Date(date.getTime() - ms12h));
  const posB  = calcPlanets(new Date(date.getTime() + ms12h));
  const rx = {};
  for (const p of PLANETS) {
    if (p.id === 'node') { rx[p.id] = false; continue; }
    let delta = posB[p.id] - posA[p.id];
    // Normaliza cruzamento de 0°/360°
    if (delta >  180) delta -= 360;
    if (delta < -180) delta += 360;
    rx[p.id] = delta < 0;
  }
  return rx;
}

// Tempo sideral aparente de Greenwich (graus)
function gst(date) {
  const T = julianCenturies(date), D = jdn(date) - 2451545.0;
  const { dPsi, eps } = nutation(T);
  return norm360(280.46061837 + 360.98564736629*D + 0.000387933*T*T - T*T*T/38710000
               + dPsi * Math.cos(toRad(eps)));
}

function lst(date, lonDeg) { return norm360(gst(date) + lonDeg); }

function calcAscendant(lstDeg, latDeg, epsDeg) {
  const e = toRad(epsDeg), RA = toRad(lstDeg), la = toRad(latDeg);
  return norm360(toDeg(Math.atan2(Math.cos(RA), -(Math.sin(RA)*Math.cos(e) + Math.tan(la)*Math.sin(e)))));
}

function calcMC(lstDeg, epsDeg) {
  const RA = toRad(lstDeg);
  return norm360(toDeg(Math.atan2(Math.sin(RA), Math.cos(RA)*Math.cos(toRad(epsDeg)))));
}

// Longitude eclíptica do ponto da eclíptica com a ascensão reta dada
function raToLon(raDeg, epsDeg) {
  const RA = toRad(raDeg);
  return norm360(toDeg(Math.atan2(Math.sin(RA), Math.cos(RA)*Math.cos(toRad(epsDeg)))));
}

// Cúspide intermediária de Plácido por iteração dos semi-arcos.
// frac = fração do semi-arco diurno (casas 11/12) ou noturno (2/3).
function placidusCusp(ramc, latDeg, epsDeg, frac, nocturnal) {
  const tl = Math.tan(toRad(latDeg)), se = Math.sin(toRad(epsDeg));
  let ra = norm360(ramc + (nocturnal ? 180 - 90*frac : 90*frac));
  for (let k = 0; k < 50; k++) {
    const lon = raToLon(ra, epsDeg);
    const dec = Math.asin(se * Math.sin(toRad(lon)));
    const x   = tl * Math.tan(dec);
    if (Math.abs(x) >= 1) return null;          // ponto circumpolar
    const dsa = 90 + toDeg(Math.asin(x));        // semi-arco diurno
    const next = nocturnal ? norm360(ramc + 180 - frac*(180 - dsa)) : norm360(ramc + frac*dsa);
    let diff = Math.abs(next - ra); if (diff > 180) diff = 360 - diff;
    ra = next;
    if (diff < 1e-7) break;
  }
  return raToLon(ra, epsDeg);
}

// Casas de Plácido (cúspides 1..12). Em latitudes polares, cai para Porfírio.
function calcHouses(date, latDeg, lonDeg) {
  const T    = julianCenturies(date);
  const eps  = nutation(T).eps;
  const ramc = lst(date, lonDeg);
  const asc  = calcAscendant(ramc, latDeg, eps);
  const mc   = calcMC(ramc, eps);

  const c11 = placidusCusp(ramc, latDeg, eps, 1/3, false);
  const c12 = placidusCusp(ramc, latDeg, eps, 2/3, false);
  const c2  = placidusCusp(ramc, latDeg, eps, 2/3, true);
  const c3  = placidusCusp(ramc, latDeg, eps, 1/3, true);

  let h = [];
  if ([c11, c12, c2, c3].some(c => c == null)) {
    const q1 = norm360(asc - mc) / 3, q2 = norm360(mc + 180 - asc) / 3;
    h = [asc, asc + q2, asc + 2*q2, mc + 180, mc + 180 + q1, mc + 180 + 2*q1,
         asc + 180, asc + 180 + q2, asc + 180 + 2*q2, mc, mc + q1, mc + 2*q1];
  } else {
    h = [asc, c2, c3, mc + 180, c11 + 180, c12 + 180,
         asc + 180, c2 + 180, c3 + 180, mc, c11, c12];
  }
  return h.map(norm360);
}

function signOf(lon) {
  const idx = Math.floor(lon / 30) % 12;
  return { idx, deg: lon - idx * 30 };
}

function calcAspects(pos) {
  const keys = Object.keys(pos), found = [];
  for (let i = 0; i < keys.length; i++)
    for (let j = i+1; j < keys.length; j++) {
      const diff  = norm360(Math.abs(pos[keys[i]] - pos[keys[j]]));
      const angle = diff > 180 ? 360 - diff : diff;
      for (const asp of ASPECTS)
        if (Math.abs(angle - asp.angle) <= asp.orb)
          found.push({ p1: keys[i], p2: keys[j], asp });
    }
  return found;
}

// ═══════════════════════════════════════════════════════════════
//  CANVAS
// ═══════════════════════════════════════════════════════════════

const canvas = document.getElementById('chart');
const ctx    = canvas.getContext('2d');

function resize() {
  const wrap       = document.getElementById('canvas-wrap');
  const dpr        = window.devicePixelRatio || 1;
  const isPortrait = window.innerHeight > window.innerWidth;

  let size;
  if (isPortrait) {
    const w = Math.floor(wrap.getBoundingClientRect().width) - 8;
    size = Math.min(w, Math.floor(window.innerHeight * 0.52));
  } else {
    const rect = wrap.getBoundingClientRect();
    size = Math.floor(Math.min(rect.width, rect.height)) - 8;
  }

  if (size < 10) return;
  canvas.width  = size * dpr;
  canvas.height = size * dpr;
  canvas.style.width  = size + 'px';
  canvas.style.height = size + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function lon2a(lon, asc) { return toRad(180 - (lon - asc)); }

// Fase da Lua no centro do mapa. elong = longitude da Lua − longitude do Sol.
// Lado iluminado como visto no céu do local: no hemisfério sul fica espelhado.
function drawMoonPhase(cx, cy, r, elong, sul) {
  const e = norm360(elong);
  const c = Math.cos(toRad(e));                 // 1 = nova, −1 = cheia
  let litRight = e < 180;                       // crescente: iluminada à direita (hemisfério norte)
  if (sul) litRight = !litRight;
  const rx = r * Math.abs(c);
  const terminadorDireita = (c > 0) === litRight;

  // fundo que cobre as linhas de aspecto
  ctx.fillStyle = 'rgba(240,236,228,0.96)';
  ctx.beginPath(); ctx.arc(cx, cy, r * 1.35, 0, Math.PI * 2); ctx.fill();

  // disco escuro
  ctx.fillStyle = '#3a3848';
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();

  // parte iluminada: semicírculo do lado aceso + meia elipse do terminador
  ctx.fillStyle = '#ece6c8';
  ctx.beginPath();
  ctx.arc(cx, cy, r, -Math.PI / 2, Math.PI / 2, !litRight);
  if (terminadorDireita) ctx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, -Math.PI / 2, true);
  else                   ctx.ellipse(cx, cy, rx, r, 0, Math.PI / 2, Math.PI * 1.5, false);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(100,75,30,0.55)';
  ctx.lineWidth = 0.8;
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
}

function pt(r, a, cx, cy) { return [cx + r*Math.cos(a), cy + r*Math.sin(a)]; }

function drawChart(positions, ascDeg, houses, aspects, retrogrades) {
  const S  = canvas.width / (window.devicePixelRatio || 1);
  const cx = S / 2, cy = S / 2;
  const R  = S / 2 - 14;

  if (R < 20) return;

  ctx.clearRect(0, 0, S, S);

  const rZ1 = R;
  const rZ2 = R * 0.78;
  const rH2 = R * 0.63;
  const rP  = R * 0.535;
  const rCt = R * 0.32;

  const fSign   = `${Math.max(12, R*0.10)|0}px serif`;
  const fPlanet = `${Math.max(13, R*0.105)|0}px serif`;
  const fDeg    = `${Math.max(7,  R*0.060)|0}px monospace`;
  const fHouse  = `bold ${Math.max(9, R*0.075)|0}px sans-serif`;
  const fLabel  = `bold ${Math.max(8, R*0.065)|0}px sans-serif`;

  const rings = [rZ1, rZ2, rH2, rCt];
  ctx.lineWidth = 1;
  rings.forEach(r => {
    ctx.strokeStyle = 'rgba(100,75,30,0.40)';
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.stroke();
  });
  ctx.strokeStyle = 'rgba(100,75,30,0.18)';
  ctx.lineWidth = 0.6;
  ctx.beginPath(); ctx.arc(cx, cy, R*0.46, 0, Math.PI*2); ctx.stroke();

  for (let i = 0; i < 12; i++) {
    const a    = lon2a(i * 30, ascDeg);
    const midA = lon2a(i * 30 + 15, ascDeg);
    const symR = (rZ1 + rZ2) / 2;

    ctx.strokeStyle = 'rgba(100,75,30,0.40)';
    ctx.lineWidth   = 0.8;
    ctx.beginPath();
    ctx.moveTo(...pt(rZ2, a, cx, cy));
    ctx.lineTo(...pt(rZ1, a, cx, cy));
    ctx.stroke();

    ctx.fillStyle    = SIGNS[i].color;
    ctx.font         = fSign;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(SIGNS[i].sym, ...pt(symR, midA, cx, cy));
  }

  for (let i = 0; i < 12; i++) {
    const a       = lon2a(houses[i], ascDeg);
    const angular = i % 3 === 0;
    const midA    = lon2a(houses[i] + norm360(houses[(i + 1) % 12] - houses[i]) / 2, ascDeg);
    const nR      = (rZ2 + rH2) / 2;

    ctx.strokeStyle = angular ? 'rgba(80,55,15,0.75)' : 'rgba(100,75,30,0.35)';
    ctx.lineWidth   = angular ? 1.2 : 0.6;
    ctx.beginPath();
    ctx.moveTo(...pt(rCt, a, cx, cy));
    ctx.lineTo(...pt(rZ2, a, cx, cy));
    ctx.stroke();

    ctx.fillStyle    = 'rgba(100,75,25,0.80)';
    ctx.font         = fHouse;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(i + 1, ...pt(nR, midA, cx, cy));
  }

  for (const asp of aspects) {
    const a1 = lon2a(positions[asp.p1], ascDeg);
    const a2 = lon2a(positions[asp.p2], ascDeg);
    ctx.strokeStyle = asp.asp.color + '88';
    ctx.lineWidth   = 1;
    ctx.beginPath();
    ctx.moveTo(...pt(rCt, a1, cx, cy));
    ctx.lineTo(...pt(rCt, a2, cx, cy));
    ctx.stroke();
  }

  // ── Fase da Lua no centro ─────────────────────────────────────
  drawMoonPhase(cx, cy, R * 0.075, positions.moon - positions.sun, !!(currentLoc && currentLoc.lat < 0));

  const placed = PLANETS.map(p => ({ p, angle: lon2a(positions[p.id], ascDeg) }));
  const minGap = toRad(Math.max(10, R * 0.065));

  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < placed.length; i++) {
      for (let j = i + 1; j < placed.length; j++) {
        let da = placed[j].angle - placed[i].angle;
        while (da >  Math.PI) da -= Math.PI * 2;
        while (da < -Math.PI) da += Math.PI * 2;
        if (Math.abs(da) < minGap) {
          const push = (minGap - Math.abs(da)) / 2 * Math.sign(da);
          placed[i].angle -= push;
          placed[j].angle += push;
        }
      }
    }
  }

  for (let i = 0; i < PLANETS.length; i++) {
    const p      = PLANETS[i];
    const aOrig  = lon2a(positions[p.id], ascDeg);
    const aMoved = placed[i].angle;

    ctx.strokeStyle = p.color + '70';
    ctx.lineWidth   = 0.7;
    ctx.beginPath();
    ctx.moveTo(...pt(rH2, aOrig,  cx, cy));
    ctx.lineTo(...pt(R*0.46, aMoved, cx, cy));
    ctx.stroke();

    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(...pt(rH2, aOrig, cx, cy), Math.max(2.5, R*0.018), 0, Math.PI*2);
    ctx.fill();

    ctx.fillStyle    = p.color;
    ctx.font         = fPlanet;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(p.sym, ...pt(rP, aMoved, cx, cy));

    // Rx acima do símbolo para planetas retrógrados
    if (retrogrades && retrogrades[p.id]) {
      ctx.fillStyle = p.color + 'cc';
      ctx.font      = `${Math.max(8, R*0.07)}px sans-serif`;
      const [px, py] = pt(rP, aMoved, cx, cy);
      ctx.fillText('℞', px, py - R*0.10);
    }

    const { deg } = signOf(positions[p.id]);
    ctx.fillStyle    = p.color + 'bb';
    ctx.font         = fDeg;
    ctx.textBaseline = 'middle';
    ctx.fillText(Math.floor(deg) + '°', ...pt(rP - R*0.085, aMoved, cx, cy));
  }

  const mcDeg = houses[9];  // Meio do Céu (cúspide 10)
  const fcDeg = houses[3];  // Fundo do Céu (cúspide 4)

  const angles = [
    { label: 'AC', lon: ascDeg,       strong: true  },
    { label: 'DC', lon: ascDeg + 180, strong: false },
    { label: 'MC', lon: mcDeg,        strong: true  },
    { label: 'FC', lon: fcDeg,        strong: false },
  ];

  const rLbl = rZ2 - R * 0.04;
  ctx.font         = fLabel;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';

  for (const { label, lon, strong } of angles) {
    const a = lon2a(lon, ascDeg);
    ctx.fillStyle = strong ? 'rgba(70,45,10,0.92)' : 'rgba(70,45,10,0.55)';
    ctx.fillText(label, ...pt(rLbl, a, cx, cy));
  }
}

// ═══════════════════════════════════════════════════════════════
//  PAINEL LATERAL
// ═══════════════════════════════════════════════════════════════

function resizeAspectGrid() {
  // grid com tamanho fixo de 30px definido no CSS — sem cálculo dinâmico necessário
}

function updateSidePanel(positions, aspects, retrogrades) {
  const list = document.getElementById('planet-list');
  list.innerHTML = '';
  for (const p of PLANETS) {
    const { idx, deg } = signOf(positions[p.id]);
    const rx = retrogrades && retrogrades[p.id];
    const row = document.createElement('div');
    row.className = 'p-row';
    row.innerHTML =
      `<span class="p-sym" style="color:${p.color}">${p.sym}</span>` +
      `<span class="p-info">
         <span class="p-name">${p.name}${rx ? ' <span class="p-rx">Rx</span>' : ''}</span>
         <span class="p-sign"><span style="color:${SIGNS[idx].color}">${SIGNS[idx].sym}</span> ${SIGNS[idx].name}</span>
       </span>` +
      `<span class="p-deg">${Math.floor(deg).toString().padStart(2,'0')}°${Math.floor((deg%1)*60).toString().padStart(2,'0')}'</span>`;
    list.appendChild(row);
  }

  const grid = document.getElementById('aspect-grid');
  grid.innerHTML = '';

  const n = PLANETS.length;

  const lookup = {};
  for (const a of aspects) {
    lookup[a.p1 + ',' + a.p2] = a.asp;
    lookup[a.p2 + ',' + a.p1] = a.asp;
  }

  const headerRow = document.createElement('div');
  headerRow.className = 'ag-row';
  headerRow.appendChild(Object.assign(document.createElement('div'), { className: 'ag-head' }));
  for (let j = 0; j < n - 1; j++) {
    const cell = document.createElement('div');
    cell.className = 'ag-head';
    cell.style.color = PLANETS[j].color;
    cell.textContent = PLANETS[j].sym;
    headerRow.appendChild(cell);
  }
  grid.appendChild(headerRow);

  for (let i = 1; i < n; i++) {
    const row = document.createElement('div');
    row.className = 'ag-row';

    const lbl = document.createElement('div');
    lbl.className = 'ag-head';
    lbl.style.color = PLANETS[i].color;
    lbl.textContent = PLANETS[i].sym;
    row.appendChild(lbl);

    for (let j = 0; j < n - 1; j++) {
      const cell = document.createElement('div');
      cell.className = 'ag-cell';
      if (j >= i) {
        cell.classList.add('ag-empty');
      } else {
        const asp = lookup[PLANETS[j].id + ',' + PLANETS[i].id];
        if (asp) {
          cell.textContent = asp.sym;
          cell.style.color = asp.color;
          cell.title       = `${PLANETS[j].name} ${asp.name} ${PLANETS[i].name}`;
        }
      }
      row.appendChild(cell);
    }
    grid.appendChild(row);
  }
}

// ═══════════════════════════════════════════════════════════════
//  RELÓGIO
// ═══════════════════════════════════════════════════════════════

function updateClock() {
  const n = new Date();
  document.getElementById('clock').textContent =
    String(n.getHours()).padStart(2,'0') + ':' +
    String(n.getMinutes()).padStart(2,'0') + ':' +
    String(n.getSeconds()).padStart(2,'0');
}

// ═══════════════════════════════════════════════════════════════
//  LOCALIZAÇÃO
// ═══════════════════════════════════════════════════════════════

function loadLocation() {
  try { return JSON.parse(localStorage.getItem('astra_location')); } catch(_) { return null; }
}
function saveLocation(loc) { localStorage.setItem('astra_location', JSON.stringify(loc)); }

// Informa a cidade ao widget nativo do Android (sem efeito fora do app Android)
function syncWidgetLocation(loc) {
  try {
    const cap = window.Capacitor;
    if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return;
    const bridge = (cap.Plugins && cap.Plugins.WidgetBridge) || cap.registerPlugin('WidgetBridge');
    bridge.setLocation({ lat: loc.lat, lon: loc.lon, name: loc.name || '' }).catch(() => {});
  } catch (_) {}
}

// ═══════════════════════════════════════════════════════════════
//  CICLO PRINCIPAL
// ═══════════════════════════════════════════════════════════════

let lastState = null;

// Modo eletivo: null = tempo real, Date = data fixa
let electiveDate = null;

function safeRender(positions, ascDeg, houses, aspects, retrogrades) {
  try {
    resize();
    if (canvas.width > 20 && canvas.height > 20) {
      drawChart(positions, ascDeg, houses, aspects, retrogrades);
    }
  } catch(err) {
    console.error('render:', err);
  }
}

function redraw() {
  if (!lastState) return;
  safeRender(lastState.positions, lastState.ascDeg, lastState.houses, lastState.aspects, lastState.retrogrades);
}

function updateElectiveBadge() {
  const badge = document.getElementById('elective-badge');
  if (!badge) return;
  if (electiveDate) {
    const d = electiveDate;
    const pad = n => String(n).padStart(2,'0');
    badge.textContent =
      `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ` +
      `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

function tick(loc) {
  let positions, ascDeg, houses, aspects, retrogrades;
  try {
    const date = electiveDate || new Date();
    positions   = calcPlanets(date);
    houses      = calcHouses(date, loc.lat, loc.lon);
    ascDeg      = houses[0];
    aspects     = calcAspects(positions);
    retrogrades = calcRetrogrades(date);
  } catch(err) {
    console.error('calc:', err);
    return;
  }

  lastState = { positions, ascDeg, houses, aspects, retrogrades };
  safeRender(positions, ascDeg, houses, aspects, retrogrades);

  try {
    updateSidePanel(positions, aspects, retrogrades);
    resizeAspectGrid();
  } catch(err) {
    console.error('panel:', err);
  }

  updateElectiveBadge();
}

function setElectiveDate(date) {
  electiveDate = date;
  if (calcInterval) { clearInterval(calcInterval); calcInterval = null; }
  if (!electiveDate && currentLoc) {
    calcInterval = setInterval(() => tick(currentLoc), 10000);
  }
  if (currentLoc) tick(currentLoc);
}

function nudgeDate(ms) {
  const base = electiveDate || new Date();
  setElectiveDate(new Date(base.getTime() + ms));
  syncDatetimeInput();
}

function syncDatetimeInput() {
  const inp = document.getElementById('elective-input');
  if (!inp) return;
  const d = electiveDate || new Date();
  const pad = n => String(n).padStart(2,'0');
  inp.value =
    `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// ═══════════════════════════════════════════════════════════════
//  SELETOR DE CIDADES
// ═══════════════════════════════════════════════════════════════

let currentLoc   = null;
let calcInterval = null;
let cityOpen     = false;

function startTicking(loc) {
  currentLoc = loc;
  syncWidgetLocation(loc);
  document.getElementById('city-label').textContent = loc.name;
  if (calcInterval) clearInterval(calcInterval);
  tick(loc);
  if (!electiveDate) {
    calcInterval = setInterval(() => tick(loc), 10000);
  }
}

let searchTimer = null;

function renderCityResults(cities) {
  const list   = document.getElementById('city-list');
  const status = document.getElementById('city-search-status');
  list.innerHTML = '';
  if (cities.length === 0) {
    status.textContent = 'Nenhuma cidade encontrada.';
    return;
  }
  status.textContent = '';
  for (const c of cities) {
    const item = document.createElement('div');
    item.className = 'city-item' + (currentLoc && currentLoc.name === c.name ? ' active' : '');
    item.innerHTML = `<span>${c.name}</span><span class="city-state">${c.state}</span>`;
    item.addEventListener('click', async () => {
      if (c.lat != null) {
        saveLocation(c); startTicking(c); closeCityPanel();
      } else {
        status.textContent = 'Buscando coordenadas...';
        try {
          const coords = await getCityCoords(c.name, c.state);
          const loc = { ...c, ...coords };
          saveLocation(loc); startTicking(loc); closeCityPanel();
        } catch(_) {
          status.textContent = 'Erro ao buscar coordenadas.';
        }
      }
    });
    list.appendChild(item);
  }
}

function openCityPanel() {
  document.getElementById('city-panel').classList.remove('hidden');
  const input = document.getElementById('city-search');
  input.value = '';
  document.getElementById('city-search-status').textContent = '';
  renderCityResults(CIDADES_BR);
  cityOpen = true;
  setTimeout(() => input.focus(), 50);
}

function closeCityPanel() {
  document.getElementById('city-panel').classList.add('hidden');
  cityOpen = false;
}

document.getElementById('city-search').addEventListener('input', (e) => {
  const q = e.target.value.trim();
  const status = document.getElementById('city-search-status');
  clearTimeout(searchTimer);

  if (q.length === 0) {
    renderCityResults(CIDADES_BR);
    return;
  }
  if (q.length < 2) return;

  const local = CIDADES_BR.filter(c =>
    c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .startsWith(q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,''))
  );
  if (local.length > 0) renderCityResults(local);

  status.textContent = 'Buscando...';
  searchTimer = setTimeout(async () => {
    try {
      const results = await searchCities(q);
      renderCityResults(results);
      status.textContent = results.length > 0 ? '' : 'Nenhuma cidade encontrada.';
    } catch(_) {
      status.textContent = '';
      if (local.length === 0) renderCityResults([]);
    }
  }, 400);
});

// ═══════════════════════════════════════════════════════════════
//  EVENTOS E INIT
// ═══════════════════════════════════════════════════════════════

document.getElementById('btn-city').addEventListener('click', () => {
  cityOpen ? closeCityPanel() : openCityPanel();
});

document.getElementById('btn-hub')?.addEventListener('click', () => {
  window.location.href = '../index.html';
});

// ── Controles Eletivos ──────────────────────────────────────────────────────

document.getElementById('btn-time-toggle').addEventListener('click', () => {
  const panel = document.getElementById('elective-panel');
  panel.classList.toggle('hidden');
  if (!panel.classList.contains('hidden')) syncDatetimeInput();
});

document.getElementById('elective-input').addEventListener('change', (e) => {
  const val = e.target.value;
  if (!val) return;
  setElectiveDate(new Date(val));
});

document.getElementById('btn-now').addEventListener('click', () => {
  setElectiveDate(null);
  syncDatetimeInput();
});

const NUDGES = {
  'btn-prev-h':  -3600000,
  'btn-next-h':   3600000,
  'btn-prev-d':  -86400000,
  'btn-next-d':   86400000,
  'btn-prev-m':  -2592000000,
  'btn-next-m':   2592000000,
};
for (const [id, ms] of Object.entries(NUDGES)) {
  const btn = document.getElementById(id);
  if (btn) btn.addEventListener('click', () => nudgeDate(ms));
}

// ── Tabs (portrait) ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('#side > div').forEach(d => d.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

let resizeTimer = null;
const ro = new ResizeObserver(() => {
  if (resizeTimer) return;
  resizeTimer = requestAnimationFrame(() => {
    resizeTimer = null;
    redraw();
  });
});
ro.observe(document.getElementById('canvas-wrap'));

// Redesenha ao rotacionar a tela
window.addEventListener('orientationchange', () => {
  setTimeout(() => { redraw(); }, 300);
});

setInterval(updateClock, 1000);
updateClock();

(async function init() {
  const saved = loadLocation();
  if (saved) { startTicking(saved); return; }

  // Localização padrão enquanto detecta
  startTicking(CIDADES_BR.find(c => c.name === 'São Paulo'));

  try {
    const det = await detectLocation();
    let best = CIDADES_BR[0], bestDist = Infinity;
    for (const c of CIDADES_BR) {
      const d = Math.hypot(c.lat - det.lat, c.lon - det.lon);
      if (d < bestDist) { bestDist = d; best = c; }
    }
    saveLocation(best);
    startTicking(best);
  } catch(_) {
    // Sem permissão ou sem GPS — mantém São Paulo, abre seletor
    openCityPanel();
  }
})();
