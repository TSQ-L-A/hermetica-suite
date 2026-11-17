# 1. Arquitetura

## Linguagens

| Onde | Linguagem | Para quê |
|---|---|---|
| `renderer/` e `android/www/` | HTML, CSS, **JavaScript** | Todas as telas e todos os cálculos dos módulos |
| `main.js`, `preload.js` | JavaScript (Node.js) | Janela do desktop e acesso à rede |
| `android/android/app/src/main/java/` | **Java** | Widgets da tela inicial e a ponte JS → nativo |
| `android/android/app/src/main/res/` | XML | Layouts e configuração dos widgets |

JavaScript e Java são linguagens diferentes. A maior parte do projeto é JavaScript; o Java
existe porque widgets de tela inicial do Android precisam ser escritos em código nativo.

## Duas plataformas, o mesmo código de tela

O app é um conjunto de **páginas web** que rodam dentro de uma "casca" diferente em cada
plataforma:

- **Desktop — Electron.** O Electron junta o navegador Chromium e o Node.js num programa.
  `main.js` abre uma janela sem moldura e carrega `renderer/index.html`.
- **Android — Capacitor.** O Capacitor cria um app Android cuja tela é um WebView (um
  navegador embutido) que carrega as páginas de `android/www/`.

```
             ┌──────────── Desktop ────────────┐      ┌──────────── Android ─────────────┐
             │ main.js (Node)                  │      │ MainActivity (Java, Capacitor)   │
             │   ↕ IPC (preload.js)            │      │   ↕ plugin WidgetBridge          │
             │ renderer/*.html + *.js          │      │ android/www/*.html + *.js        │
             └─────────────────────────────────┘      │ Widgets (Java) ← SharedPreferences│
                                                      └──────────────────────────────────┘
```

### Por que existem duas cópias das páginas?

`renderer/` (desktop) e `android/www/` (Android) começaram como cópias e foram adaptadas:

- No desktop, buscas na internet passam pelo `main.js` via IPC (`window.electronAPI`).
  No Android não existe `electronAPI`; as páginas usam `fetch()` direto.
- O Android tem ajustes de layout para tela de celular (ex.: o Astra em modo retrato).
- Só o Android avisa os widgets nativos (via `window.Capacitor`).

Os módulos novos (Shem e Tattvas) foram escritos para funcionar nos dois sem alteração:
eles verificam o que existe (`window.electronAPI`, `window.Capacitor`) e se adaptam. As duas
cópias desses módulos são idênticas.

**Regra prática:** ao mudar um módulo, mude em `android/www/` e copie para `renderer/`
(ou o contrário), conferindo as diferenças com `diff`.

## Navegação entre módulos

`index.html` é o menu (hub). Cada card tem `data-page` com o caminho da página do módulo;
clicar troca a página (`window.location.href`). No desktop, `hub.js` também avisa o `main.js`
(`electronAPI.navigate(nome)`) para redimensionar a janela segundo `APP_SIZES`.

O botão **Menu** de cada módulo faz o caminho inverso (`../index.html`).

## Comunicação desktop: IPC

O `preload.js` expõe à página, com segurança (`contextBridge`), só estas funções:

| Função | Faz |
|---|---|
| `navigate(app)` | Redimensiona a janela para o módulo |
| `closeApp()` | Fecha o app |
| `detectLocation()` | Descobre a cidade pelo IP (ipwho.is) |
| `searchCities(q)` / `getCityCoords()` | Busca cidades do Brasil (IBGE + Nominatim) — Astra |
| `searchCitiesNominatim(q)` | Busca cidades no mundo (Nominatim) — Horae, Shem, Tattvas |
| `savePdf()` | Salva PDF (reservado; a Geomantia hoje imprime pela janela do navegador) |

A página nunca acessa o Node diretamente (`nodeIntegration: false`, `contextIsolation: true`).

## Comunicação Android: plugin WidgetBridge

Os widgets são código nativo e não leem o `localStorage` da página. Para eles saberem a
cidade escolhida, a página chama um plugin do Capacitor escrito em Java
(`WidgetBridge.java`), que grava a latitude e a longitude em `SharedPreferences` e manda o
widget se redesenhar.

```js
// na página (ex.: shem.js)
const bridge = Capacitor.Plugins.WidgetBridge || Capacitor.registerPlugin('WidgetBridge');
bridge.setShemLocation({ lat, lon, name });
```

```java
// no Java (WidgetBridge.java)
@PluginMethod
public void setShemLocation(PluginCall call) { ... prefs.putFloat("lat", ...); ShemWidget.atualizarTodos(ctx); }
```

O plugin é registrado em `MainActivity.java` (`registerPlugin(WidgetBridge.class)`).

## Onde cada módulo guarda dados

Tudo fica no `localStorage` da página (não há servidor nem banco de dados):

| Chave | Módulo | Conteúdo |
|---|---|---|
| `astra_location` | Astra | `{name, state, lat, lon}` |
| `hp_localizacao` | Horae | `{lat, lon, cidade, estado, pais}` |
| `shem_localizacao` | Shem | idem |
| `tattva_localizacao` | Tattvas | idem |

Na primeira vez, Shem e Tattvas aproveitam a cidade já salva por outro módulo.

No Android, cada widget tem suas `SharedPreferences`: `astra_widget_prefs`,
`horas_widget_prefs`, `shem_widget_prefs`, `tattva_widget_prefs`.

## Mapa de arquivos importantes

| Arquivo | Papel |
|---|---|
| `main.js` | Janela, tamanhos por módulo (`APP_SIZES`), IPC de rede |
| `renderer/astra/astro.js` | Motor astronômico + desenho do mapa (Astra) |
| `renderer/horae/horas.js` | Nascer/pôr do sol e horas planetárias |
| `renderer/shem/shem.js` | 72 anjos, Ascendente, busca eletiva |
| `renderer/shem/dados.js` | Versículos, coros, correspondências da GD |
| `renderer/tattvas/tattvas.js` | Marés tattvicas |
| `renderer/geomantia/geo.js` | Geomancia (figuras, escudo, casas, PDF) |
| `android/android/.../Ephemeris.java` | Motor astronômico em Java (para os widgets) |
| `android/android/.../*Widget.java` | Um arquivo por widget |
| `android/android/.../WidgetBridge.java` | Ponte JS → widgets |
| `android/android/app/src/main/AndroidManifest.xml` | Registro dos widgets e permissões |
