"""Bundle web/ into one self-contained page (CSS and JS inlined) for sharing as a single file.

usage: python3 web/build_artifact.py <out.html>
The output has no <html>/<head>/<body> wrapper: the host adds one.
"""
import pathlib
import re
import sys

WEB = pathlib.Path(__file__).resolve().parent
out = pathlib.Path(sys.argv[1])

page = (WEB / "index.html").read_text()
css = "\n".join((WEB / "css" / f).read_text() for f in ("tokens.css", "type.css", "components.css", "site.css"))
js = (WEB / "js" / "app.js").read_text()
fonts = re.search(r'<link rel="stylesheet" href="(https://fonts\.googleapis\.com[^"]+)">', page).group(1)
body = page.split("<body>", 1)[1].rsplit("</body>", 1)[0]
body = body.replace('<script src="js/app.js"></script>', "").strip()

for chunk, name in ((css, "css"), (js, "js")):
    assert "</style" not in chunk and "</script" not in chunk, name

out.write_text(
    "<title>FirstShift</title>\n"
    '<meta name="claude:viewport-fit-sides" content="cover">\n'
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    f'<link rel="stylesheet" href="{fonts}">\n'
    f"<style>\n{css}\n</style>\n{body}\n<script>\n{js}\n</script>\n"
)
print(f"wrote {out} ({out.stat().st_size:,} bytes)")
