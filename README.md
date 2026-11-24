# FUTBOL

Manager de futebol brasileiro com partida em 3D — https://ondasites.com.br/futbol
Página de apresentação — https://ondasites.com.br/futbol/conheca

## Estrutura
- `src/` — código do jogo (é juntado num único `index.html` pelo `build.py`)
- `3d/` — motor 3D, modelos e animações
- `api/` — API em PHP (contas, saves na nuvem, modo online)
- `conheca/` — hotsite
- `pwa/` — ícones, manifest e service worker (vão para a raiz do site)

## Publicação
Todo push na branch `main` roda `.github/workflows/publicar.yml`:
1. `python build.py` gera a pasta `public/`
2. a pasta é enviada por FTP para `public_html/futbol` (só os arquivos que mudaram)

O banco de dados fica **fora** de `public_html` (`onzemanager-data/`) e nunca é enviado nem apagado.

Segredos necessários (Settings → Secrets and variables → Actions):
`FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`.

Para voltar uma versão: reverter o commit e dar push (ou rodar o workflow manualmente).
