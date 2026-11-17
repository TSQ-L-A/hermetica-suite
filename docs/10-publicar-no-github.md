# 10. Publicar no GitHub

Guia para quando você quiser publicar o projeto. A pasta `hermetica-suite` ainda não é um
repositório git.

**Atalho:** já existe uma cópia limpa, pronta para publicar, em `Projetos de Apps/hermetica-suite-github/`,
com `.gitignore` e `README.md` prontos. Veja [O que vai para o Git](13-o-que-vai-pro-git.md).

## 1. Antes de tudo: o que NÃO pode ir para o GitHub

| Item | Por quê |
|---|---|
| `Keys/` e qualquer `*.jks` / `*.keystore` | É a chave que prova que o app é seu na Play Store. Se vazar, outra pessoa pode publicar atualizações falsas |
| Senhas de assinatura | Idem |
| `android/android/local.properties` | Caminho do SDK no seu computador |
| `node_modules/`, `dist/`, `build/`, `*.apk` | Gerados automaticamente; enormes e inúteis no repositório |

A pasta `Keys/` está fora de `hermetica-suite/`, o que já ajuda. Mantenha assim.

## 2. Criar o `.gitignore`

Crie `hermetica-suite/.gitignore` com:

```gitignore
# Dependências e builds
node_modules/
dist/
*.apk
*.aab

# Android
android/android/.gradle/
android/android/build/
android/android/app/build/
android/android/local.properties
android/android/app/src/main/assets/public/
android/android/app/src/main/assets/capacitor.config.json
android/android/capacitor-cordova-android-plugins/build/

# Chaves e segredos
*.jks
*.keystore
keystore.properties

# Sistema
.DS_Store
Thumbs.db
```

(`assets/public/` é a cópia gerada por `npx cap copy`; o original está em `android/www/`.)

## 3. Escolher uma licença

Sem licença, ninguém pode legalmente reutilizar o código, mesmo vendo-o. As opções mais comuns:

- **MIT** — qualquer um pode usar, inclusive em projetos fechados, desde que mantenha o seu nome.
- **GPL-3.0** — qualquer um pode usar, mas quem distribuir uma versão modificada precisa abrir
  o código também.

Crie o arquivo `LICENSE` na raiz (o GitHub oferece modelos ao criar o repositório).

## 4. README da raiz

O GitHub mostra o `README.md` da raiz na página do projeto. Um modelo:

```markdown
# Hermetica Suite

Ferramentas para praticantes da tradição da Golden Dawn — desktop (Electron) e Android.

- **Astra Hermetica** — mapa astral em tempo real e eletivo
- **Geomantia Hermetica** — escudo geomântico e mapa nas casas
- **Horae Hermetica** — horas planetárias
- **Shem HaMephorash** — os 72 anjos do momento e dos dias
- **Tattvas** — marés tattvicas

Cálculos astronômicos próprios (Meeus, JPL), sem dependências externas, funcionando offline.

Documentação completa em [docs/](docs/README.md).

## Licença
MIT — veja LICENSE.
```

Capturas de tela ajudam muito: crie `docs/img/` e coloque-as no README.

## 5. Criar o repositório e enviar

```bash
cd "hermetica-suite"
git init
git add .
git status                 # confira: NADA de keystore, node_modules ou APK na lista
git commit -m "Primeira versão da Hermetica Suite"

# com a ferramenta gh (GitHub CLI), já autenticada:
gh repo create hermetica-suite --public --source=. --push
```

Sem o `gh`: crie o repositório vazio no site do GitHub e siga as instruções que ele mostra
(`git remote add origin …` e `git push -u origin main`).

## 6. Distribuir o APK

Em vez de colocar o APK no repositório, use a aba **Releases** do GitHub: crie uma versão
(ex.: `v1.0`) e anexe o APK assinado. Assim quem quiser instalar baixa de lá.

## Observação sobre o conteúdo

Os versículos traduzidos do Shem vêm da Apostila Complementar de Cabala, e as correspondências
seguem a tradição da Golden Dawn (ver [Fontes](11-fontes.md)). Vale citar as fontes no README.
