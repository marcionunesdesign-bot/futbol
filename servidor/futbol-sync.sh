#!/bin/bash
# Roda no HostGator pelo cron (a cada 5 min): se a branch "publicado" mudou, copia para public_html/futbol.
# Só copia/substitui arquivos; nunca apaga nada no servidor. O banco de dados fica fora de public_html.
R="$HOME/futbol-publicado"; D="$HOME/public_html/futbol"; L="$HOME/futbol-sync.log"
U="https://github.com/marcionunesdesign-bot/futbol.git"
if [ ! -d "$R/.git" ]; then
  git clone -q --depth 1 -b publicado "$U" "$R" >>"$L" 2>&1 || { echo "$(date '+%F %T') ERRO no clone" >>"$L"; exit 1; }
else
  cd "$R" && git fetch -q --depth 1 origin publicado >>"$L" 2>&1 && git reset -q --hard origin/publicado >>"$L" 2>&1 || { echo "$(date '+%F %T') ERRO ao buscar" >>"$L"; exit 1; }
fi
cd "$R" || exit 1
NEW=$(git rev-parse HEAD); OLD=$(cat "$HOME/.futbol-publicado" 2>/dev/null)
[ "$NEW" = "$OLD" ] && exit 0
if command -v rsync >/dev/null 2>&1; then rsync -a --exclude .git ./ "$D"/
else for f in $(ls -A | grep -v '^\.git$'); do cp -a "$f" "$D"/; done; fi
echo "$NEW" > "$HOME/.futbol-publicado"
echo "$(date '+%F %T') publicado: $(git log -1 --format=%s)" >>"$L"
