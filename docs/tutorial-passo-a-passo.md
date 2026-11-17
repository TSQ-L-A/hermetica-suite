# Tutorial: como construir um app como o Hermetica, do zero

Este tutorial refaz, em versão mínima, cada peça da Hermetica Suite. A ideia é você **digitar**
o código (não copiar e colar) e entender cada linha antes de seguir. No fim de cada etapa há
exercícios; não pule.

Ao terminar, você terá construído:

1. uma página que calcula o nascer do sol e a hora planetária;
2. um app de desktop com essa página (Electron);
3. um menu com vários módulos;
4. um app Android com as mesmas páginas (Capacitor);
5. um widget de tela inicial em Java;
6. a ponte que manda dados da página para o widget.

Tempo estimado: algumas semanas, estudando com calma.

---

## Etapa 0 — Os conceitos

### As três linguagens da web

Toda tela do Hermetica é uma página web, feita com três linguagens que trabalham juntas:

| Linguagem | Responsável por | Analogia |
|---|---|---|
| **HTML** | a estrutura: que elementos existem (título, botão, tabela) | o esqueleto |
| **CSS** | a aparência: cores, tamanhos, posições | a roupa |
| **JavaScript (JS)** | o comportamento: cálculos, reagir a cliques, atualizar a tela | o cérebro |

### E o Java?

**Java não é JavaScript.** Os nomes se parecem por uma decisão de marketing dos anos 1990, mas
são linguagens diferentes. No Hermetica:

- **JavaScript**: quase tudo (telas e cálculos).
- **Java**: só os widgets do Android, porque o Android exige código nativo para eles.

### As "cascas"

Uma página web sozinha roda no navegador. Para virar app, ela precisa de uma casca:

- **Electron** (desktop): um programa que traz um navegador embutido e abre a sua página numa
  janela própria. Programas como o VS Code e o Discord são feitos assim.
- **Capacitor** (Android/iOS): cria um app nativo cuja tela é um navegador embutido (WebView)
  mostrando a sua página.

Vantagem: o mesmo código de tela serve para desktop e celular.

---

## Etapa 1 — Instalar as ferramentas

No seu sistema (CachyOS, baseado em Arch):

```bash
sudo pacman -S nodejs npm jdk17-openjdk git
```

- **Node.js** roda JavaScript fora do navegador e traz o **npm**, o gerenciador de pacotes.
- **JDK** é o kit para compilar Java (necessário para o Android).
- **git** controla versões do código.

Para o Android, instale o **Android Studio** (pelo AUR: `yay -S android-studio`) e, na primeira
abertura, deixe-o baixar o SDK. Ele fica em `~/Android/Sdk`.

Editor recomendado: **VS Code** (`yay -S visual-studio-code-bin`).

Confira:

```bash
node --version    # deve mostrar v20 ou mais novo
npm --version
java --version
```

---

## Etapa 2 — Sua primeira página: um relógio

Crie uma pasta `meu-hermetica/www/` e, dentro dela, três arquivos.

**`www/index.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Meu Hermetica</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <h1>Horae</h1>
  <p>Agora: <span id="relogio">--:--:--</span></p>
  <script src="app.js"></script>
</body>
</html>
```

- `<link>` carrega o CSS; `<script>` carrega o JS.
- `id="relogio"` dá um nome ao elemento, para o JS encontrá-lo.

**`www/style.css`**

```css
body {
  font-family: Georgia, serif;
  background: #f0ece4;
  color: #1a1820;
  padding: 20px;
}
h1 { color: #8a6a1a; letter-spacing: 3px; }
#relogio { font-weight: bold; }
```

**`www/app.js`**

```js
'use strict';

function atualizarRelogio() {
  const agora = new Date();
  const hh = String(agora.getHours()).padStart(2, '0');
  const mm = String(agora.getMinutes()).padStart(2, '0');
  const ss = String(agora.getSeconds()).padStart(2, '0');
  document.getElementById('relogio').textContent = `${hh}:${mm}:${ss}`;
}

atualizarRelogio();
setInterval(atualizarRelogio, 1000);   // repete a cada 1000 ms
```

