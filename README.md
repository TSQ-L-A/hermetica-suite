# Hermetica Suite

Ferramentas para praticantes da tradição da Golden Dawn — desktop (Electron) e Android (Capacitor),
com widgets para a tela inicial do Android.

- **Astra Hermetica** — mapa astral em tempo real e eletivo (Plácido, aspectos, fase da Lua)
- **Geomantia Hermetica** — escudo geomântico e mapa nas casas, com PDF
- **Horae Hermetica** — horas planetárias
- **Shem HaMephorash** — os 72 anjos do momento (Ascendente) e dos dias (Sol)
- **Tattvas** — marés tattvicas

Cálculos astronômicos próprios (Meeus, JPL), sem bibliotecas externas, funcionando offline.

## Rodar

```bash
# desktop
npm install
npm start

# Android
cd android
npm install
npx cap sync android
cd android && ./gradlew assembleDebug
```

## Documentação

Tudo em [docs/](docs/README.md), incluindo um [tutorial passo a passo](docs/tutorial-passo-a-passo.md)
para quem está aprendendo.
