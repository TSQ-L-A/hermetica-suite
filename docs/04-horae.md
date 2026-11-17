# 4. Horae Hermetica — horas planetárias

Arquivos: `renderer/horae/` e `android/www/horae/` (`horas.js`). Widget: `HorasWidget.java`.

## A regra tradicional

- O **dia planetário** vai do nascer do sol ao nascer seguinte.
- O período **diurno** (nascer → pôr) é dividido em 12 horas iguais; o **noturno** (pôr → nascer
  seguinte), em outras 12. Por isso as "horas" não têm 60 minutos: no verão as diurnas são
  longas e as noturnas curtas.
- A **1ª hora** do dia é regida pelo planeta do dia da semana:
  Domingo ☉, Segunda ☽, Terça ♂, Quarta ☿, Quinta ♃, Sexta ♀, Sábado ♄.
- As horas seguintes seguem a **ordem caldaica** (do planeta mais lento ao mais rápido):
  ♄ → ♃ → ♂ → ☉ → ♀ → ☿ → ☽ → ♄ …

Curiosidade: se você seguir a ordem caldaica por 24 horas a partir do regente de um dia, a
25ª hora cai exatamente no regente do dia seguinte. É daí que vem a ordem dos dias da semana.

## Nascer e pôr do sol (`calcSunriseSunset`)

Algoritmo simplificado da NOAA:

1. Longitude e declinação do Sol no dia.
2. **Equação do tempo** (EqT): diferença entre o sol "médio" do relógio e o sol real.
3. **Ângulo horário** do nascer: `cos H = (cos 90,833° − sin φ·sin δ) / (cos φ·cos δ)`.
   O 90,833° (em vez de 90°) inclui a refração atmosférica e o raio do disco solar.
4. `nascer = 720 − 4·(longitude + H) − EqT + fuso` (em minutos desde a meia-noite).

Se `cos H` passar de ±1, é sol da meia-noite ou noite polar; o código devolve valores-limite.

## Montagem das 24 horas (`calcHoras`)

```js
duracaoDiurna  = (poente − nascer) / 12
duracaoNoturna = (nascerAmanha − poente) / 12
planetaDaHora[i] = ORDEM_CALDEIA[(posicaoDoRegenteDoDia + i) % 7]
```

Antes do nascer do sol, a hora atual ainda pertence ao dia planetário **anterior**; por isso
`atualizarTudo` recua um dia quando `agora < nascer de hoje`.

O mesmo algoritmo foi copiado para o Shem (busca eletiva) e para o Tattvas (início do ciclo),
para os três módulos concordarem entre si.