Abra o `index.html` no navegador (duplo clique). O relógio deve andar.

**O que aprender aqui:**
- `new Date()` dá a data e a hora atuais.
- `padStart(2, '0')` transforma `7` em `"07"`.
- `` `${a}:${b}` `` é uma *template string*: texto com valores dentro.
- `document.getElementById(...)` pega um elemento do HTML; `.textContent` troca o texto dele.
- `setInterval(funcao, ms)` chama a função repetidamente.

**Ferramenta essencial:** aperte **F12** no navegador. A aba *Console* mostra erros e deixa
você testar JavaScript; a aba *Elements* mostra o HTML e o CSS vivos.

**Exercícios**
1. Mostre também a data (dia/mês/ano).
2. Faça o relógio ficar vermelho quando os segundos forem 0 (dica: `element.style.color`).

---

## Etapa 3 — Um cálculo de verdade: nascer do sol e hora planetária

Agora a lógica do Horae. Adicione ao `app.js`:

```js
const LAT = -22.9068, LON = -43.1729;   // Rio de Janeiro (sul e oeste são negativos)

// Nascer e pôr do sol em minutos desde a meia-noite (algoritmo NOAA simplificado)
function nascerPor(lat, lon, data) {
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const JD = data.getTime() / 86400000 + 2440587.5;           // data juliana
  const T  = (JD - 2451545.0) / 36525;                         // séculos desde 2000
  const L0 = (280.46646 + 36000.76983 * T) % 360;              // longitude média do Sol
  const M  = ((357.52911 + 35999.05029 * T) % 360) * rad;      // anomalia média
  const C  = 1.914602 * Math.sin(M) + 0.019993 * Math.sin(2 * M);
  const e  = 23.439291 * rad;                                  // inclinação do eixo
  const decl = Math.asin(Math.sin(e) * Math.sin((L0 + C) * rad)) * deg;

  // equação do tempo (minutos)
  const y = Math.tan(e / 2) ** 2, L = L0 * rad;
  const EqT = 4 * deg * (y * Math.sin(2 * L) - 2 * 0.016708634 * Math.sin(M));

  const cosH = (Math.cos(90.833 * rad) - Math.sin(lat * rad) * Math.sin(decl * rad))
             / (Math.cos(lat * rad) * Math.cos(decl * rad));
  const H = Math.acos(cosH) * deg;
  const fuso = -data.getTimezoneOffset();                      // em minutos
  return {
    nascer: 720 - 4 * (lon + H) - EqT + fuso,
    por:    720 - 4 * (lon - H) - EqT + fuso,
  };
}

const CALDEIA = ['Saturno', 'Júpiter', 'Marte', 'Sol', 'Vênus', 'Mercúrio', 'Lua'];
const REGENTE_SEMANA = ['Sol', 'Lua', 'Marte', 'Mercúrio', 'Júpiter', 'Vênus', 'Saturno'];

function horaPlanetaria(agora) {
  const meiaNoite = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const { nascer, por } = nascerPor(LAT, LON, meiaNoite);
  const minutos = (agora - meiaNoite) / 60000;

  // (versão simplificada: só trata o período entre o nascer e o pôr de hoje)
  if (minutos < nascer || minutos >= por) return 'noite (exercício!)';

  const duracao = (por - nascer) / 12;
  const n = Math.floor((minutos - nascer) / duracao);          // 0 a 11
  const inicio = CALDEIA.indexOf(REGENTE_SEMANA[agora.getDay()]);
  return `Hora ${n + 1} — ${CALDEIA[(inicio + n) % 7]}`;
}
```

E no HTML, uma linha nova: `<p>Hora planetária: <span id="hora">—</span></p>`.
Dentro de `atualizarRelogio`, acrescente:

```js
document.getElementById('hora').textContent = horaPlanetaria(new Date());
```

**Como estudar este código:** não tente decorar as fórmulas. Entenda o caminho:
data → posição do Sol → declinação → ângulo do nascer → minutos. Cada fórmula vem de um livro
(Meeus) ou de uma fonte confiável (NOAA). Programar cálculos astronômicos é, em grande parte,
**traduzir fórmulas publicadas para código e testar contra uma referência**.

