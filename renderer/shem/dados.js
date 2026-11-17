'use strict';

// ═══════════════════════════════════════════════════════════════
//  DADOS DA FICHA DO ANJO — correspondências da Golden Dawn
// ═══════════════════════════════════════════════════════════════

// Versículos (numeração da Bíblia hebraica), tradução da Apostila Complementar de Cabala.
// Corrigidos para a numeração hebraica: 17 (8:2), 29 (54:6), 40 (88:15), 43 (88:14).
// 20 (Pahaliah): Sl 116:4 (Vulgata 114:4), como em Lenain e no Shem Grimoire; tradução nossa,
// no estilo da Apostila (que traz Sl 120:1, vizinho do versículo de 41, Hahahel).
// 70 (Yabamiah) é o único que vem do Gênesis.
const SALMOS = [
  ["Sl 3:4", "Mas Tu, ó Tetragrammaton, és um Escudo em volta de mim, a minha Glória, e Aquele que me levanta a cabeça."],
  ["Sl 22:20", "Mas Tu, ó Tetragrammaton, não Te afastes; ó minha força, apressa-Te em socorrer-me."],
  ["Sl 91:2", "Direi ao Tetragrammaton: Meu Refúgio e minha Fortaleza, meu Deus, nele confiarei."],
  ["Sl 6:5", "Volta, ó Tetragrammaton, livra a minha alma, salva-me por causa da Tua misericórdia."],
  ["Sl 34:5", "Busquei o Tetragrammaton, e Ele respondeu-me, e de todos os meus temores me livrou."],
  ["Sl 9:12", "Cantai Salmos ao Tetragrammaton, que habita em Sião; anunciai entre as Nações os Seus feitos."],
  ["Sl 103:8", "Misericordioso e compassivo é o Tetragrammaton, longânime e abundante em misericórdia."],
  ["Sl 95:6", "Vinde, prostremo-nos e inclinemo-nos diante do Tetragrammaton, que nos fez."],
  ["Sl 25:6", "Lembra-Te das Tuas ternas misericórdias, ó Tetragrammaton, e das Tuas bondades, porque são desde a antiguidade."],
  ["Sl 33:22", "Seja a Tua misericórdia, ó Tetragrammaton, sobre nós, assim como esperamos em Ti."],
  ["Sl 18:47", "Vive o Tetragrammaton, e bendita seja a minha Rocha, e seja exaltado o Deus da minha salvação."],
  ["Sl 10:1", "Por que, ó Tetragrammaton, Te conservas ao longe, por que Te escondes nos tempos de angústia?"],
  ["Sl 98:4", "Aclamai o Tetragrammaton, toda a Terra; rompei em júbilo, e exultai, e cantai Salmos."],
  ["Sl 9:10", "E o Tetragrammaton será um alto refúgio para o oprimido, um alto refúgio nos tempos de angústia."],
  ["Sl 94:22", "E o Tetragrammaton tornou-se para mim um refúgio, e o meu Deus, o Auxílio da minha Esperança."],
  ["Sl 88:2", "Ó Tetragrammaton, Deus da minha salvação, de dia clamei, e de noite diante de Ti."],
  ["Sl 8:2", "Ó Tetragrammaton, nosso Senhor, quão excelente é o Teu Nome em toda a Terra!"],
  ["Sl 35:24", "Julga-me segundo a Tua Justiça, ó Tetragrammaton, meu Deus, e não se alegrem sobre mim."],
  ["Sl 40:2", "Esperando, esperei o Tetragrammaton, e Ele inclinou-Se para mim e ouviu o meu clamor."],
  ["Sl 116:4", "Então invoquei o nome do Tetragrammaton: Ó Tetragrammaton, livra a minha alma."],
  ["Sl 31:15", "Mas eu confiei em Ti, ó Tetragrammaton; eu disse: Tu és o meu Deus."],
  ["Sl 121:5", "O Tetragrammaton guarda-te; o Tetragrammaton é a tua Sombra à tua mão direita."],
  ["Sl 121:8", "O Tetragrammaton guardará a tua saída e a tua entrada, desde agora e para Sempre."],
  ["Sl 147:11", "Do Tetragrammaton vem a bênção sobre os que O temem e sobre os que confiam na Sua misericórdia."],
  ["Sl 9:2", "Darei graças ao Tetragrammaton de todo o meu coração; contarei todas as Tuas obras maravilhosas."],
  ["Sl 119:145", "Clamei de todo o meu coração; responde-me, Tetragrammaton; guardarei os Teus Estatutos."],
  ["Sl 140:2", "Livra-me, ó Tetragrammaton, do Homem Mau; do homem violento guarda-me Tu."],
  ["Sl 71:12", "Ó Elohim, não Te afastes de mim; ó meu Deus, apressa-Te a socorrer-me."],
  ["Sl 54:6", "Eis que Elohim me ajuda, e Adonai está com os que sustentam a minha Alma."],
  ["Sl 71:5", "Pois Tu és a minha Esperança, ó Tetragrammaton, ó Adonai, a minha confiança desde a minha juventude."],
  ["Sl 71:16", "Irei na força do Senhor Tetragrammaton; farei menção da Tua justiça, só da Tua."],
  ["Sl 33:4", "Pois reta é a Palavra do Tetragrammaton, e todas as Suas obras são em Verdade."],
  ["Sl 94:11", "O Tetragrammaton conhece os pensamentos do homem, que são vaidade."],
  ["Sl 131:3", "Espere Israel no Tetragrammaton, desde agora e para Sempre."],
  ["Sl 116:1", "Regozijei-me porque o Tetragrammaton ouviu a voz da minha Súplica."],
  ["Sl 26:8", "Ó Tetragrammaton, amei a habitação da Tua casa e o lugar onde habita a Tua honra."],
  ["Sl 80:20", "Ó Tetragrammaton Elohim Tzabaoth, converte-nos e faz resplandecer sobre nós a Tua face, e seremos salvos."],
  ["Sl 91:9", "Porque Tu, ó Tetragrammaton, és o meu refúgio; puseste o Teu refúgio no Altíssimo."],
  ["Sl 30:11", "Ouve, ó Tetragrammaton, e tem compaixão de mim; ó Tetragrammaton, sê Tu o meu Auxílio."],
  ["Sl 88:15", "Por que, ó Tetragrammaton, rejeitas a minha alma e escondes de mim a Tua Face?"],
  ["Sl 120:2", "Ó Tetragrammaton, livra a minha alma do lábio da mentira e da língua enganosa."],
  ["Sl 121:7", "O Tetragrammaton te guardará de todo mal; Ele guardará a tua alma."],
  ["Sl 88:14", "E eu a Ti, ó Tetragrammaton, clamei, e de manhã a minha oração virá diante de Ti."],
  ["Sl 119:108", "Aceita, rogo-Te, as oferendas voluntárias da minha boca, ó Tetragrammaton, e ensina-me os Teus juízos."],
  ["Sl 94:18", "Quando eu disse: o meu pé vacilou, a Tua misericórdia, ó Tetragrammaton, me sustentará."],
  ["Sl 145:9", "O Tetragrammaton é bom para todo homem, e as Suas Misericórdias estão sobre todas as Suas obras."],
  ["Sl 92:6", "Quão grandes têm sido as Tuas Obras, ó Tetragrammaton; muito profundos têm sido os Teus desígnios."],
  ["Sl 98:2", "O Tetragrammaton fez conhecer a Sua salvação; à vista das Nações revelou a Sua justiça."],
  ["Sl 145:3", "Grande é o Tetragrammaton e muito digno de louvor, e a Sua grandeza não tem fim."],
  ["Sl 145:8", "Misericordioso e clemente é o Tetragrammaton, tardio em irar-Se e grande em Misericórdia."],
  ["Sl 104:31", "A Glória do Tetragrammaton durará para sempre; o Tetragrammaton se regozijará nas Suas obras."],
  ["Sl 7:18", "Darei graças ao Tetragrammaton segundo a Sua justiça, e cantarei Salmos ao nome do Tetragrammaton Altíssimo."],
  ["Sl 119:75", "Eu sei, ó Tetragrammaton, que os Teus juízos são justos e que em fidelidade me humilhaste."],
  ["Sl 103:19", "O Tetragrammaton estabeleceu o Seu Trono nos Céus, e o Seu Reino domina sobre tudo."],
  ["Sl 102:13", "Mas Tu, ó Tetragrammaton, permanecerás para sempre, e a Tua memória de geração em geração."],
  ["Sl 145:14", "O Tetragrammaton sustenta todos os que caem e levanta todos os que estão abatidos."],
  ["Sl 115:11", "Vós que temeis o Tetragrammaton, confiai no Tetragrammaton; Ele é o seu Auxílio e o seu Escudo."],
  ["Sl 6:4", "E a minha alma está muito perturbada; e Tu, ó Tetragrammaton, até quando?"],
  ["Sl 113:3", "Desde o nascer do sol até o seu ocaso, seja louvado o nome do Tetragrammaton."],
  ["Sl 145:17", "Justo é o Tetragrammaton em todos os Seus caminhos, e Santo em todas as Suas obras."],
  ["Sl 113:2", "Seja louvado o Nome do Tetragrammaton, desde agora e para sempre."],
  ["Sl 119:159", "Vê como amei os Teus Preceitos, ó Tetragrammaton; segundo a Tua misericórdia, vivifica-me."],
  ["Sl 100:2", "Servi o Tetragrammaton com alegria; entrai na Sua presença com exultação."],
  ["Sl 33:18", "Eis que os olhos do Tetragrammaton estão sobre os que O temem, sobre os que esperam na Sua misericórdia."],
  ["Sl 90:13", "Volta, ó Tetragrammaton, até quando? E arrepende-Te a respeito dos Teus servos."],
  ["Sl 38:22", "Não me desampares, ó Tetragrammaton; meu Deus, não Te afastes de mim."],
  ["Sl 37:4", "Deleita-te no Tetragrammaton, e Ele te concederá o desejo do teu coração."],
  ["Sl 106:1", "Ó, dai graças ao Tetragrammaton, porque Ele é bom, porque a Sua misericórdia dura para sempre."],
  ["Sl 16:5", "O Tetragrammaton é a porção da minha herança e o meu cálice; Tu sustentas a minha sorte."],
  ["Gn 1:1", "No Princípio, Elohim criou a substância dos Céus e a substância da Terra."],
  ["Sl 109:30", "Darei muitas graças ao Tetragrammaton com a minha boca, e no meio de muitos O louvarei."],
  ["Sl 116:7", "Volta ao teu repouso, ó minha Alma, porque o Tetragrammaton te recompensa."],
];

