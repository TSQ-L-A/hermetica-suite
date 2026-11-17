# 6. Tattvas — marés tattvicas

Arquivos: `renderer/tattvas/` e `android/www/tattvas/` (`tattvas.js`). Widget: `TattvaWidget.java`.

## A regra (Rama Prasad, *Nature's Finer Forces*)

- O ciclo começa no **nascer do sol**.
- Cinco Tattvas se sucedem, **24 minutos** cada: Akasha → Vayu → Tejas → Prithivi → Apas.
  Um ciclo completo dura 2 horas e se repete até o nascer seguinte (~12 ciclos por dia).
- Cada Tattva tem **5 sub-Tattvas de 4,8 minutos**, começando pelo próprio Tattva.
  Ex.: em Tejas → Tejas, Prithivi, Apas, Akasha, Vayu.
- Nome do sub-período: "*sub* de *principal*" (ex.: "Vayu de Tejas").

| Tattva | Elemento | Símbolo | Sentido |
|---|---|---|---|
| Akasha | Espírito | ovo negro | audição |
| Vayu | Ar | círculo azul | tato |
| Tejas | Fogo | triângulo vermelho | visão |
| Prithivi | Terra | quadrado amarelo | olfato |
| Apas | Água | crescente prateado | paladar |

## Cálculo

```js
const MIN_TATTVA = 24 * 60000;          // 24 min em ms
const MIN_SUB    = MIN_TATTVA / 5;      // 4,8 min

// período k desde o nascer:  idx = k % 5
// sub-período j dentro dele: sub = (idx + j) % 5
```

- `calcDia(dia)`: do nascer do sol de `dia` ao nascer seguinte, em blocos de 24 min. O último
  bloco é cortado no nascer seguinte, onde o ciclo recomeça em Akasha.
- `diaQueContem(t)`: antes do nascer do sol, vale o ciclo de **ontem** (como no Horae).
- `tattvaEm(t)`: Tattva, sub-Tattva e a lista dos 5 sub-períodos do momento.

O nascer do sol usa o mesmo algoritmo do Horae.

## Símbolos

Os símbolos são desenhados em SVG (`formaSVG`), com o sub-Tattva pequeno dentro do principal,
como nas cartas tattvicas. O crescente é um círculo menos outro círculo deslocado para cima;
no SVG, os pontos onde os dois se cruzam são calculados para traçar o contorno exato. No
widget (Java) a mesma forma é feita com `Path.op(DIFFERENCE)`.
