'use strict';

// ═══════════════════════════════════════════════════════════════════════════════
// DADOS
// ═══════════════════════════════════════════════════════════════════════════════

const FIGURAS = [
  { nome: 'Populus',       bits: 0b0000 },
  { nome: 'Via',           bits: 0b1111 },
  { nome: 'Albus',         bits: 0b0010 },
  { nome: 'Conjunctio',    bits: 0b0110 },
  { nome: 'Puella',        bits: 0b1011 },
  { nome: 'Amissio',       bits: 0b1010 },
  { nome: 'Fortuna Major', bits: 0b0011 },
  { nome: 'Fortuna Minor', bits: 0b1100 },
  { nome: 'Puer',          bits: 0b1101 },
  { nome: 'Rubeus',        bits: 0b0100 },
  { nome: 'Acquisitio',    bits: 0b0101 },
  { nome: 'Laetitia',      bits: 0b1000 },
  { nome: 'Tristitia',     bits: 0b0001 },
  { nome: 'Carcer',        bits: 0b1001 },
  { nome: 'Caput Draconis',bits: 0b0111 },
  { nome: 'Cauda Draconis',bits: 0b1110 },
];

const BITS_TO_NOME = {};
FIGURAS.forEach(f => BITS_TO_NOME[f.bits] = f.nome);
function fname(b) { return BITS_TO_NOME[b] || '???'; }

const PLANETAS = [
  { nome: 'Sol',     sym: '☉' },
  { nome: 'Lua',    sym: '☽' },
  { nome: 'Marte',    sym: '♂' },
  { nome: 'Mercúrio', sym: '☿' },
  { nome: 'Júpiter', sym: '♃' },
  { nome: 'Vênus',   sym: '♀' },
  { nome: 'Saturno',  sym: '♄' },
];

const CASAS_TEMAS = [
  'Vida','Riqueza','Irmãos','Lar','Filhos','Saúde',
  'Cônjuge','Morte','Viagens','Carreira','Amizades','Restrições'
];

const SIGNOS = ['♈','♉','♊','♋','♌','♍','♎','♏','♐','♑','♒','♓'];

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  bg:     '#e4dece',
  bg2:    '#d4caba',
  gold:   '#8a6a1a',
  goldL:  '#c4a050',
  silver: '#1a1820',
  silvD:  '#555060',
  border: 'rgba(80,60,20,0.8)',
};

// ═══════════════════════════════════════════════════════════════════════════════
// CÁLCULO GEOMÂNTICO
// ═══════════════════════════════════════════════════════════════════════════════

function transposeRow(maes, row) {
  let bits = 0;
  for (let i = 0; i < 4; i++) {
    const bit = (maes[i] >> (3 - row)) & 1;
    bits |= (bit << (3 - i));
  }
  return bits;
}