**Exercícios**
1. Mostre o nascer e o pôr do sol formatados como `HH:MM`.
2. Complete a noite: depois do pôr, as horas vão do pôr até o nascer de amanhã; antes do
   nascer, ainda vale a noite de ontem. Compare com `docs/04-horae.md`.
3. Confira o seu resultado com um site de horas planetárias.

---

## Etapa 4 — Virar app de desktop (Electron)

Na pasta `meu-hermetica/`:

```bash
npm init -y                       # cria o package.json
npm install --save-dev electron   # baixa o Electron
```

Crie **`main.js`** (na raiz, fora de `www/`):

```js
'use strict';
const { app, BrowserWindow } = require('electron');
const path = require('path');

function criarJanela() {
  const janela = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      contextIsolation: true,     // a página não acessa o Node diretamente (segurança)
      nodeIntegration: false,
    },
  });
  janela.loadFile(path.join(__dirname, 'www', 'index.html'));
}

app.whenReady().then(criarJanela);
app.on('window-all-closed', () => app.quit());
```

No `package.json`, ajuste:

```json
"main": "main.js",
"scripts": { "start": "electron ." }
```

Rode `npm start`. A sua página abre numa janela. **Ctrl+Shift+I** abre o mesmo F12 do navegador.

**Dois mundos:** `main.js` roda no Node (tem acesso a arquivos, rede, sistema). A página roda
no navegador embutido (só HTML/CSS/JS). Por segurança, eles ficam separados.

**Exercícios**
1. Tire a moldura da janela (`frame: false`) e crie um botão ✕ na página que fecha o app.
   Você vai precisar da etapa seguinte (IPC).

---

## Etapa 5 — Página e Electron conversando (preload e IPC)

Quando a página precisa de algo do sistema (fechar a janela, salvar arquivo), ela pede ao
`main.js` por mensagens: **IPC**. O **preload** é o porteiro que decide o que a página pode pedir.

**`preload.js`**

```js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  fechar: () => ipcRenderer.send('fechar'),
});
```

No `main.js`, dentro de `webPreferences`, acrescente `preload: path.join(__dirname, 'preload.js')`,
e no fim do arquivo:

```js
const { ipcMain } = require('electron');
ipcMain.on('fechar', () => app.quit());
```

Na página:

```html
<button id="btn-fechar">✕</button>
```

```js
document.getElementById('btn-fechar').addEventListener('click', () => {
  if (window.electronAPI) window.electronAPI.fechar();   // só existe no desktop
});
```

O `if (window.electronAPI)` é o mesmo truque do Hermetica: a página funciona no navegador, no
desktop e no Android, e usa recursos extras só quando eles existem.

---

## Etapa 6 — Um menu com vários módulos

Organize assim:

```
www/
├── index.html        ← menu
├── horae/index.html  ← o que você fez até agora (mova os arquivos para cá)
└── tattvas/index.html
```

**`www/index.html`** (menu):

```html
<h1>✦ MEU HERMETICA</h1>
<button class="card" data-page="horae/index.html">♄ Horae</button>
<button class="card" data-page="tattvas/index.html">△ Tattvas</button>
<script>
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => { window.location.href = card.dataset.page; });
  });
</script>
```

- `data-page="..."` guarda um dado no elemento; o JS lê com `card.dataset.page`.
- Em cada módulo, um botão "Menu" volta com `window.location.href = '../index.html'`.

**Exercício — o seu módulo Tattvas.** Com o nascer do sol da etapa 3, mostre o Tattva atual.
A partir do nascer: Akasha, Vayu, Tejas, Prithivi, Apas, 24 minutos cada, repetindo.
Dica: `Math.floor(minutosDesdeONascer / 24) % 5`. Depois compare com `docs/06-tattvas.md`.

---

## Etapa 7 — Guardar a escolha do usuário (localStorage)

Para lembrar a cidade escolhida entre uma abertura e outra:

