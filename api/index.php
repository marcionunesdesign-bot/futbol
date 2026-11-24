<?php
/* Onze Manager (Camisa 11) — API de contas e carreiras (SQLite fora do public_html) */
declare(strict_types=1);
date_default_timezone_set('America/Sao_Paulo');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function out($data, int $code = 200): never { http_response_code($code); echo json_encode($data, JSON_UNESCAPED_UNICODE); exit; }
function fail(string $msg, int $code = 400): never { out(['ok' => false, 'error' => $msg], $code); }

$dataDir = getenv('ONZE_DATA') ?: dirname(__DIR__, 3) . '/onzemanager-data';
if (!is_dir($dataDir) && !@mkdir($dataDir, 0700, true)) fail('Não foi possível criar a pasta de dados.', 500);
try {
  $db = new PDO('sqlite:' . $dataDir . '/onze.sqlite', null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
  $db->exec('PRAGMA busy_timeout = 5000; PRAGMA foreign_keys = ON;');
  $db->exec('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, pass TEXT NOT NULL, created INTEGER NOT NULL)');
  $db->exec('CREATE TABLE IF NOT EXISTS careers (uid INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE, slot INTEGER NOT NULL, meta TEXT NOT NULL, data TEXT NOT NULL, upd INTEGER NOT NULL, PRIMARY KEY (uid, slot))');
  $db->exec('CREATE TABLE IF NOT EXISTS attempts (ip TEXT NOT NULL, t INTEGER NOT NULL)');
  // multiplayer: liga entre amigos
  $db->exec('CREATE TABLE IF NOT EXISTS mpl (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, name TEXT NOT NULL, owner INTEGER NOT NULL, seed INTEGER NOT NULL, status TEXT NOT NULL, fixtures TEXT NOT NULL DEFAULT \'[]\', round INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL)');
  $db->exec('CREATE TABLE IF NOT EXISTS mplm (lid INTEGER NOT NULL, uid INTEGER NOT NULL, uname TEXT NOT NULL, team TEXT, upd INTEGER NOT NULL, PRIMARY KEY (lid, uid))');
  $db->exec('CREATE TABLE IF NOT EXISTS mplr (lid INTEGER NOT NULL, rnd INTEGER NOT NULL, idx INTEGER NOT NULL, data TEXT NOT NULL, by_uid INTEGER NOT NULL, t INTEGER NOT NULL, PRIMARY KEY (lid, rnd, idx))');
  // multiplayer: partida ao vivo (lockstep: cada lado manda comandos com o tick em que valem)
  $db->exec('CREATE TABLE IF NOT EXISTS mlive (id INTEGER PRIMARY KEY AUTOINCREMENT, code TEXT NOT NULL UNIQUE, host INTEGER NOT NULL, guest INTEGER, hname TEXT, gname TEXT, hteam TEXT, gteam TEXT, seed INTEGER NOT NULL, status TEXT NOT NULL, hhb INTEGER NOT NULL DEFAULT -1, ghb INTEGER NOT NULL DEFAULT -1, hready INTEGER NOT NULL DEFAULT 0, gready INTEGER NOT NULL DEFAULT 0, result TEXT, created INTEGER NOT NULL, upd INTEGER NOT NULL)');
  $db->exec('CREATE TABLE IF NOT EXISTS mlivec (id INTEGER PRIMARY KEY AUTOINCREMENT, lid INTEGER NOT NULL, side INTEGER NOT NULL, tick INTEGER NOT NULL, cmd TEXT NOT NULL)');
} catch (Throwable $e) { fail('Banco de dados indisponível.', 500); }

$https = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https');
session_name('ONZESESS');
session_set_cookie_params(['lifetime' => 60 * 60 * 24 * 90, 'path' => '/', 'secure' => $https, 'httponly' => true, 'samesite' => 'Lax']);
ini_set('session.gc_maxlifetime', (string)(60 * 60 * 24 * 90));
$sessDir = $dataDir . '/sessions';
if (!is_dir($sessDir)) @mkdir($sessDir, 0700, true);
if (is_dir($sessDir)) session_save_path($sessDir);
session_start();

$a = $_GET['a'] ?? '';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$in = [];
if ($method === 'POST') {
  if (($_SERVER['HTTP_X_ONZE'] ?? '') !== '1') fail('Requisição recusada.', 403);
  $raw = file_get_contents('php://input', false, null, 0, 12 * 1024 * 1024);
  $in = json_decode($raw ?: '{}', true);
  if (!is_array($in)) fail('JSON inválido.');
}
$uid = $_SESSION['uid'] ?? null;
function user(PDO $db, $uid) { if (!$uid) return null; $s = $db->prepare('SELECT id, email, name FROM users WHERE id = ?'); $s->execute([$uid]); return $s->fetch() ?: null; }
function needUser(PDO $db, $uid) { $u = user($db, $uid); if (!$u) fail('Faça login para continuar.', 401); return $u; }
function ip(): string { return substr($_SERVER['REMOTE_ADDR'] ?? '0', 0, 64); }
function throttle(PDO $db) { $db->prepare('DELETE FROM attempts WHERE t < ?')->execute([time() - 900]); $s = $db->prepare('SELECT COUNT(*) FROM attempts WHERE ip = ?'); $s->execute([ip()]); if ((int)$s->fetchColumn() >= 12) fail('Muitas tentativas. Aguarde alguns minutos.', 429); }
function attempt(PDO $db) { $db->prepare('INSERT INTO attempts (ip, t) VALUES (?, ?)')->execute([ip(), time()]); }
function post() { global $method; if ($method !== 'POST') fail('Use POST.', 405); }

function newCode(PDO $db, string $table): string { $abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for ($k = 0; $k < 20; $k++) { $c = ''; for ($i = 0; $i < 6; $i++) $c .= $abc[random_int(0, strlen($abc) - 1)]; $s = $db->prepare("SELECT 1 FROM $table WHERE code = ?"); $s->execute([$c]); if (!$s->fetchColumn()) return $c; } fail('Tente de novo.', 500); }
function joinLeague(PDO $db, int $lid, array $u, $team) { $t = $team !== null ? json_encode($team, JSON_UNESCAPED_UNICODE) : null; if ($t !== null && strlen($t) > 400000) fail('Time grande demais.');
  $db->prepare('INSERT INTO mplm (lid, uid, uname, team, upd) VALUES (?, ?, ?, ?, ?) ON CONFLICT(lid, uid) DO UPDATE SET team = COALESCE(excluded.team, mplm.team), upd = excluded.upd')->execute([$lid, $u['id'], $u['name'], $t, time()]); }
function myLeague(PDO $db, int $id, array $u) { $s = $db->prepare('SELECT l.* FROM mpl l JOIN mplm m ON m.lid = l.id AND m.uid = ? WHERE l.id = ?'); $s->execute([$u['id'], $id]); $l = $s->fetch(); if (!$l) fail('Liga não encontrada.', 404); return $l; }
function myLive(PDO $db, int $id, array $u) { $s = $db->prepare('SELECT * FROM mlive WHERE id = ? AND (host = ? OR guest = ?)'); $s->execute([$id, $u['id'], $u['id']]); $g = $s->fetch(); if (!$g) fail('Partida não encontrada.', 404); return $g; }

switch ($a) {
  case 'health': out(['ok' => true]);
  case 'me': out(['ok' => true, 'user' => user($db, $uid)]);
  case 'register':
    post(); throttle($db);
    $name = trim((string)($in['name'] ?? '')); $email = strtolower(trim((string)($in['email'] ?? ''))); $pass = (string)($in['password'] ?? '');
    if ($name === '' || mb_strlen($name) > 60) fail('Informe seu nome (até 60 letras).');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160) fail('E-mail inválido.');
    if (strlen($pass) < 6 || strlen($pass) > 200) fail('A senha precisa ter pelo menos 6 caracteres.');
    $s = $db->prepare('SELECT 1 FROM users WHERE email = ?'); $s->execute([$email]);
    if ($s->fetchColumn()) { attempt($db); fail('Já existe uma conta com esse e-mail. Use "Entrar".', 409); }
    $db->prepare('INSERT INTO users (email, name, pass, created) VALUES (?, ?, ?, ?)')->execute([$email, $name, password_hash($pass, PASSWORD_DEFAULT), time()]);
    session_regenerate_id(true); $_SESSION['uid'] = (int)$db->lastInsertId();
    out(['ok' => true, 'user' => user($db, $_SESSION['uid'])]);
  case 'login':
    post(); throttle($db);
    $email = strtolower(trim((string)($in['email'] ?? ''))); $pass = (string)($in['password'] ?? '');
    $s = $db->prepare('SELECT id, pass FROM users WHERE email = ?'); $s->execute([$email]); $u = $s->fetch();
    if (!$u || !password_verify($pass, $u['pass'])) { attempt($db); fail('E-mail ou senha incorretos.', 401); }
    if (password_needs_rehash($u['pass'], PASSWORD_DEFAULT)) $db->prepare('UPDATE users SET pass = ? WHERE id = ?')->execute([password_hash($pass, PASSWORD_DEFAULT), $u['id']]);
    session_regenerate_id(true); $_SESSION['uid'] = (int)$u['id'];
    out(['ok' => true, 'user' => user($db, $_SESSION['uid'])]);
  case 'logout':
    post(); $_SESSION = [];
    if (ini_get('session.use_cookies')) { $p = session_get_cookie_params(); setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => $p['path'], 'secure' => $p['secure'], 'httponly' => true, 'samesite' => 'Lax']); }
    session_destroy(); out(['ok' => true]);
  case 'password':
    post(); $u = needUser($db, $uid); throttle($db);
    $s = $db->prepare('SELECT pass FROM users WHERE id = ?'); $s->execute([$u['id']]);
    if (!password_verify((string)($in['old'] ?? ''), (string)$s->fetchColumn())) { attempt($db); fail('Senha atual incorreta.', 403); }
    $new = (string)($in['new'] ?? ''); if (strlen($new) < 6) fail('A nova senha precisa ter pelo menos 6 caracteres.');
    $db->prepare('UPDATE users SET pass = ? WHERE id = ?')->execute([password_hash($new, PASSWORD_DEFAULT), $u['id']]);
    out(['ok' => true]);
  case 'delete_account':
    post(); $u = needUser($db, $uid); throttle($db);
    $s = $db->prepare('SELECT pass FROM users WHERE id = ?'); $s->execute([$u['id']]);
    if (!password_verify((string)($in['password'] ?? ''), (string)$s->fetchColumn())) { attempt($db); fail('Senha incorreta.', 403); }
    $db->prepare('DELETE FROM careers WHERE uid = ?')->execute([$u['id']]);
    $db->prepare('DELETE FROM users WHERE id = ?')->execute([$u['id']]);
    $_SESSION = []; session_destroy(); out(['ok' => true]);
  case 'careers':
    $u = needUser($db, $uid);
    $s = $db->prepare('SELECT slot, meta, upd FROM careers WHERE uid = ? ORDER BY slot'); $s->execute([$u['id']]);
    out(['ok' => true, 'careers' => array_map(fn($r) => ['slot' => (int)$r['slot'], 'meta' => json_decode($r['meta'], true), 'upd' => (int)$r['upd']], $s->fetchAll())]);
  case 'load':
    $u = needUser($db, $uid); $slot = (int)($_GET['slot'] ?? 0);
    $s = $db->prepare('SELECT data, upd FROM careers WHERE uid = ? AND slot = ?'); $s->execute([$u['id'], $slot]); $r = $s->fetch();
    if (!$r) fail('Carreira não encontrada.', 404);
    header('Content-Type: application/json; charset=utf-8');
    echo '{"ok":true,"upd":' . (int)$r['upd'] . ',"data":' . $r['data'] . '}'; exit;
  case 'save':
    post(); $u = needUser($db, $uid);
    $slot = (int)($in['slot'] ?? 0); if ($slot < 1 || $slot > 99) fail('Espaço de carreira inválido.');
    $data = $in['data'] ?? null; if (!is_array($data)) fail('Dados inválidos.');
    $json = json_encode($data, JSON_UNESCAPED_UNICODE); if (strlen($json) > 10 * 1024 * 1024) fail('Save grande demais.');
    $meta = json_encode(array_slice((array)($in['meta'] ?? []), 0, 16), JSON_UNESCAPED_UNICODE);
    $db->prepare('INSERT INTO careers (uid, slot, meta, data, upd) VALUES (?, ?, ?, ?, ?) ON CONFLICT(uid, slot) DO UPDATE SET meta = excluded.meta, data = excluded.data, upd = excluded.upd')
       ->execute([$u['id'], $slot, $meta, $json, time()]);
    out(['ok' => true, 'upd' => time()]);
  case 'delete_career':
    post(); $u = needUser($db, $uid);
    $db->prepare('DELETE FROM careers WHERE uid = ? AND slot = ?')->execute([$u['id'], (int)($in['slot'] ?? 0)]);
    out(['ok' => true]);

  /* ---------- multiplayer ---------- */
  case 'mpl_create':
    post(); $u = needUser($db, $uid); $name = trim((string)($in['name'] ?? '')) ?: ('Liga de ' . $u['name']);
    $code = newCode($db, 'mpl');
    $db->prepare('INSERT INTO mpl (code, name, owner, seed, status, created) VALUES (?, ?, ?, ?, ?, ?)')->execute([$code, mb_substr($name, 0, 40), $u['id'], random_int(1, 2000000000), 'open', time()]);
    $lid = (int)$db->lastInsertId(); joinLeague($db, $lid, $u, $in['team'] ?? null);
    out(['ok' => true, 'id' => $lid, 'code' => $code]);
  case 'mpl_join':
    post(); $u = needUser($db, $uid); $code = strtoupper(trim((string)($in['code'] ?? '')));
    $s = $db->prepare('SELECT * FROM mpl WHERE code = ?'); $s->execute([$code]); $l = $s->fetch(); if (!$l) fail('Código de liga não encontrado.', 404);
    $s = $db->prepare('SELECT COUNT(*) FROM mplm WHERE lid = ?'); $s->execute([$l['id']]); $n = (int)$s->fetchColumn();
    $s = $db->prepare('SELECT 1 FROM mplm WHERE lid = ? AND uid = ?'); $s->execute([$l['id'], $u['id']]); $already = (bool)$s->fetchColumn();
    if (!$already && $l['status'] !== 'open') fail('Essa liga já começou.', 409);
    if (!$already && $n >= 12) fail('Liga cheia (máximo 12 técnicos).', 409);
    joinLeague($db, (int)$l['id'], $u, $in['team'] ?? null);
    out(['ok' => true, 'id' => (int)$l['id']]);
  case 'mpl_list':
    $u = needUser($db, $uid);
    $s = $db->prepare('SELECT l.id, l.code, l.name, l.status, l.round, l.owner, (SELECT COUNT(*) FROM mplm m2 WHERE m2.lid = l.id) n FROM mpl l JOIN mplm m ON m.lid = l.id WHERE m.uid = ? ORDER BY l.id DESC'); $s->execute([$u['id']]);
    out(['ok' => true, 'leagues' => $s->fetchAll()]);
  case 'mpl_get':
    $u = needUser($db, $uid); $l = myLeague($db, (int)($_GET['id'] ?? 0), $u);
    $s = $db->prepare('SELECT uid, uname, team, upd FROM mplm WHERE lid = ? ORDER BY rowid'); $s->execute([$l['id']]);
    $mem = array_map(fn($r) => ['uid' => (int)$r['uid'], 'name' => $r['uname'], 'team' => $r['team'] ? json_decode($r['team'], true) : null, 'upd' => (int)$r['upd']], $s->fetchAll());
    $s = $db->prepare('SELECT rnd, idx, data, by_uid FROM mplr WHERE lid = ? ORDER BY rnd, idx'); $s->execute([$l['id']]);
    $res = array_map(fn($r) => ['rnd' => (int)$r['rnd'], 'idx' => (int)$r['idx'], 'data' => json_decode($r['data'], true), 'by' => (int)$r['by_uid']], $s->fetchAll());
    out(['ok' => true, 'me' => (int)$u['id'], 'league' => ['id' => (int)$l['id'], 'code' => $l['code'], 'name' => $l['name'], 'owner' => (int)$l['owner'], 'seed' => (int)$l['seed'], 'status' => $l['status'], 'round' => (int)$l['round'], 'fixtures' => json_decode($l['fixtures'], true)], 'members' => $mem, 'results' => $res]);
  case 'mpl_team':
    post(); $u = needUser($db, $uid); $l = myLeague($db, (int)($in['id'] ?? 0), $u);
    $t = json_encode($in['team'] ?? null, JSON_UNESCAPED_UNICODE); if (strlen($t) > 400000) fail('Time grande demais.');
    $db->prepare('UPDATE mplm SET team = ?, upd = ? WHERE lid = ? AND uid = ?')->execute([$t, time(), $l['id'], $u['id']]);
    out(['ok' => true]);
  case 'mpl_start':
    post(); $u = needUser($db, $uid); $l = myLeague($db, (int)($in['id'] ?? 0), $u);
    if ((int)$l['owner'] !== (int)$u['id']) fail('Só quem criou a liga pode começar.', 403);
    if ($l['status'] !== 'open') fail('A liga já começou.');
    $s = $db->prepare('SELECT uid FROM mplm WHERE lid = ? AND team IS NOT NULL ORDER BY rowid'); $s->execute([$l['id']]); $ids = array_map('intval', $s->fetchAll(PDO::FETCH_COLUMN));
    if (count($ids) < 2) fail('Precisa de pelo menos 2 técnicos com time enviado.');
    $turns = max(1, min(2, (int)($in['turns'] ?? 2)));
    $a = $ids; shuffle($a); if (count($a) % 2) $a[] = 0; $n = count($a); $rounds = [];
    for ($r = 0; $r < $n - 1; $r++) { $pr = []; for ($i = 0; $i < $n / 2; $i++) { $x = $a[$i]; $y = $a[$n - 1 - $i]; if ($x && $y) $pr[] = (($r + $i) % 2) ? [$y, $x] : [$x, $y]; } $rounds[] = $pr; $last = array_pop($a); array_splice($a, 1, 0, [$last]); }
    if ($turns === 2) { $back = array_map(fn($rr) => array_map(fn($f) => [$f[1], $f[0]], $rr), $rounds); $rounds = array_merge($rounds, $back); }
    $db->prepare('UPDATE mpl SET status = ?, fixtures = ?, round = 0 WHERE id = ?')->execute(['running', json_encode($rounds), $l['id']]);
    out(['ok' => true]);
  case 'mpl_result':
    post(); $u = needUser($db, $uid); $l = myLeague($db, (int)($in['id'] ?? 0), $u);
    if ($l['status'] !== 'running') fail('A liga não está em andamento.');
    $rnd = (int)($in['rnd'] ?? -1); $idx = (int)($in['idx'] ?? -1); $fx = json_decode($l['fixtures'], true);
    if ($rnd !== (int)$l['round'] || !isset($fx[$rnd][$idx])) fail('Jogo fora da rodada atual.');
    $f = $fx[$rnd][$idx]; $owner = (int)$l['owner'] === (int)$u['id'];
    if (!$owner && !in_array((int)$u['id'], $f, true)) fail('Você só pode jogar o seu jogo (o criador da liga simula os pendentes).', 403);
    $d = $in['data'] ?? null; if (!is_array($d) || !isset($d['hg'], $d['ag'])) fail('Resultado inválido.');
    $d = ['hg' => max(0, min(30, (int)$d['hg'])), 'ag' => max(0, min(30, (int)$d['ag'])), 'sc' => array_slice((array)($d['sc'] ?? []), 0, 30), 'st' => array_slice((array)($d['st'] ?? []), 0, 20), 'live' => !empty($d['live'])];
    $ins = $db->prepare('INSERT OR IGNORE INTO mplr (lid, rnd, idx, data, by_uid, t) VALUES (?, ?, ?, ?, ?, ?)'); $ins->execute([$l['id'], $rnd, $idx, json_encode($d, JSON_UNESCAPED_UNICODE), $u['id'], time()]);
    $s = $db->prepare('SELECT COUNT(*) FROM mplr WHERE lid = ? AND rnd = ?'); $s->execute([$l['id'], $rnd]);
    if ((int)$s->fetchColumn() >= count($fx[$rnd])) { $nr = $rnd + 1; $db->prepare('UPDATE mpl SET round = ?, status = ? WHERE id = ? AND round = ?')->execute([$nr, $nr >= count($fx) ? 'done' : 'running', $l['id'], $rnd]); }
    out(['ok' => true, 'stored' => $ins->rowCount() > 0]);
  case 'mpl_leave':
    post(); $u = needUser($db, $uid); $l = myLeague($db, (int)($in['id'] ?? 0), $u);
    if ($l['status'] === 'open') { $db->prepare('DELETE FROM mplm WHERE lid = ? AND uid = ?')->execute([$l['id'], $u['id']]); if ((int)$l['owner'] === (int)$u['id']) { $db->prepare('DELETE FROM mplm WHERE lid = ?')->execute([$l['id']]); $db->prepare('DELETE FROM mpl WHERE id = ?')->execute([$l['id']]); } }
    else fail('A liga já começou: não dá para sair agora.');
    out(['ok' => true]);
  case 'live_create':
    post(); $u = needUser($db, $uid); $t = json_encode($in['team'] ?? null, JSON_UNESCAPED_UNICODE); if (strlen($t) > 400000) fail('Time grande demais.');
    $db->prepare('DELETE FROM mlivec WHERE lid IN (SELECT id FROM mlive WHERE upd < ?)')->execute([time() - 86400]); $db->prepare('DELETE FROM mlive WHERE upd < ?')->execute([time() - 86400]);
    $code = newCode($db, 'mlive');
    $db->prepare('INSERT INTO mlive (code, host, hname, hteam, seed, status, created, upd) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')->execute([$code, $u['id'], $u['name'], $t, random_int(1, 2000000000), 'wait', time(), time()]);
    out(['ok' => true, 'id' => (int)$db->lastInsertId(), 'code' => $code]);
  case 'live_join':
    post(); $u = needUser($db, $uid); $code = strtoupper(trim((string)($in['code'] ?? '')));
    $s = $db->prepare('SELECT * FROM mlive WHERE code = ?'); $s->execute([$code]); $g = $s->fetch(); if (!$g) fail('Código de partida não encontrado.', 404);
    if ((int)$g['host'] === (int)$u['id']) fail('Você criou essa partida: espere o adversário entrar.');
    if ($g['guest'] && (int)$g['guest'] !== (int)$u['id']) fail('Essa partida já tem dois técnicos.', 409);
    $t = json_encode($in['team'] ?? null, JSON_UNESCAPED_UNICODE); if (strlen($t) > 400000) fail('Time grande demais.');
    $db->prepare('UPDATE mlive SET guest = ?, gname = ?, gteam = ?, status = ?, upd = ? WHERE id = ?')->execute([$u['id'], $u['name'], $t, 'ready', time(), $g['id']]);
    out(['ok' => true, 'id' => (int)$g['id']]);
  case 'live_get':
    $u = needUser($db, $uid); $g = myLive($db, (int)($_GET['id'] ?? 0), $u); $since = (int)($_GET['since'] ?? 0); $full = !empty($_GET['full']);
    $s = $db->prepare('SELECT id, side, tick, cmd FROM mlivec WHERE lid = ? AND id > ? ORDER BY id'); $s->execute([$g['id'], $since]);
    $cmds = array_map(fn($r) => ['id' => (int)$r['id'], 'side' => (int)$r['side'], 'tick' => (int)$r['tick'], 'cmd' => json_decode($r['cmd'], true)], $s->fetchAll());
    $o = ['ok' => true, 'side' => (int)$g['host'] === (int)$u['id'] ? 0 : 1, 'status' => $g['status'], 'hb' => [(int)$g['hhb'], (int)$g['ghb']], 'ready' => [(int)$g['hready'], (int)$g['gready']], 'names' => [$g['hname'], $g['gname']], 'code' => $g['code'], 'cmds' => $cmds, 'result' => $g['result'] ? json_decode($g['result'], true) : null];
    if ($full) { $o['seed'] = (int)$g['seed']; $o['teams'] = [$g['hteam'] ? json_decode($g['hteam'], true) : null, $g['gteam'] ? json_decode($g['gteam'], true) : null]; }
    out($o);
  case 'live_ready':
    post(); $u = needUser($db, $uid); $g = myLive($db, (int)($in['id'] ?? 0), $u); $col = (int)$g['host'] === (int)$u['id'] ? 'hready' : 'gready';
    $db->prepare("UPDATE mlive SET $col = 1, upd = ? WHERE id = ?")->execute([time(), $g['id']]);
    $db->prepare("UPDATE mlive SET status = 'play' WHERE id = ? AND hready = 1 AND gready = 1 AND status = 'ready'")->execute([$g['id']]);
    out(['ok' => true]);
  case 'live_post':
    post(); $u = needUser($db, $uid); $g = myLive($db, (int)($in['id'] ?? 0), $u); $side = (int)$g['host'] === (int)$u['id'] ? 0 : 1;
    $hb = (int)($in['hb'] ?? -1);
    foreach (array_slice((array)($in['cmds'] ?? []), 0, 20) as $c) { $t = (int)($c['tick'] ?? 0); if ($t <= max($hb, 0)) continue; $db->prepare('INSERT INTO mlivec (lid, side, tick, cmd) VALUES (?, ?, ?, ?)')->execute([$g['id'], $side, $t, json_encode($c['cmd'] ?? null, JSON_UNESCAPED_UNICODE)]); }
    $col = $side === 0 ? 'hhb' : 'ghb'; $db->prepare("UPDATE mlive SET $col = MAX($col, ?), upd = ? WHERE id = ?")->execute([$hb, time(), $g['id']]);
    if (isset($in['result']) && is_array($in['result']) && $side === 0) $db->prepare("UPDATE mlive SET result = ?, status = 'done' WHERE id = ?")->execute([json_encode($in['result'], JSON_UNESCAPED_UNICODE), $g['id']]);
    $s = $db->prepare('SELECT id, side, tick, cmd FROM mlivec WHERE lid = ? AND id > ? AND side <> ? ORDER BY id'); $s->execute([$g['id'], (int)($in['since'] ?? 0), $side]);
    $cmds = array_map(fn($r) => ['id' => (int)$r['id'], 'side' => (int)$r['side'], 'tick' => (int)$r['tick'], 'cmd' => json_decode($r['cmd'], true)], $s->fetchAll());
    $s = $db->prepare('SELECT hhb, ghb FROM mlive WHERE id = ?'); $s->execute([$g['id']]); $h = $s->fetch();
    out(['ok' => true, 'cmds' => $cmds, 'hb' => [(int)$h['hhb'], (int)$h['ghb']]]);
  default: fail('Ação desconhecida.', 404);
}
