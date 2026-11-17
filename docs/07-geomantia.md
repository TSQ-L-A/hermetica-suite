# 7. Geomantia Hermetica

Arquivos: `renderer/geomantia/` e `android/www/geomantia/` (`geo.js`).

## Fluxo de uso

1. O consulente marca as **4 Mães**, linha por linha, tocando em cada linha para alternar entre
   um ponto (ímpar) e dois pontos (par). Os pontos são gerados pela pessoa, como no método
   tradicional; o app não sorteia.
2. Opcional: escolhe o **planeta da questão** (significador). Ele aparece no título dos mapas
   e no PDF.
3. **Calcular** gera o escudo e o mapa nas casas.
4. **PDF** abre uma página de impressão (A4 paisagem) com os dois mapas e as tabelas, que pode
   ser salva como PDF pelo diálogo de impressão.

## Figuras como números de 4 bits

Cada figura tem 4 linhas (Fogo, Ar, Água, Terra, de cima para baixo). Cada linha vale **1 se é
um ponto (ímpar)** e **0 se são dois (par)**:

```
Laetitia   ●      → 1
           ●●     → 0      bits = 1000 (binário)
           ●●     → 0
           ●●     → 0
```

A tabela `FIGURAS` associa os 16 valores possíveis (0000 a 1111) aos 16 nomes.

## Geração do escudo (`calcular`)

- **Filhas:** transposição. A Filha *n* é formada pela linha *n* das quatro Mães
  (`transposeRow`).
- **Sobrinhas:** soma de pares. Somar duas figuras linha a linha (ímpar + ímpar = par, etc.) é
  exatamente a operação **XOR** sobre os bits:
  - N1 = M1 ⊕ M2, N2 = M3 ⊕ M4, N3 = F1 ⊕ F2, N4 = F3 ⊕ F4
- **Testemunhas:** T. Direita = N1 ⊕ N2, T. Esquerda = N3 ⊕ N4.
- **Juiz:** T1 ⊕ T2.

Usar XOR torna o cálculo de uma linha só, sem laços sobre pontos.

## Mapa nas casas: o método da Golden Dawn

As figuras não vão para as casas 1 a 12 em ordem. A GD distribui as Mães nas casas angulares,
as Filhas nas sucedentes e as Sobrinhas nas cadentes:

| Figura | Casa | Figura | Casa | Figura | Casa |
|---|---|---|---|---|---|
| Mãe 1 | 10 | Filha 1 | 11 | Sobrinha 1 | 12 |
| Mãe 2 | 1 | Filha 2 | 2 | Sobrinha 2 | 3 |
| Mãe 3 | 4 | Filha 3 | 5 | Sobrinha 3 | 6 |
| Mãe 4 | 7 | Filha 4 | 8 | Sobrinha 4 | 9 |

## Desenho

- `drawBrasao`: o escudo, com as figuras desenhadas em pontos (`drawDots`) e contornos em curvas de
  Bézier (`bezierPts`).
- `drawCasas`: o mapa nas 12 casas.
- Os dois aceitam um fator de escala, usado para gerar a versão em alta resolução do PDF.
