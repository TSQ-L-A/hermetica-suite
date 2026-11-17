# 13. O que vai e o que não vai para o Git

Existe uma cópia pronta para publicar, só com o que pode ir para o Git:

```
Projetos de Apps/hermetica-suite-github/
```

Ela tem 1,9 MB (o projeto de trabalho tem ~700 MB, quase tudo arquivos gerados). Já vem com o
`.gitignore` e o `README.md` da raiz. Foi testada: copiada para outra pasta, rodando
`npx cap sync` e o Gradle, gera o APK normalmente.

## ✅ O que VAI (está na cópia)

| Caminho | O que é |
|---|---|
| `main.js`, `preload.js` | Processo principal do Electron e a ponte com a página |
| `package.json` | Lista de dependências do desktop (o `npm install` lê daqui) |
| `electron-builder.yml` | Configuração do empacotamento desktop |
| `renderer/` | Páginas da versão desktop |
| `assets/` | Ícones do app |
| `docs/` | Esta documentação |
| `README.md`, `.gitignore` | Apresentação do projeto e regras do que o Git ignora |
| `android/package.json` | Dependências do Capacitor |
| `android/capacitor.config.json` | Nome e identificador do app Android |
| `android/www/` | Páginas da versão Android (**o original**) |
| `android/android/app/src/main/java/` | Código Java: widgets, `Ephemeris`, `WidgetBridge`, `MainActivity` |
| `android/android/app/src/main/res/` | Layouts, ícones, textos e configuração dos widgets |
| `android/android/app/src/main/AndroidManifest.xml` | Registro dos widgets e permissões |
| `android/android/app/build.gradle` e demais `*.gradle` | Configuração de build do Android |
| `android/android/gradlew`, `gradlew.bat`, `gradle/wrapper/` | O "Gradle portátil": quem clonar não precisa instalar o Gradle |
| `android/android/gradle.properties`, `proguard-rules.pro` | Ajustes de build |

## ❌ O que NÃO VAI (e por quê)

| Caminho | Motivo |
|---|---|
| `node_modules/` (raiz e `android/`) | Dependências baixadas; o `npm install` recria. São centenas de MB |
| `dist/` | App de desktop já compilado (AppImage, .exe) |
| `*.apk`, `*.aab` | App Android compilado. Para distribuir, use as *Releases* do GitHub |
| `android/android/build/`, `app/build/`, `.gradle/` | Arquivos temporários do Gradle |
| `android/android/local.properties` | Caminho do Android SDK **no seu computador** |
| `android/android/.idea/`, `*.iml` | Configurações pessoais do Android Studio |
| `android/android/app/src/main/assets/public/` | **Cópia** de `android/www/` feita pelo `npx cap copy`. O original vai; a cópia não |
| `assets/capacitor.config.json`, `capacitor.plugins.json`, `res/xml/config.xml` | Gerados pelo `npx cap sync` |
| `android/android/capacitor-cordova-android-plugins/` | Gerado pelo `npx cap sync` |
| **`Keys/`, `*.jks`, `*.keystore`** | **Chave de assinatura da Play Store. Nunca publique.** Quem tem a chave pode publicar atualizações em seu nome |

A pasta `Keys/` fica fora do projeto e não foi copiada. Na verificação não apareceu nenhuma
senha, chave ou arquivo `google-services.json` dentro do projeto.

## Quem clonar o repositório roda

```bash
npm install                  # desktop
npm start

cd android
npm install
npx cap sync android         # recria assets/public, config.xml e os plugins
cd android
./gradlew assembleDebug      # o Android Studio cria o local.properties sozinho;
                             # sem ele, crie com: sdk.dir=/caminho/para/Android/Sdk
```

## Como publicar a partir da cópia limpa

```bash
cd "Projetos de Apps/hermetica-suite-github"
git init
git add .
git status        # confira a lista antes do commit
git commit -m "Primeira versão da Hermetica Suite"
gh repo create hermetica-suite --public --source=. --push
```

Antes do `git add .`, escolha e crie o arquivo `LICENSE` (ver
[Publicar no GitHub](10-publicar-no-github.md)).

## Atenção: a cópia não se atualiza sozinha

A cópia limpa é uma fotografia do projeto em 17/11/2026. Se você mudar algo em `hermetica-suite/`,
precisa copiar de novo. O comando usado foi:

```bash
cd "Projetos de Apps"
rsync -a --delete \
  --exclude='.git/' \
  --exclude='node_modules' --exclude='/dist/' \
  --exclude='*.apk' --exclude='*.aab' --exclude='*.jks' --exclude='*.keystore' --exclude='*.p12' \
  --exclude='/android/android/.gradle/' --exclude='/android/android/build/' --exclude='/android/android/app/build/' \
  --exclude='/android/android/local.properties' --exclude='/android/android/.idea/' --exclude='*.iml' \
  --exclude='/android/android/capacitor-cordova-android-plugins/' \
  --exclude='/android/android/app/src/main/assets/public/' \
  --exclude='/android/android/app/src/main/assets/capacitor.config.json' \
  --exclude='/android/android/app/src/main/assets/capacitor.plugins.json' \
  --exclude='/android/android/app/src/main/res/xml/config.xml' \
  --exclude='/README.md' --exclude='/.gitignore' --exclude='/LICENSE' \
  hermetica-suite/ hermetica-suite-github/
```

O `--delete` apaga na cópia o que você apagou no original. Os `--exclude` de `README.md`,
`.gitignore`, `LICENSE` e `.git/` protegem os arquivos que só existem na cópia.

**Alternativa mais simples a longo prazo:** depois de publicar, passe a trabalhar direto na
pasta do repositório. O `.gitignore` já impede que os arquivos gerados entrem nos commits, e você
não precisa mais manter duas pastas.
