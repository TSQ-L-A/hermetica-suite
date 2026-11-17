# 12. Histórico de correções e novidades

Registro do que mudou nesta revisão, com o motivo de cada mudança. Serve também como estudo de
caso: cada item mostra um tipo de erro comum e como foi encontrado.

## Correções no Astra

### Planetas em posições erradas
**Sintoma:** comparado ao Planetdance, Mercúrio aparecia em Gêmeos em vez de Escorpião; Vênus,
Marte, Júpiter e Saturno também erravam por muitos graus. Sol, Lua e Urano estavam quase certos.

**Causa:** a função `planetApprox` somava correções arbitrárias à longitude média de cada
planeta, sem nunca converter a posição para o ponto de vista da Terra. Para Mercúrio, chegava a
usar a anomalia da Terra com uma "correção" de 23°.

**Correção:** motor novo com elementos keplerianos do JPL, equação de Kepler, subtração da
posição da Terra, tempo-luz, precessão e nutação. Ver [Motor astronômico](02-motor-astronomico.md).

**Lição:** comparar com uma referência confiável, ponto a ponto, revela erros que "parecem
plausíveis" na tela.

### MC e FC trocados
**Causa:** o código calculava `MC = Ascendente + 90°`. No sentido do zodíaco isso cai no Fundo
do Céu (casa 4), por isso o MC aparecia embaixo.

**Correção:** MC calculado pela fórmula correta a partir do tempo sideral; ele fica inclinado,
o que é normal.

### Casas iguais em vez de Plácido
As casas eram 12 fatias de 30° a partir do Ascendente. Implementadas as casas de Plácido (com
Porfírio nas latitudes polares).

### Lua e Nodo
- Lua: de 9 para 59 termos (erro de ~6′ para < 0,1′).
- Nodo: médio → verdadeiro (o que o Planetdance mostra por padrão).

### Widget com cálculo próprio desatualizado
O widget do Astra tinha uma cópia em Java do motor antigo, com os mesmos erros. Ele também:
- usava sempre São Paulo (nada gravava a cidade escolhida no app);
- esticava a mandala (`scaleType="fitXY"`);
- só atualizava a cada 30 min.

Correção: `Ephemeris.java` (motor novo em Java), plugin `WidgetBridge` para a cidade, `fitCenter`,
alarme a cada ~5 min.

## Outras correções

- **Horae:** botão Menu cortado em telas estreitas (o título não encolhia). Cabeçalho compacto
  abaixo de 420 px de largura.
- **Widget das Horas:** usava São Paulo fixo no código; agora segue a cidade do Horae. Os nomes
  dos planetas estavam sem acento.
- **Shem:** um anjo que saía do Ascendente segundos depois da meia-noite aparecia como
  "00:00 – 00:00". O cálculo estava certo; a tabela é que corta os segundos. Períodos com menos
  de 1 minuto agora mostram "< 1 min" na coluna Fim.

## Novidades

- **Fase da Lua** no centro do mapa do Astra (app e widget).
- **Módulo Shem HaMephorash** (com widget): anjo do momento pelo Ascendente, anjo dos dias pelo
  Sol, tabela do dia, ficha completa e busca eletiva com horas planetárias.
- **Módulo Tattvas** (com widget): marés e sub-marés tattvicas.

## Decisões de conteúdo (Shem)

- Quinários a partir de 0° Leão (Book T).
- Transliterações usuais; 11 = Leviah e 17 = Lauiah.
- Hebraico tradicional quando as fontes divergem (o Grimoire e a Apostila têm variantes em
  alguns nomes).
- Versículos: tradução da Apostila, com a numeração hebraica corrigida em 17, 29, 40 e 43, e
  Pahaliah (20) com Sl 116:4, para não repetir o versículo de Hahahel (41).