// Coros: 8 anjos por coro, na ordem dos 72 — [coro, Sephirah, arcanjo regente]
const COROS = [
  ['Serafins',    'Kether',    'Metatron'],
  ['Querubins',   'Chokmah',   'Raziel'],
  ['Tronos',      'Binah',     'Tzaphkiel'],
  ['Dominações',  'Chesed',    'Tzadkiel'],
  ['Potestades',  'Geburah',   'Khamael'],
  ['Virtudes',    'Tiphareth', 'Raphael'],
  ['Principados', 'Netzach',   'Haniel'],
  ['Arcanjos',    'Hod',       'Michael'],
  ['Anjos',       'Yesod',     'Gabriel'],
];

// Por signo (Áries → Peixes): arcanjo e anjo do signo, permutação do Tetragrammaton
// e Arcano Maior (numeração da Golden Dawn: Força = VIII, Justiça = XI)
const SIGNO_GD = [
  { arcanjo: 'Malkhidael', anjo: 'Sharhiel',    yhvh: 'יהוה', arcano: 'IV · O Imperador' },
  { arcanjo: 'Asmodel',    anjo: 'Araziel',     yhvh: 'יההו', arcano: 'V · O Hierofante' },
  { arcanjo: 'Ambriel',    anjo: 'Saraiel',     yhvh: 'יוהה', arcano: 'VI · Os Enamorados' },
  { arcanjo: 'Muriel',     anjo: 'Pakiel',      yhvh: 'הוהי', arcano: 'VII · O Carro' },
  { arcanjo: 'Verkhiel',   anjo: 'Sharatiel',   yhvh: 'הויה', arcano: 'VIII · A Força' },
  { arcanjo: 'Hamaliel',   anjo: 'Shelathiel',  yhvh: 'ההוי', arcano: 'IX · O Eremita' },
  { arcanjo: 'Zuriel',     anjo: 'Chadakiel',   yhvh: 'והיה', arcano: 'XI · A Justiça' },
  { arcanjo: 'Barkhiel',   anjo: 'Saitziel',    yhvh: 'וההי', arcano: 'XIII · A Morte' },
  { arcanjo: 'Advakhiel',  anjo: 'Saritiel',    yhvh: 'ויהה', arcano: 'XIV · A Temperança' },
  { arcanjo: 'Hanael',     anjo: 'Samequiel',   yhvh: 'היהו', arcano: 'XV · O Diabo' },
  { arcanjo: 'Kambriel',   anjo: 'Tzakmiqiel',  yhvh: 'היוה', arcano: 'XVII · A Estrela' },
  { arcanjo: 'Amnitziel',  anjo: 'Vakabiel',    yhvh: 'ההיו', arcano: 'XVIII · A Lua' },
];

// Arcano Maior do planeta regente do decanato (pelo nome em CALDEIA)
const ARCANO_PLANETA = {
  'Saturno': 'XXI · O Universo', 'Júpiter': 'X · A Roda da Fortuna', 'Marte': 'XVI · A Torre',
  'Sol': 'XIX · O Sol', 'Vênus': 'III · A Imperatriz', 'Mercúrio': 'I · O Mago', 'Lua': 'II · A Sacerdotisa',
};
