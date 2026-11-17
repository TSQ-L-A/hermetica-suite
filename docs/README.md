# Hermetica Suite — Documentação

Suíte de ferramentas para praticantes da tradição da Golden Dawn, para desktop (Electron)
e Android (Capacitor), com widgets nativos para a tela inicial do Android.

| Módulo | O que faz |
|---|---|
| **Astra Hermetica** | Mapa astral em tempo real e eletivo (casas de Plácido, aspectos, fase da Lua) |
| **Geomantia Hermetica** | Geração do escudo geomântico e do mapa nas casas, com exportação em PDF |
| **Horae Hermetica** | Horas planetárias do dia |
| **Shem HaMephorash** | Os 72 anjos: anjo do momento (Ascendente), anjo dos dias (Sol), ficha e busca eletiva |
| **Tattvas** | Marés tattvicas: Tattva e sub-Tattva do momento e tabela do dia |

## Para quem está aprendendo

Comece pelo **[Tutorial passo a passo](tutorial-passo-a-passo.md)**: ele constrói, do zero e em
versão mínima, cada peça deste app (página, desktop, Android, widget em Java). Depois volte para
os documentos abaixo, que explicam o código real.

## Como ler esta documentação

Os documentos estão em ordem de estudo. Os primeiros dão o mapa geral; os do meio explicam
cada módulo e os cálculos por trás; os últimos tratam de build, publicação e fontes.

1. [Arquitetura](01-arquitetura.md) — como o projeto está organizado e como as partes conversam
2. [Motor astronômico](02-motor-astronomico.md) — o coração dos cálculos (planetas, Lua, casas)
3. [Astra Hermetica](03-astra.md)
4. [Horae Hermetica](04-horae.md)
5. [Shem HaMephorash](05-shem.md)
6. [Tattvas](06-tattvas.md)
7. [Geomantia Hermetica](07-geomantia.md)
8. [Widgets do Android](08-widgets-android.md)
9. [Build e execução](09-build.md)
10. [Publicar no GitHub](10-publicar-no-github.md)
11. [Fontes e referências](11-fontes.md)
12. [Histórico de correções](12-historico.md)
13. [O que vai e o que não vai para o Git](13-o-que-vai-pro-git.md) — e a cópia limpa pronta para publicar

## Visão rápida da pasta

```
hermetica-suite/
├── main.js              ← processo principal do Electron (janela, IPC, rede)
├── preload.js           ← ponte segura entre a página e o Electron
├── renderer/            ← páginas da versão desktop (um diretório por módulo)
├── android/
│   ├── www/             ← páginas da versão Android (cópia adaptada de renderer/)
│   └── android/         ← projeto Android nativo (Gradle, widgets em Java)
├── assets/              ← ícones
└── docs/                ← esta documentação
```

## Princípios do projeto

- **Sem dependências de cálculo externas.** Toda a astronomia é implementada no próprio código,
  a partir de fórmulas publicadas (Meeus, JPL). Isso mantém o app leve e funcionando offline.
- **Cada módulo é independente.** Cada página tem o seu próprio HTML, CSS e JS, sem framework.
  Um módulo não depende de outro (o único compartilhamento é a cidade inicial salva).
- **O mesmo cálculo no app e no widget.** Os widgets Android são em Java; os algoritmos foram
  portados linha a linha do JavaScript e conferidos para dar o mesmo resultado.
