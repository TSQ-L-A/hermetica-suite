# 3. Astra Hermetica — mapa astral

Arquivos: `renderer/astra/` e `android/www/astra/` (`index.html`, `style.css`, `astro.js`).
Widget: `AstraWidget.java` (ver [Widgets](08-widgets-android.md)).

## O que faz

- Mapa do **momento atual**, recalculado a cada 10 s.
- **Modo eletivo:** escolher data e hora, ou avançar e voltar de hora em hora, dia a dia e mês a mês.
- Planetas com grau, signo e marca de retrógrado (℞).
- Casas de Plácido, com AC, DC, MC e FC.
- Linhas e grade de aspectos.
- **Fase da Lua** desenhada no centro.
- Seletor de cidade: lista das capitais brasileiras e busca de qualquer município (IBGE + Nominatim).

## Ciclo de cálculo (`tick`)

```js
const date  = electiveDate || new Date();       // eletiva ou agora
positions   = calcPlanets(date);                 // longitudes (ver motor astronômico)
houses      = calcHouses(date, loc.lat, loc.lon);
ascDeg      = houses[0];
aspects     = calcAspects(positions);
retrogrades = calcRetrogrades(date);
```

Depois: `drawChart(...)` desenha o mapa no `<canvas>` e `updateSidePanel(...)` monta a lista de
planetas e a grade de aspectos.

## Aspectos

`calcAspects` compara cada par de pontos (inclui o Nodo). A separação angular é reduzida a
0–180° e comparada com cada aspecto dentro da sua órbita:

| Aspecto | Ângulo | Órbita |
|---|---|---|
| Conjunção | 0° | 8° |
| Sextil | 60° | 6° |
| Quadratura | 90° | 7° |
| Trígono | 120° | 8° |
| Oposição | 180° | 8° |

## Desenho do mapa (`drawChart`)

### Do grau zodiacal ao ângulo na tela

O Ascendente fica sempre à esquerda (ângulo de 180° na tela) e o zodíaco corre no sentido
anti-horário:

```js
function lon2a(lon, asc) { return toRad(180 - (lon - asc)); }
function pt(r, a, cx, cy) { return [cx + r*Math.cos(a), cy + r*Math.sin(a)]; }
```

No canvas o eixo y cresce para baixo, por isso "180 − (…)" produz o sentido anti-horário.

### Camadas, de fora para dentro

1. Anel do zodíaco (`rZ1`–`rZ2`): divisões a cada 30° e símbolo do signo no meio.
2. Anel das casas (`rZ2`–`rH2`): linhas das cúspides (as angulares mais grossas) e o número de
   cada casa no ponto médio entre duas cúspides (as casas de Plácido têm tamanhos diferentes).
3. Círculo central (`rCt`): linhas de aspecto entre as posições dos planetas.
4. Fase da Lua no centro, com um disco de fundo que cobre o cruzamento das linhas.
5. Planetas: um ponto na posição real e o símbolo, o grau e o ℞ um pouco para dentro.
6. Rótulos AC, DC, MC e FC nas cúspides 1, 7, 10 e 4.

### Planetas próximos não se sobrepõem

Quando dois símbolos ficariam a menos de `minGap` um do outro, o código os empurra em direções
opostas, repetindo 8 vezes. Uma linha fina liga o ponto real ao símbolo deslocado.

## Modo eletivo

- `electiveDate = null` → tempo real (`setInterval` de 10 s ligado).
- `setElectiveDate(data)` → congela no instante escolhido e desliga a atualização automática.
- Os botões ±1H, ±1D e ±1M somam milissegundos à data atual (1M = 30 dias).
- **Agora** volta para o tempo real.
- Trocar de cidade no meio da eletiva mantém a data.

## Diferenças entre desktop e Android

- No Android, em tela de retrato, o mapa usa no máximo 52% da altura (`resize`).
- A busca de cidades no Android usa `fetch` direto (sem IPC), e a cidade inicial vem do GPS
  (`navigator.geolocation`) em vez do IP.
- Só no Android a cidade é enviada ao widget (`syncWidgetLocation`).
