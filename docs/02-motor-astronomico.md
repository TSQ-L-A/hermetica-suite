# 2. Motor astronômico

Arquivos: `renderer/astra/astro.js` (seção "CÁLCULOS ASTRONÔMICOS") e, para os widgets,
`Ephemeris.java`. Os dois implementam exatamente as mesmas fórmulas.

O objetivo é calcular, para um instante e um lugar:

- a **longitude eclíptica tropical** de cada planeta, da Lua e do Nodo (em graus, 0° = 0° Áries);
- o **Ascendente**, o **Meio do Céu** e as **cúspides das casas**.

## 2.1 Tempo

### Data juliana

Os cálculos astronômicos contam o tempo em dias corridos desde uma origem fixa (meio-dia de
1º de janeiro de 4713 a.C.). A partir do relógio do sistema:

```js
JD = milissegundos_desde_1970 / 86400000 + 2440587.5
```

E os séculos julianos desde a época J2000.0 (1º/jan/2000, 12h):

```js
T = (JD − 2451545.0) / 36525
```

### Tempo Universal × Tempo Terrestre (ΔT)

O relógio segue a rotação da Terra (UT), que é irregular. As órbitas seguem um tempo uniforme
(TT). A diferença, ΔT, era de cerca de 69 s em 2015–2026. A função `deltaT()` usa as
aproximações de Espenak & Meeus por faixa de anos.

- **Planetas, Sol e Lua** usam TT (`julianCenturiesTT`).
- **Rotação da Terra** (tempo sideral, Ascendente) usa UT (`julianCenturies`).

Ignorar ΔT erraria a Lua em cerca de 0,6′.

## 2.2 Nutação e obliquidade

O eixo da Terra oscila ("nutação"). `nutation(T)` devolve:

- **Δψ** — nutação em longitude (até ~17″), somada a todas as longitudes;
- **ε** — inclinação real do eixo (~23,44°), usada para converter entre equador e eclíptica.

Fórmula de baixa precisão do Meeus, cap. 22 (erro de ~0,5″).

## 2.3 Sol

`sunLon(T)` — Meeus, cap. 25: longitude média + equação do centro, menos a correção de
aberração e nutação para dar a **longitude aparente**. Erro: ~0,01°.

## 2.4 Lua

`moonLon(T)` — Meeus, cap. 47. A órbita da Lua é muito perturbada pelo Sol; a longitude é
uma soma de **59 termos periódicos** (tabela 47.A), cada um da forma

```
coeficiente × sin(d·D + m·M + m'·M' + f·F)
```

onde D (elongação), M (anomalia do Sol), M' (anomalia da Lua) e F (argumento de latitude) são
ângulos que crescem com o tempo. Termos que dependem de M são multiplicados pelo fator E
(excentricidade da órbita da Terra). Mais três correções aditivas (Vênus, Júpiter, achatamento).

Erro típico: menos de 0,1′.

## 2.5 Planetas

### O modelo: elementos keplerianos do JPL

Cada planeta (e a Terra) é tratado como em órbita elíptica em torno do Sol, descrita por seis
elementos que variam lentamente (tabela "Approximate Positions of the Planets", Standish/JPL,
válida de 1800 a 2050):

| Elemento | Significado |
|---|---|
| a | semieixo maior (tamanho da órbita, em UA) |
| e | excentricidade (quanto é achatada) |
| I | inclinação em relação à eclíptica |
| L | longitude média (onde o planeta "estaria" numa órbita circular) |
| ϖ | longitude do periélio |
| Ω | longitude do nodo ascendente |

Cada elemento = valor em J2000 + taxa × T. Ficam na tabela `ORBITS`.

### Passo a passo (`helioXYZ` e `planetLon`)

1. **Anomalia média:** `M = L − ϖ`.
2. **Equação de Kepler:** resolver `E − e·sin E = M` por iteração de Newton
   (converge em 3–5 passos). E é a anomalia excêntrica.
3. **Posição no plano da órbita:** `x' = a(cos E − e)`, `y' = a·√(1−e²)·sin E`.
4. **Girar para a eclíptica** usando ω = ϖ − Ω, Ω e I → coordenadas heliocêntricas (x, y, z).
5. Fazer o mesmo para a **Terra** e subtrair: `planeta − Terra` = vetor visto da Terra.
6. **Tempo-luz:** a luz leva minutos ou horas para chegar; recalcula-se a posição do planeta no
   instante em que a luz partiu (2 iterações).
7. `longitude = atan2(y, x)` — ainda referida ao equinócio de 2000.
8. **Precessão:** o equinócio recua ~50″ por ano; soma-se `1,396971°·T + 0,0003086°·T²` para
   chegar ao equinócio da data (zodíaco tropical). Soma-se também Δψ.

