# 5. Shem HaMephorash — os 72 anjos

Arquivos: `renderer/shem/` e `android/www/shem/` (`shem.js`, `dados.js`, `index.html`, `style.css`).
Widget: `ShemWidget.java`.

## A tradição por trás

O Shem HaMephorash ("Nome Explícito") é um nome divino de 216 letras tirado de Êxodo 14:19–21.
Os três versículos têm 72 letras cada; lidos alternadamente (o 1º para a frente, o 2º de trás
para a frente, o 3º para a frente), formam **72 grupos de três letras**. Somando o sufixo
**יה** (-iah) ou **אל** (-el), cada grupo vira o nome de um anjo.

### Atribuição da Golden Dawn (Book T)

- Os 72 anjos regem **quinários** de 5° do zodíaco (72 × 5° = 360°).
- **O primeiro quinário começa em 0° Leão** (não em Áries): Vehuiah 0°–5° Leão, Yeliel 5°–10° Leão…
- Cada **decanato** (10°) tem dois anjos e corresponde a uma carta menor do tarô (2 a 10).

No código:

```js
const INICIO_LEAO = 120;                                       // 0° Leão
const quinarioDe = lon => Math.floor(norm360(lon - INICIO_LEAO) / 5);  // 0..71
```

## Dados de cada anjo (`anjoInfo`)

| Campo | Como é obtido |
|---|---|
| Nome hebraico | raiz de 3 letras + `יה` ou `אל` (tabela `ANJOS`) |
| Nome divino | a raiz, com a última letra na forma final (מיכ → מיך) |
| Quinário | `120 + 5·i` graus |
| Decanato | `floor(grau / 10)`, contado a partir de Áries |
| Regente do decanato | ordem caldaica a partir de Marte em 0° Áries: `CALDEIA[(2 + decanato) % 7]` |
| Carta | signo cardinal 2–4, fixo 5–7, mutável 8–10; naipe pelo elemento (Fogo Paus, Terra Ouros, Ar Espadas, Água Copas) |
| Título | "Senhor da Luta" etc., títulos da GD (`TITULOS`) |

Transliteração: formas usuais. Os anjos 11 e 17 têm o mesmo hebraico (לאויה) e foram
distinguidos como **Leviah** e **Lauiah**.

## Anjo do momento: o Ascendente

Durante o dia, o zodíaco inteiro passa pelo horizonte leste. O anjo do momento é o do
**quinário que está no Ascendente**. Como os signos sobem em velocidades diferentes, cada anjo
fica de ~10 a ~30 minutos (média de ~20).

`calcDia(dia, lat, lon)` monta a tabela do dia:

1. Calcula o quinário do Ascendente minuto a minuto, da meia-noite à meia-noite.
2. Quando o quinário muda entre dois minutos, refina o instante exato por **bisseção** até 1 s
   (`transicao`).
3. Resultado: cerca de 73–74 períodos `{idx, inicio, fim}`.

Bisseção: se a mudança está entre t0 e t1, olha-se o meio; se no meio ainda é o anjo antigo, a
mudança está na metade de cima, senão na de baixo. Cada passo corta o intervalo pela metade;
de 60 s até 1 s são 6 passos.

## Anjo dos dias: o Sol

O Sol anda ~1° por dia, então fica ~5 dias em cada quinário. `calcQuinarioSolar` encontra o
anjo do grau atual do Sol e, por bisseção, as datas de entrada e saída.

## Ficha do anjo

Ao tocar num anjo (tabela, painel ou lista "Os 72"), abre uma ficha com:

- **Versículo** (`SALMOS` em `dados.js`): numeração da Bíblia hebraica; texto da tradução da
  Apostila Complementar de Cabala.
- **Golden Dawn:** nome divino, decanato, carta, Arcanos Maiores (o do signo e o do planeta),
  permutação do Tetragrammaton do signo, arcanjo e anjo do signo.
- **Coro:** 8 anjos por coro, na ordem Serafins → Anjos, com a Sephirah e o arcanjo regente (`COROS`).

Decisões sobre os versículos (ver também `dados.js`):

- 17, 29, 40, 43: numeração corrigida para a hebraica (8:2, 54:6, 88:15, 88:14).
- 20 (Pahaliah): Sl 116:4 (Vulgata 114:4), como em Lenain e no Shem Grimoire.
- 70 (Yabamiah): Gênesis 1:1, o único que não vem dos Salmos.
- Nenhum versículo se repete entre os 72.

## Busca eletiva: "quando será o próximo X?"

`proximasOcorrencias(idx, lat, lon, soRegente)`:

1. Percorre até 60 dias com `calcDia` e junta os períodos do anjo escolhido. Um período que
   atravessa a meia-noite vem partido em dois dias e é reunido.
2. Para cada período, lista as **horas planetárias** que o cobrem (`horaPlanetaria`, mesmo
   algoritmo do Horae).
3. Se o filtro "só na hora do regente" estiver ligado, guarda só os períodos que tocam a hora do
   regente do decanato do anjo, e calcula a **janela** em que os dois coincidem.

Cuidado numérico: ao avançar de uma hora planetária para a seguinte, o código anda 1 ms além do
fim. Sem isso, arredondamentos de ponto flutuante podiam devolver a mesma hora de novo
(repetição) ou nunca avançar (laço infinito).

## Lista dos 72

O botão **Os 72** abre a lista completa, com número, hebraico, nome e quinário; cada item abre a
ficha.