```js
// salvar
localStorage.setItem('minha_cidade', JSON.stringify({ nome: 'Rio', lat: -22.9, lon: -43.17 }));

// ler (na próxima vez que abrir)
const salva = JSON.parse(localStorage.getItem('minha_cidade') || 'null');
if (salva) { /* usar salva.lat, salva.lon */ }
```

`localStorage` só guarda texto; `JSON.stringify` transforma objeto em texto e `JSON.parse`
faz o contrário.

**Exercício:** um `<select>` com três cidades que, ao mudar, salva a escolha e recalcula.

---

## Etapa 8 — Virar app Android (Capacitor)

Crie uma pasta separada `meu-hermetica-android/` e copie a sua `www/` para dentro. Nela:

```bash
npm init -y
npm install @capacitor/core @capacitor/android
npm install --save-dev @capacitor/cli
npx cap init "Meu Hermetica" com.seunome.meuhermetica --web-dir www
npx cap add android            # cria a pasta android/ com o projeto nativo
npx cap copy android           # copia www/ para dentro do projeto Android
cd android
./gradlew assembleDebug        # compila o APK
```

O APK fica em `android/app/build/outputs/apk/debug/`. Para instalar no celular (com
"depuração USB" ligada nas opções de desenvolvedor):

```bash
~/Android/Sdk/platform-tools/adb install -r app/build/outputs/apk/debug/app-debug.apk
```

**Regra de ouro:** toda vez que mudar algo em `www/`, rode `npx cap copy android` antes de
compilar. O Android usa a cópia, não o original.

**Depurar no celular:** com o celular no USB e o app aberto, entre em `chrome://inspect` no
Chrome do computador. Você ganha o F12 da página que está rodando no celular.

**Exercício:** ajuste o CSS para a tela do celular com uma *media query*:

```css
@media (max-width: 420px) {
  h1 { font-size: 16px; }
}
```

---

## Etapa 9 — Um widget de tela inicial (Java)

Aqui entra o Java. Abra `meu-hermetica-android/android/` no Android Studio, que ajuda com os
erros de Java.

Um widget precisa de quatro peças.

**1. O layout** — `app/src/main/res/layout/widget_hora.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<FrameLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent">
    <TextView
        android:id="@+id/texto"
        android:layout_width="match_parent"
        android:layout_height="match_parent"
        android:gravity="center"
        android:background="#e4dece"
        android:textColor="#1a1820"
        android:textSize="20sp" />
</FrameLayout>
```

**2. A configuração** — `app/src/main/res/xml/widget_hora_info.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="250dp"
    android:minHeight="60dp"
    android:updatePeriodMillis="1800000"
    android:initialLayout="@layout/widget_hora"
    android:widgetCategory="home_screen" />
```

**3. A classe Java** — `app/src/main/java/com/seunome/meuhermetica/HoraWidget.java`:

```java
package com.seunome.meuhermetica;

import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.widget.RemoteViews;

import java.util.Calendar;

public class HoraWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        Calendar agora = Calendar.getInstance();
        String texto = String.format("%02d:%02d", agora.get(Calendar.HOUR_OF_DAY), agora.get(Calendar.MINUTE));

        for (int id : ids) {
            RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.widget_hora);
            views.setTextViewText(R.id.texto, "Atualizado às " + texto);
            manager.updateAppWidget(id, views);
        }
    }
}
```

**4. O registro** — em `app/src/main/AndroidManifest.xml`, dentro de `<application>`:

```xml
<receiver android:name=".HoraWidget" android:exported="true">
    <intent-filter>
        <action android:name="android.appwidget.action.APPWIDGET_UPDATE" />
    </intent-filter>
    <meta-data
        android:name="android.appwidget.provider"
        android:resource="@xml/widget_hora_info" />
</receiver>
```

Compile, instale e adicione o widget na tela inicial (toque longo → Widgets).

**Java em 5 minutos (para ler o código acima):**
- Todo código fica dentro de uma `class`; `extends` herda o comportamento de outra classe.
- Tipos são explícitos: `int`, `double`, `String`, `boolean`.
- `@Override` marca um método que substitui o da classe pai; o Android o chama no momento certo.
- `for (int id : ids)` percorre um array.
- Linhas terminam com `;`, blocos ficam entre `{ }` (parecido com JavaScript).