function calcular(maes) {
  // Filhas — transposição de linhas das Mães
  const filhas = [0,1,2,3].map(r => transposeRow(maes, r));

  // Sobrinhas — XOR par a par
  const sobrinhas = [
    maes[0]   ^ maes[1],    // N1: M1 XOR M2
    maes[2]   ^ maes[3],    // N2: M3 XOR M4
    filhas[0] ^ filhas[1],  // N3: D1 XOR D2
    filhas[2] ^ filhas[3],  // N4: D3 XOR D4
  ];

  // Testemunhas
  const t1   = sobrinhas[0] ^ sobrinhas[1];  // W1: N1 XOR N2
  const t2   = sobrinhas[2] ^ sobrinhas[3];  // W2: N3 XOR N4

  // Juiz
  const juiz = t1 ^ t2;

  // Houses: H1=M2, H2=D2, H3=N2, H4=M3, H5=D3, H6=N3,
  //         H7=M4, H8=D4, H9=N4, H10=M1, H11=D1, H12=N1
  const casas = [
    maes[1],      // H1
    filhas[1],    // H2
    sobrinhas[1], // H3
    maes[2],      // H4
    filhas[2],    // H5
    sobrinhas[2], // H6
    maes[3],      // H7
    filhas[3],    // H8
    sobrinhas[3], // H9
    maes[0],      // H10
    filhas[0],    // H11
    sobrinhas[0], // H12
  ];

  return { maes, filhas, sobrinhas, t1, t2, juiz, casas };
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESENHO — helpers
// ═══════════════════════════════════════════════════════════════════════════════

function drawDots(ctx, bits, cx, cy, dotR = 3, lineH = 10) {
  ctx.fillStyle = C.silver;
  for (let row = 0; row < 4; row++) {
    const val   = (bits >> (3 - row)) & 1;
    const ndots = val ? 1 : 2;
    const y     = cy + row * lineH;
    if (ndots === 1) {
      ctx.beginPath();
      ctx.arc(cx, y, dotR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      [-dotR * 2 - 1, dotR * 2 + 1].forEach(dx => {
        ctx.beginPath();
        ctx.arc(cx + dx, y, dotR, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }
}

function drawCell(ctx, bits, x, y, w, h, label) {
  ctx.fillStyle   = C.bg;
  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 2;
  ctx.fillRect(x, y, w, h);
  ctx.strokeRect(x, y, w, h);

  // Label (Mãe 1, Filha 2 etc.) — no topo
  if (label) {
    ctx.fillStyle = C.gold;
    ctx.font      = '12px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + 14);
  }

  // Pontos: 4 linhas × lineH=11, altura total ≈ 33px — centralizado na célula abaixo do label
  const dotsH  = 3 * 11; // (rows-1) × lineH
  const dotsY0 = y + 20 + (h - 20 - dotsH) / 2;
  drawDots(ctx, bits, x + w / 2, dotsY0, 4, 11);
}

function bezierPts(p0, p1, p2, p3, steps = 60) {
  const pts = [];
  for (let i = 0; i <= steps; i++) {
    const t  = i / steps;
    const mt = 1 - t;
    pts.push([
      mt**3*p0[0] + 3*mt**2*t*p1[0] + 3*mt*t**2*p2[0] + t**3*p3[0],
      mt**3*p0[1] + 3*mt**2*t*p1[1] + 3*mt*t**2*p2[1] + t**3*p3[1],
    ]);
  }
  return pts;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESENHO — BRAZÃO (brasao_v7)
// ═══════════════════════════════════════════════════════════════════════════════

function drawBrasao(canvas, resultado, planetaSel, scale = 1, semTitulo = false) {
  const SX = 40, SY = semTitulo ? 8 : 62, SW = 560;
  const CH1 = 120, CH2 = 100, CH3 = 100;
  const STRAIGHT_H = CH1 + CH2 + CH3;
  const POINT_H    = 100;
  const tipX = SX + SW / 2;
  const tipY = SY + STRAIGHT_H + POINT_H;

  const W = SW + SX * 2;
  const H = tipY + 30;
  canvas.width  = W * scale;
  canvas.height = H * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, W, H);

  // ── Title ────────────────────────────────────────────────────────────────────
  if (!semTitulo) {
    ctx.fillStyle  = C.gold;
    ctx.font       = 'bold 20px Georgia';
    ctx.textAlign  = 'center';
    ctx.fillText('BRAZÃO GEOMÂNTICO', W / 2, 26);

    if (planetaSel !== null) {
      const p = PLANETAS[planetaSel];
      ctx.font      = '15px Georgia';
      ctx.fillStyle = C.silvD;
      ctx.fillText(`Planeta da questão: ${p.sym} ${p.nome}`, W / 2, 46);
    }

    ctx.fillStyle = C.border;
    ctx.fillRect(20, 54, W - 40, 1);
  }

  // ── Shield ───────────────────────────────────────────────────────────────────
  const botLeft  = [SX,      SY + STRAIGHT_H];
  const botRight = [SX + SW, SY + STRAIGHT_H];
  const tip      = [tipX,    tipY];

  const leftCurve  = bezierPts(botLeft,  [SX,      SY+STRAIGHT_H+60], [tipX-140, tipY-30], tip);
  const rightCurve = bezierPts(botRight, [SX+SW,   SY+STRAIGHT_H+60], [tipX+140, tipY-30], tip);

  // Fill shield
  ctx.beginPath();
  ctx.moveTo(SX, SY);
  ctx.lineTo(SX + SW, SY);
  ctx.lineTo(SX + SW, SY + STRAIGHT_H);
  rightCurve.forEach(([x,y]) => ctx.lineTo(x, y));
  leftCurve.slice().reverse().forEach(([x,y]) => ctx.lineTo(x, y));
  ctx.lineTo(SX, SY + STRAIGHT_H);
  ctx.closePath();
  ctx.fillStyle = C.bg;
  ctx.fill();

  // Border
  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 3;
  ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(SX+SW, SY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SX, SY); ctx.lineTo(SX, SY+STRAIGHT_H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(SX+SW, SY); ctx.lineTo(SX+SW, SY+STRAIGHT_H); ctx.stroke();

  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(botLeft[0], botLeft[1]);
  leftCurve.forEach(([x,y]) => ctx.lineTo(x, y));
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(botRight[0], botRight[1]);
  rightCurve.forEach(([x,y]) => ctx.lineTo(x, y));
  ctx.stroke();

  // ── Linhas internas ──────────────────────────────────────────────────────────
  const CW = SW / 8;
  const Y1 = SY, Y2 = SY+CH1, Y3 = SY+CH1+CH2;

  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 2;

  // Horizontais
  [[SX,Y2],[SX,Y3]].forEach(([x,y]) => {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x+SW, y); ctx.stroke();
  });

  // Verticais linha 1 (8 colunas)
  for (let col = 1; col < 8; col++) {
    ctx.lineWidth = col === 4 ? 3 : 2;
    ctx.beginPath();
    ctx.moveTo(SX + col*CW, Y1);
    ctx.lineTo(SX + col*CW, Y2);
    ctx.stroke();
  }

  // Verticais linha 2 (4 colunas)
  ctx.lineWidth = 2;
  for (let col = 1; col < 4; col++) {
    ctx.beginPath();
    ctx.moveTo(SX + col*CW*2, Y2);
    ctx.lineTo(SX + col*CW*2, Y3);
    ctx.stroke();
  }

  // Vertical linha 3 (2 colunas)
  ctx.beginPath();
  ctx.moveTo(SX + SW/2, Y3);
  ctx.lineTo(SX + SW/2, SY + STRAIGHT_H);
  ctx.stroke();

  // ── Conteúdo ─────────────────────────────────────────────────────────────────
  const { maes, filhas, sobrinhas, t1, t2, juiz } = resultado;

  // Linha 1: D4 D3 D2 D1 | M4 M3 M2 M1
  const row1 = [
    [filhas[3],'Filha 4'], [filhas[2],'Filha 3'],
    [filhas[1],'Filha 2'], [filhas[0],'Filha 1'],
    [maes[3],  'Mãe 4'],   [maes[2],  'Mãe 3'],
    [maes[1],  'Mãe 2'],   [maes[0],  'Mãe 1'],
  ];
  row1.forEach(([bits,lbl], i) => {
    drawCell(ctx, bits, SX + i*CW, Y1, CW, CH1, lbl);
  });

  // Linha 2: N4 N3 N2 N1
  const row2 = [
    [sobrinhas[3],'Sobrinha 4'], [sobrinhas[2],'Sobrinha 3'],
    [sobrinhas[1],'Sobrinha 2'], [sobrinhas[0],'Sobrinha 1'],
  ];
  row2.forEach(([bits,lbl], i) => {
    drawCell(ctx, bits, SX + i*CW*2, Y2, CW*2, CH2, lbl);
  });

  // Linha 3: T2 | T1
  drawCell(ctx, t2, SX,       Y3, SW/2, CH3, 'Testemunha 2');
  drawCell(ctx, t1, SX+SW/2,  Y3, SW/2, CH3, 'Testemunha 1');

  // Juiz — sem caixa, na ponta
  const jcy = SY + STRAIGHT_H + 18;
  ctx.fillStyle = C.gold;
  ctx.font      = '13px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('Juiz', tipX, jcy);
  ctx.fillStyle = C.silver;
  ctx.font      = 'bold 16px Georgia';
  ctx.fillText(fname(juiz), tipX, jcy + 18);
  drawDots(ctx, juiz, tipX, jcy + 34, 4, 12);
}

// ═══════════════════════════════════════════════════════════════════════════════
// DESENHO — MAPA DAS CASAS (casas_v4)
// ═══════════════════════════════════════════════════════════════════════════════

function drawCasas(canvas, resultado, planetaSel, scale = 1, semTitulo = false) {
  const OX = 45, OY = semTitulo ? 8 : 62, S = 540;
  const W = S + OX * 2;
  const H = S + OY + 30;
  canvas.width  = W * scale;
  canvas.height = H * scale;

  const ctx = canvas.getContext('2d');
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, W, H);

  // Title
  if (!semTitulo) {
    ctx.fillStyle = C.gold;
    ctx.font      = 'bold 20px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText('MAPA GEOMÂNTICO', W/2, 26);

    if (planetaSel !== null) {
      const p = PLANETAS[planetaSel];
      ctx.font      = '15px Georgia';
      ctx.fillStyle = C.silvD;
      ctx.fillText(`Planeta da questão: ${p.sym} ${p.nome}`, W/2, 46);
    }

    ctx.fillStyle = C.border;
    ctx.fillRect(20, 54, W-40, 1);
  }

  // Pontos do grid
  const TL = [OX,     OY],       TR = [OX+S,   OY];
  const BL = [OX,     OY+S],     BR = [OX+S,   OY+S];
  const ML = [OX,     OY+S/2],   MT = [OX+S/2, OY];
  const MR = [OX+S,   OY+S/2],   MB = [OX+S/2, OY+S];

  // Cruzamentos das diagonais com o losango
  const X_NW = [OX+S/4,   OY+S/4];
  const X_NE = [OX+3*S/4, OY+S/4];
  const X_SW = [OX+S/4,   OY+3*S/4];
  const X_SE = [OX+3*S/4, OY+3*S/4];

  // Fill geral
  ctx.fillStyle = C.bg;
  ctx.fillRect(OX, OY, S, S);

  // Linhas
  ctx.strokeStyle = C.border;
  ctx.lineWidth   = 2;

  const lines = [
    [TL,TR],[TR,BR],[BR,BL],[BL,TL], // outer square
    [ML,MT],[MT,MR],[MR,MB],[MB,ML], // diamond
    [TL,BR],[TR,BL],                 // diagonals (X)
  ];
  lines.forEach(([a,b]) => {
    ctx.beginPath();
    ctx.moveTo(a[0],a[1]);
    ctx.lineTo(b[0],b[1]);
    ctx.stroke();
  });

  // ── Centros das casas ─────────────────────────────────────────────────────────
  const CX = OX + S/2, CY = OY + S/2;

  function tc(pts) {
    return [
      pts.reduce((s,p) => s+p[0], 0) / pts.length,
      pts.reduce((s,p) => s+p[1], 0) / pts.length,
    ];
  }

  function triCenter(a, b, c, dy) {
    const x = (a[0]+b[0]+c[0]) / 3;
    const y = (a[1]+b[1]+c[1]) / 3 + (dy || 0);
    return [x, y];
  }

  const centers = {
    1:  [(ML[0]+CX)/2,    CY],
    4:  [CX,              (MB[1]+CY)/2],
    7:  [(MR[0]+CX)/2,    CY],
    10: [CX,              (MT[1]+CY)/2],
    2:  triCenter(BL, ML, X_SW, -10),
    3:  triCenter(BL, MB, X_SW, -18),
    5:  triCenter(BR, MB, X_SE, -18),
    6:  triCenter(BR, MR, X_SE, -10),
    8:  triCenter(TR, MR, X_NE,  10),
    9:  triCenter(TR, MT, X_NE,  18),
    11: triCenter(TL, MT, X_NW,  18),
    12: triCenter(TL, ML, X_NW,  10),
  };

  // ── Desenha cada casa ─────────────────────────────────────────────────────────
  const { casas } = resultado;
  const casaType = {
    1:'side', 4:'vert', 7:'side', 10:'vert',
    2:'side', 3:'vert', 5:'vert', 6:'side',
    8:'side', 9:'vert', 11:'vert', 12:'side',
  };

  Object.entries(centers).forEach(([hnum, [hx, hy]]) => {
    const i     = parseInt(hnum) - 1;
    const bits  = casas[i];
    const signo = SIGNOS[i];
    const maxW  = S / 4 - 20;

    // Número
    ctx.fillStyle = C.gold;
    ctx.font      = 'bold 14px Georgia';
    ctx.textAlign = 'center';
    ctx.fillText(hnum, hx - 10, hy - 20);

    // Signo
    ctx.font      = '13px serif';
    ctx.fillStyle = C.silvD;
    ctx.fillText(signo, hx + 10, hy - 20);

    // Nome — truncar se necessário
    ctx.font      = 'bold 12px Georgia';
    ctx.fillStyle = C.silver;
    let nome = fname(bits);
    while (ctx.measureText(nome).width > maxW && nome.length > 4) {
      nome = nome.slice(0, -1);
    }
    if (nome !== fname(bits)) nome += '…';
    ctx.fillText(nome, hx, hy - 5);

    // Pontos — tamanho uniforme para todas as casas
    drawDots(ctx, bits, hx, hy + 9, 3, 11);
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PDF
// ═══════════════════════════════════════════════════════════════════════════════

async function exportarPDF(resultado, planetaSel) {
  // Dimensões A4 landscape a 150dpi (alta resolução)
  const A4W = 1754, A4H = 1240; // 297mm × 210mm @ 150dpi
  const PAD = 40;
  const HDR = 60; // header height

  // Gera os dois canvas em escala 1 para medir proporções
  const cBrasao = document.createElement('canvas');
  const cCasas  = document.createElement('canvas');
  drawBrasao(cBrasao, resultado, planetaSel, 1, true);
  drawCasas(cCasas,  resultado, planetaSel, 1, true);

  const BW = cBrasao.width,  BH = cBrasao.height;
  const CW = cCasas.width,   CH = cCasas.height;

  // Área disponível para os dois mapas lado a lado
  const areaW = A4W - PAD * 3;
  const areaH = A4H - HDR - PAD * 2;

  // Escala para cada mapa caber na metade da largura e na altura disponível
  const halfW  = (areaW - PAD) / 2;
  const scaleB = Math.min(halfW / BW, areaH / BH);
  const scaleC = Math.min(halfW / CW, areaH / CH);

  const dBW = BW * scaleB, dBH = BH * scaleB;
  const dCW = CW * scaleC, dCH = CH * scaleC;

  // Canvas de saída A4
  const out = document.createElement('canvas');
  out.width  = A4W;
  out.height = A4H;
  const ctx  = out.getContext('2d');

  // Fundo
  ctx.fillStyle = '#f0ece4';
  ctx.fillRect(0, 0, A4W, A4H);

  // Cabeçalho
  const now     = new Date();
  const data    = now.toLocaleDateString('pt-BR');
  const hora    = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const planeta = planetaSel !== null ? `${PLANETAS[planetaSel].sym} ${PLANETAS[planetaSel].nome}` : '—';

  ctx.fillStyle = C.gold;
  ctx.font      = 'bold 30px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText('✦ GEOMANTIA HERMETICA', A4W / 2, 34);
  ctx.font      = '20px Georgia';
  ctx.fillStyle = C.silvD;
  let subTxt = `Data: ${data}  ·  Hora: ${hora}  ·  Planeta: ${planeta}`;
  ctx.fillText(subTxt, A4W / 2, 56);

  // Linha separadora
  ctx.fillStyle = C.border;
  ctx.fillRect(PAD, HDR - 4, A4W - PAD * 2, 2);

  // Brasão — coluna esquerda, centralizado verticalmente
  const xB = PAD;
  const yB = HDR + PAD + (areaH - dBH) / 2;
  ctx.drawImage(cBrasao, xB, yB, dBW, dBH);

  // Mapa — coluna direita, centralizado verticalmente
  const xC = PAD + halfW + PAD;
  const yC = HDR + PAD + (areaH - dCH) / 2;
  ctx.drawImage(cCasas, xC, yC, dCW, dCH);

  const imgData = out.toDataURL('image/png');

  // Tabelas em HTML simples abaixo da imagem
  const { maes, filhas, sobrinhas, t1, t2, juiz, casas } = resultado;

  const mkRow  = (label, bits, cls='') =>
    `<tr class="${cls}"><td>${label}</td><td>${fname(bits)}</td></tr>`;

  const figHTML = [
    ...maes.map((b,i)      => mkRow(`Mãe ${i+1}`, b)),
    ...filhas.map((b,i)    => mkRow(`Filha ${i+1}`, b)),
    ...sobrinhas.map((b,i) => mkRow(`Sobrinha ${i+1}`, b)),
    mkRow('Testemunha 1', t1),
    mkRow('Testemunha 2', t2),
    mkRow('Juiz', juiz, 'juiz'),
  ].join('');

  const casHTML = casas.map((bits, i) =>
    `<tr><td>Casa ${i+1}</td><td>${SIGNOS[i]} ${fname(bits)}</td></tr>`
  ).join('');

  const win = window.open('', '_blank');
  win.document.write(`<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>Geomantia Hermetica</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0ece4; font-family: Georgia, serif; color: #1a1820; }
  .pg1 { width: 100%; }
  .pg1 img { display: block; width: 100%; height: auto; }
  .pg2 { padding: 12mm; }
  .tables { display: flex; gap: 30px; }
  .tables > div { flex: 1; }
  h2 { color: #8a6a1a; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;
       border-bottom: 1px solid #c4a050; padding-bottom: 3px; margin-bottom: 6px; }
  table { border-collapse: collapse; font-size: 13px; width: 100%; }
  td { padding: 4px 8px; border-bottom: 1px solid rgba(120,95,40,0.12); }
  td:first-child { color: #555060; white-space: nowrap; width: 44%; }
  td:last-child  { font-weight: bold; }
  tr.juiz td { color: #8a6a1a; font-size: 14px; }
  @media print {
    body { background: white; }
    @page { size: A4 landscape; margin: 0; }
    .pg2 { break-before: page; padding: 12mm; }
  }
</style>
</head>
<body>
<div class="pg1"><img src="${imgData}" /></div>
<div class="pg2">
  <div class="tables">
    <div><h2>Figuras</h2><table>${figHTML}</table></div>
    <div><h2>Casas</h2><table>${casHTML}</table></div>
  </div>
</div>
<script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`);
  win.document.close();
}

// ═══════════════════════════════════════════════════════════════════════════════
// UI
// ═══════════════════════════════════════════════════════════════════════════════

let estadoAtual   = null;
let planetaSel    = null;
let tabAtiva      = 'brasao';

// ── Estado das linhas das Mães ────────────────────────────────────────────────
// linhas[mother][row]: 1 = ímpar (1 ponto), 0 = par (2 pontos)
// Padrão: 0 (2 pontos, par) — cada clique alterna
const linhas = [
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
  [0, 0, 0, 0],
];

// Mapeamento de linhas para bits da figura: Fogo=bit3, Ar=bit2, Água=bit1, Terra=bit0
// linha 0 = Fogo (bit 3), linha 1 = Ar (bit 2), linha 2 = Água (bit 1), linha 3 = Terra (bit 0)
function calcMaeBits(maeIdx) {
  const l = linhas[maeIdx];
  return (l[0] << 3) | (l[1] << 2) | (l[2] << 1) | l[3];
}

function atualizarLinhaDots(maeIdx, linhaIdx) {
  const val = linhas[maeIdx][linhaIdx];
  const container = document.querySelector(`.linha-dots[data-mae="${maeIdx}"][data-linha="${linhaIdx}"]`);
  if (!container) return;
  const display = container.querySelector('.dot-display');
  if (val === 1) {
    display.textContent = '●';
    container.classList.add('active-odd');
    container.classList.remove('active-even');
  } else {
    display.textContent = '●●';
    container.classList.add('active-even');
    container.classList.remove('active-odd');
  }
}

function atualizarNomeMae(maeIdx) {
  const bits = calcMaeBits(maeIdx);
  const nome = fname(bits);
  const nomeEl = document.querySelector(`.mae-nome[data-mae="${maeIdx}"]`);
  if (nomeEl) nomeEl.textContent = nome;
}

// ── Handlers de clique nas linhas ─────────────────────────────────────────────
document.querySelectorAll('.linha-row').forEach(row => {
  row.addEventListener('click', () => {
    const maeIdx   = parseInt(row.dataset.mae);
    const linhaIdx = parseInt(row.dataset.linha);
    // Alterna entre 0 (par/2 pontos) e 1 (ímpar/1 ponto)
    linhas[maeIdx][linhaIdx] = linhas[maeIdx][linhaIdx] === 0 ? 1 : 0;
    atualizarLinhaDots(maeIdx, linhaIdx);
    atualizarNomeMae(maeIdx);
  });
});

// ── Popula planetas ───────────────────────────────────────────────────────────
const planetGrid = document.getElementById('planet-grid');
PLANETAS.forEach((p, i) => {
  const btn = document.createElement('button');
  btn.className = 'planet-btn';
  btn.dataset.idx = i;
  btn.innerHTML = `<span class="planet-sym">${p.sym}</span><span class="planet-name">${p.nome}</span>`;
  btn.addEventListener('click', () => {
    document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    planetaSel = i;
    if (estadoAtual) renderizar();
  });
  planetGrid.appendChild(btn);
});

// ── Tabs ──────────────────────────────────────────────────────────────────────
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    tabAtiva = btn.dataset.tab;
    if (estadoAtual) renderizar();
  });
});

// ── Calcular ──────────────────────────────────────────────────────────────────
document.getElementById('btn-calcular').addEventListener('click', () => {
  const maes = [0, 1, 2, 3].map(i => calcMaeBits(i));

  estadoAtual = calcular(maes);
  renderizar();
  mostrarResultado();

  document.getElementById('resultado').classList.remove('hidden');
  document.getElementById('view-actions').classList.remove('hidden');
});

// ── Limpar ────────────────────────────────────────────────────────────────────
document.getElementById('btn-limpar').addEventListener('click', () => {
  estadoAtual = null;
  planetaSel  = null;

  // Reset line state
  for (let m = 0; m < 4; m++) {
    for (let l = 0; l < 4; l++) {
      linhas[m][l] = 0;
      atualizarLinhaDots(m, l);
    }
    const nomeEl = document.querySelector(`.mae-nome[data-mae="${m}"]`);
    if (nomeEl) nomeEl.textContent = '—';
  }

  document.querySelectorAll('.planet-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('resultado').classList.add('hidden');
  document.getElementById('view-actions').classList.add('hidden');

  const cB = document.getElementById('canvas-brasao');
  const cC = document.getElementById('canvas-casas');
  cB.getContext('2d').clearRect(0,0,cB.width,cB.height);
  cC.getContext('2d').clearRect(0,0,cC.width,cC.height);
});

// ── Renderizar ────────────────────────────────────────────────────────────────
function renderizar() {
  const cB = document.getElementById('canvas-brasao');
  const cC = document.getElementById('canvas-casas');

  if (tabAtiva === 'brasao') {
    cB.classList.remove('hidden');
    cC.classList.add('hidden');
    drawBrasao(cB, estadoAtual, planetaSel);
  } else {
    cC.classList.remove('hidden');
    cB.classList.add('hidden');
    drawCasas(cC, estadoAtual, planetaSel);
  }
}

// ── Resultado resumido ────────────────────────────────────────────────────────
function mostrarResultado() {
  const { maes, filhas, sobrinhas, t1, t2, juiz } = estadoAtual;
  const lista = document.getElementById('resultado-lista');
  lista.innerHTML = '';

  const rows = [
    ['Mãe 1', fname(maes[0])],
    ['Mãe 2', fname(maes[1])],
    ['Mãe 3', fname(maes[2])],
    ['Mãe 4', fname(maes[3])],
    ['Filha 1', fname(filhas[0])],
    ['Filha 2', fname(filhas[1])],
    ['Filha 3', fname(filhas[2])],
    ['Filha 4', fname(filhas[3])],
    ['Sobrinha 1', fname(sobrinhas[0])],
    ['Sobrinha 2', fname(sobrinhas[1])],
    ['Sobrinha 3', fname(sobrinhas[2])],
    ['Sobrinha 4', fname(sobrinhas[3])],
    ['Testemunha 1', fname(t1)],
    ['Testemunha 2', fname(t2)],
    ['Juiz', fname(juiz), true],
  ];

  rows.forEach(([lbl, val, highlight]) => {
    const div = document.createElement('div');
    div.className = 'res-row' + (highlight ? ' highlight' : '');
    div.innerHTML = `<span class="res-label">${lbl}</span><span class="res-value">${val}</span>`;
    lista.appendChild(div);
  });
}

// ── Exportar PDF ──────────────────────────────────────────────────────────────
document.getElementById('btn-pdf')?.addEventListener('click', () => {
  if (estadoAtual) exportarPDF(estadoAtual, planetaSel);
});

// ── Fechar app ────────────────────────────────────────────────────────────────
document.getElementById('btn-close')?.addEventListener('click', () => {
  if (window.electronAPI) window.electronAPI.closeApp();
  else window.close();
});

document.getElementById('btn-hub')?.addEventListener('click', () => {
  window.location.href = '../index.html';
});

// ── Inicializar estado visual dos dots ───────────────────────────────────────
for (let m = 0; m < 4; m++) {
  for (let l = 0; l < 4; l++) {
    atualizarLinhaDots(m, l);
  }
}
