"""Gera public/ — exatamente o que vai para public_html/futbol no servidor."""
import pathlib, shutil
root = pathlib.Path(__file__).parent
s = root / 'src'
FILES = ['icons.js','data.js','real.js','core.js','match.js','render.js','stadiums.js','render3dwrap.js',
         'audio.js','account.js','ui.js','tactics.js','matchui.js','online.js']
css = (s/'style.css').read_text(encoding='utf-8')
js = '\n'.join((s/f).read_text(encoding='utf-8') for f in FILES)
html = (s/'index.tpl.html').read_text(encoding='utf-8').replace('/*CSS*/', css).replace('/*JS*/', js.replace('</script', '<\\/script'))
out = root / 'public'
if out.exists(): shutil.rmtree(out)
out.mkdir()
(out/'index.html').write_text(html, encoding='utf-8')
shutil.copytree(root/'3d', out/'3d')
shutil.copytree(root/'api', out/'api')
shutil.copytree(root/'conheca', out/'conheca')
for f in (root/'pwa').iterdir(): shutil.copy(f, out/f.name)
shutil.copy(root/'.htaccess-site', out/'.htaccess')
print('public/ pronto —', len(html), 'caracteres no index.html')
