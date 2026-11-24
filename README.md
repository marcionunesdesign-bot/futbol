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
Todo push na branch `main` roda `.github/workflows/publicar.yml`, que executa `python build.py` e grava a pasta `public/` na branch `publicado`.

No HostGator, um cron roda `servidor/futbol-sync.sh` a cada 5 minutos: se a branch `publicado` mudou, copia os arquivos para `public_html/futbol`. Não há senha em lugar nenhum. O script só substitui arquivos, nunca apaga.

O banco de dados fica **fora** de `public_html` (`onzemanager-data/`) e nunca é tocado.

Log das publicações no servidor: `~/futbol-sync.log`.

Para voltar uma versão: reverta o commit na `main` e dê push.