Plutão está na mesma tabela do JPL e segue o mesmo processo.

### O que estava errado antes

A versão antiga usava uma fórmula `planetApprox` que somava correções arbitrárias à longitude
média, sem converter a posição para a Terra. Para planetas, a diferença entre a posição vista
do Sol e a vista da Terra pode passar de 40°. Ver [Histórico](12-historico.md).

## 2.6 Nodo Lunar (Cabeça do Dragão)

`nodeLon(T)` — **Nodo verdadeiro**: nodo médio (Meeus) + cinco termos periódicos. O nodo médio
anda para trás de forma uniforme; o verdadeiro oscila até ~1,5° em torno dele.

## 2.7 Retrogradação

`calcRetrogrades(date)` compara a longitude 12 h antes e 12 h depois. Se diminuiu, o planeta
está retrógrado. A diferença é normalizada para não errar na passagem 359° → 0°.

## 2.8 Tempo sideral

A Terra gira 360,9856° por dia em relação às estrelas. O tempo sideral de Greenwich
(`gst`) diz qual ponto do céu está no meridiano de Greenwich:

```
GST = 280,46061837 + 360,98564736629·D + 0,000387933·T² − T³/38710000 + Δψ·cos ε
```

Somando a longitude geográfica (leste positivo) obtém-se o **tempo sideral local**, também
chamado **RAMC** (ascensão reta do meio do céu).

## 2.9 Ascendente e Meio do Céu

**Ascendente** — o grau da eclíptica que nasce no horizonte leste:

```
ASC = atan2( cos RAMC,  −(sin RAMC·cos ε + tan φ·sin ε) )
```

**Meio do Céu (MC)** — o grau da eclíptica que cruza o meridiano:

```
MC = atan2( sin RAMC,  cos RAMC·cos ε )
```

(φ = latitude). O MC **não** fica a 90° do Ascendente, exceto em casos raros; por isso a linha do
MC aparece inclinada no mapa — é o correto.

## 2.10 Casas de Plácido

Plácido divide o **tempo** que cada grau leva para ir do horizonte ao meridiano.

- **Semiarco diurno (DSA)** de um ponto de declinação δ: `DSA = 90° + asin(tan φ·tan δ)`.
  É quanto ele leva (em graus de rotação) do nascer até culminar.
- **Cúspide 11:** ponto cuja ascensão reta é `RAMC + DSA/3`.
- **Cúspide 12:** `RAMC + 2·DSA/3`.
- **Cúspides 2 e 3:** o mesmo com o semiarco noturno (`180° − DSA`) a partir do Fundo do Céu.

Como o DSA depende da declinação do próprio ponto, que depende da cúspide, a conta é
**iterativa** (`placidusCusp`): chuta-se uma posição, calcula-se o DSA, corrige-se, repete até
estabilizar. As outras cúspides são opostas (casa 5 = casa 11 + 180°, etc.).

**Latitudes polares:** acima de ~66°, alguns graus nunca nascem nem se põem e o Plácido não
existe. Nesse caso o código usa **Porfírio** (divide em três partes iguais cada quadrante entre
ASC e MC).

## 2.11 Fase da Lua

Elongação = longitude da Lua − longitude do Sol.

- 0° nova · 90° quarto crescente · 180° cheia · 270° quarto minguante.
- Fração iluminada = `(1 − cos elongação) / 2`.

O desenho (`drawMoonPhase`) faz um semicírculo do lado aceso mais meia elipse (o terminador)
de largura `r·|cos elongação|`. No hemisfério sul o desenho é espelhado, como a Lua aparece
no céu de lá.

## 2.12 Precisão

Comparação com o Planetdance (Rio de Janeiro, 16/11/2026 23:51:28):

| Ponto | Diferença |
|---|---|
| Sol, Lua, Mercúrio, Vênus, Marte, Urano, Plutão | ≤ 0,3′ |
| Netuno | 0,7′ |
| Júpiter | 1,7′ |
| Nodo verdadeiro | 3,3′ |
| Saturno | 4,6′ |
| Ascendente, MC, todas as casas | ≤ 0,02′ |

Júpiter e Saturno têm o maior erro porque os elementos do JPL não incluem a perturbação mútua
entre os dois ("grande desigualdade"). Para um app de uso diário, alguns minutos de arco não
mudam signo, casa nem aspecto.

## 2.13 Para estudar mais

- Jean Meeus, *Astronomical Algorithms* (2ª ed., 1998) — capítulos 7 (data juliana), 12 (tempo
  sideral), 22 (nutação), 25 (Sol), 47 (Lua). É o livro de referência para tudo acima.
- E. M. Standish, *Keplerian Elements for Approximate Positions of the Major Planets* (JPL).
- Para precisão profissional: efemérides VSOP87 / Swiss Ephemeris (muito maiores).
