#!/bin/bash
# Roda no HostGator pelo cron (a cada 5 min): se a branch "publicado" mudou, copia para public_html/futbol.
# Só copia/substitui arquivos; nunca apaga nada no servidor. O banco de dados fica fora de public_html.
H=/home1/ondasite
export HOME="$H"
export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"
R="$H/futbol-publicado"
D="$H/public_html/futbol"
L="$H/futbol-sync.log"
U="https://github.com/marcionunesdesign-bot/futbol.git"
if [ ! -d "$R/.git" ]; then
  if ! git clone -q --depth 1 -b publicado "$U" "$R" >>"$L" 2>&1; then
    echo "$(date '+%F %T') ERRO no clone" >>"$L"
    exit 1
  fi
else
  cd "$R" || exit 1
  if ! git fetch -q --depth 1 origin publicado >>"$L" 2>&1; then
    echo "$(date '+%F %T') ERRO ao buscar" >>"$L"
    exit 1
  fi
  git reset -q --hard origin/publicado >>"$L" 2>&1
fi
cd "$R" || exit 1
NEW=$(git rev-parse HEAD)
OLD=$(cat "$H/.futbol-publicado" 2>/dev/null)
if [ "$NEW" = "$OLD" ]; then
  exit 0
fi
if command -v rsync >/dev/null 2>&1; then
  rsync -a --exclude .git ./ "$D"/
else
  for f in $(ls -A | grep -v '^\.git$'); do
    cp -a "$f" "$D"/
  done
fi
echo "$NEW" > "$H/.futbol-publicado"
echo "$(date '+%F %T') publicado: $(git log -1 --format=%s)" >>"$L"