**Próximos passos (veja `docs/08-widgets-android.md`):**
1. Atualizar no momento certo com `AlarmManager` (o `updatePeriodMillis` só permite 30 min).
2. Desenhar com `Canvas` num `Bitmap`, como os widgets do Hermetica, em vez de usar `TextView`.
3. Portar o cálculo da hora planetária para Java (compare com `HorasWidget.java`).

---

## Etapa 10 — Página conversando com o widget (plugin do Capacitor)

O widget não lê o `localStorage` da página. A solução é um plugin: uma classe Java que a
página consegue chamar.

**`WidgetBridge.java`** (mesma pasta do widget):

```java
package com.seunome.meuhermetica;

import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "WidgetBridge")
public class WidgetBridge extends Plugin {

    @PluginMethod
    public void setCidade(PluginCall call) {
        Double lat = call.getDouble("lat"), lon = call.getDouble("lon");
        getContext().getSharedPreferences("widget_prefs", 0).edit()
            .putFloat("lat", lat.floatValue())
            .putFloat("lon", lon.floatValue())
            .apply();
        call.resolve();
    }
}
```

**Registrar** em `MainActivity.java`:

```java
package com.seunome.meuhermetica;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WidgetBridge.class);   // antes do super.onCreate
        super.onCreate(savedInstanceState);
    }
}
```

**Chamar** da página:

```js
const cap = window.Capacitor;
if (cap && cap.isNativePlatform()) {
  const bridge = cap.Plugins.WidgetBridge || cap.registerPlugin('WidgetBridge');
  bridge.setCidade({ lat: -22.9, lon: -43.17 });
}
```

**No widget**, leia de volta:

```java
android.content.SharedPreferences prefs = context.getSharedPreferences("widget_prefs", 0);
double lat = prefs.getFloat("lat", -23.55f);   // São Paulo como padrão
```

---

## Etapa 11 — Como trabalhar com cálculos sem se perder

Como foi feito no Hermetica:

1. **Ache a fonte.** Para astronomia, o livro do Meeus resolve quase tudo.
2. **Separe cálculo de tela.** Funções de cálculo recebem números e devolvem números, sem tocar
   no HTML. Assim dá para testá-las sozinhas.
3. **Teste no Node antes de ligar na tela:**
   ```js
   // teste.js
   const r = nascerPor(-22.9068, -43.1729, new Date(2026, 10, 17));
   console.log(r.nascer / 60);   // horas
   ```
   `node teste.js`
4. **Compare com uma referência** (um programa de astrologia, um site confiável) em várias datas
   e lugares, inclusive casos extremos (meia-noite, latitudes altas, virada de ano).
5. **Se portar para Java, compare as duas versões** com as mesmas entradas.

Foi assim que os erros do Astra foram encontrados: comparando, planeta por planeta, com o
Planetdance (ver `docs/12-historico.md`).

---

## Etapa 12 — Guardar o seu trabalho (git)

```bash
cd meu-hermetica
git init
git add .
git commit -m "Relógio e hora planetária"
```

Cada commit é uma "fotografia" do projeto. Se algo quebrar, dá para voltar
(`git log`, `git diff`, `git checkout`). Antes de publicar, leia `docs/10-publicar-no-github.md`.

---

## Para continuar estudando

| Assunto | Onde |
|---|---|
| HTML, CSS, JavaScript | MDN Web Docs (developer.mozilla.org), em português |
| Electron | electronjs.org/docs |
| Capacitor | capacitorjs.com/docs |
| Widgets do Android | developer.android.com → "App widgets" |
| Java básico | dev.java/learn |
| Astronomia | Jean Meeus, *Astronomical Algorithms* |

**Sugestão de roteiro:** depois deste tutorial, leia o código real na ordem
`renderer/horae/horas.js` → `renderer/tattvas/tattvas.js` → `renderer/shem/shem.js` →
`renderer/astra/astro.js`, acompanhando os documentos 04, 06, 05 e 02-03. Do mais simples para o
mais complexo.
