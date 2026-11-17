# 8. Widgets do Android

Pasta: `android/android/app/src/main/`.

| Widget | Classe | Formato | Atualiza |
|---|---|---|---|
| Astra | `AstraWidget.java` | mandala quadrada | a cada ~5 min |
| Horae | `HorasWidget.java` | faixa 4×1 | na troca de hora planetária |
| Shem | `ShemWidget.java` | faixa 4×1 | na troca de anjo do Ascendente |
| Tattvas | `TattvaWidget.java` | faixa 4×1 | na troca de sub-Tattva (4,8 min) |

## Como um widget funciona

Um widget de tela inicial não é uma tela do app: é um pedaço de interface que o **launcher** (a
tela inicial) desenha. O app só entrega o conteúdo pronto.

1. **Registro** no `AndroidManifest.xml`: um `<receiver>` com a ação `APPWIDGET_UPDATE` e um
   arquivo de configuração (`res/xml/widget_*_info.xml`: tamanho mínimo, layout inicial).
2. **Layout** (`res/layout/widget_*.xml`): aqui, só um `ImageView`.
3. **Classe Java** que estende `AppWidgetProvider`. O Android chama:
   - `onUpdate` — quando o widget é criado e periodicamente (no mínimo a cada 30 min);
   - `onAppWidgetOptionsChanged` — quando o usuário redimensiona;
   - `onReceive` — quando chega um alarme nosso;
   - `onDisabled` — quando o último widget é removido (cancelamos o alarme).

## Desenho: um Bitmap

Os widgets não usam componentes de texto do Android. Cada um desenha tudo num `Bitmap` com
`Canvas` e `Paint` (a mesma ideia do `<canvas>` das páginas) e entrega a imagem pronta:

```java
Bitmap bmp = desenhar(largura, altura, info);
RemoteViews views = new RemoteViews(pkg, R.layout.widget_shem);
views.setImageViewBitmap(R.id.widget_image, bmp);
mgr.updateAppWidget(id, views);
```

Vantagens: controle total do visual e o mesmo estilo nos quatro widgets. A largura e a altura
vêm de `getAppWidgetOptions` (em dp × densidade da tela). Os textos usam `caber()`, que reduz a
fonte quando o texto não cabe, em vez de cortar.

## Atualização no momento certo: AlarmManager

`updatePeriodMillis` só permite atualizar a cada 30 minutos, o que é pouco para anjos de ~20 min
e sub-Tattvas de 4,8 min. Por isso cada widget agenda o próprio alarme para o instante da
próxima troca:

```java
am.setWindow(AlarmManager.RTC, fim + 2000, 60_000, pendingIntent);   // sem permissão especial
// ou setExact(...) se o app puder agendar alarmes exatos
```

O alarme dispara um `Intent` com uma ação própria (`WIDGET_SHEM_UPDATE` etc.) direcionado à
classe do widget, que recalcula, redesenha e agenda o próximo. `RTC` (sem `_WAKEUP`) não acorda
o celular: se a tela está apagada, a atualização acontece quando ela acende, o que economiza
bateria.

Depois de reiniciar o celular os alarmes somem; o `BootReceiver` recebe `BOOT_COMPLETED` e
atualiza todos os widgets, que voltam a agendar seus alarmes.

## Cálculo nativo: Ephemeris.java

Os widgets não podem rodar o JavaScript das páginas. `Ephemeris.java` é a tradução direta do
motor astronômico (planetas, Lua, Ascendente, Plácido, Sol). `ShemWidget` e `TattvaWidget`
repetem a lógica de `shem.js` e `tattvas.js`; o Tattvas usa o nascer do sol de `HorasWidget`.

As versões Java e JS foram conferidas lado a lado: os mesmos instantes dão os mesmos
resultados.

## Cidade dos widgets: WidgetBridge

O widget lê a cidade de `SharedPreferences` (`lat`, `lon`). Quem grava é o plugin
`WidgetBridge`, chamado pela página quando o usuário escolhe a cidade ou abre o módulo:

| Método JS | Grava em | Atualiza |
|---|---|---|
| `setLocation` | `astra_widget_prefs` | AstraWidget |
| `setHorasLocation` | `horas_widget_prefs` | HorasWidget |
| `setShemLocation` | `shem_widget_prefs` | ShemWidget |
| `setTattvaLocation` | `tattva_widget_prefs` | TattvaWidget |

Sem cidade gravada, os widgets usam São Paulo como padrão.

## Fase da Lua no widget do Astra

`desenharFaseLua` faz com `Path.arcTo` o mesmo desenho da página: semicírculo do lado aceso
mais meia elipse do terminador, espelhado no hemisfério sul (`lat < 0`).
