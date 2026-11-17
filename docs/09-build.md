# 9. Build e execução

## Ferramentas necessárias

| Ferramenta | Para quê |
|---|---|
| Node.js + npm | Electron, Capacitor e scripts |
| JDK 17 ou mais novo | Compilar o Android (o projeto foi compilado com o JDK 21) |
| Android SDK (plataforma 34) | Compilar o Android; o caminho fica em `android/android/local.properties` |

## Desktop (Electron)

Na pasta `hermetica-suite/`:

```bash
npm install            # baixa Electron e electron-builder (primeira vez)
npm start              # abre o app em modo de desenvolvimento
npm run build:linux    # gera AppImage em dist/
npm run build:win      # gera executável portátil do Windows em dist/
```

Configuração do empacotamento: `electron-builder.yml`.

## Android (Capacitor)

Na pasta `hermetica-suite/android/`:

```bash
npm install                 # primeira vez
npx cap copy android        # copia www/ para dentro do projeto Android
cd android
./gradlew assembleDebug     # gera o APK de teste
```

APK gerado: `android/android/app/build/outputs/apk/debug/Hermetica-debug.apk`.

**Sempre rode `npx cap copy android` depois de mudar algo em `www/`.** O APK usa a cópia em
`android/app/src/main/assets/public/`, não a pasta `www/` diretamente. Mudanças só em Java
não precisam do `cap copy`.

Para instalar direto num celular conectado por USB (com depuração USB ligada):

```bash
adb install -r app/build/outputs/apk/debug/Hermetica-debug.apk
```

### Versão de publicação (release)

O APK de debug é assinado com uma chave de teste. Para a Play Store é preciso:

1. Aumentar `versionCode` (e `versionName`) em `android/android/app/build.gradle` a cada envio.
2. Assinar com a chave de upload (keystore). Ela fica **fora** do repositório, na pasta `Keys/`.
3. Gerar o pacote: `./gradlew bundleRelease` (AAB, formato exigido pela Play Store).

A senha e o caminho da keystore podem ir em `~/.gradle/gradle.properties` (fora do projeto),
lidos por um `signingConfigs` no `build.gradle`. Nunca coloque a senha no repositório.

## Testar cálculos sem abrir o app

Os arquivos de cálculo são JavaScript puro. Dá para testá-los no Node, ignorando a parte de
tela. Exemplo para o Shem:

```js
const fs = require('fs');
const src = fs.readFileSync('android/www/shem/shem.js', 'utf8')
  .replace(/document\.addEventListener\('DOMContentLoaded'[\s\S]*$/, '');  // remove a parte de UI
eval(src + ';globalThis.T = { calcDia, anjoInfo };');
console.log(T.anjoInfo(57));   // Yeialel
```

Rode com `TZ=America/Sao_Paulo node teste.js` para fixar o fuso horário.
