import os, datetime
from pathlib import Path

SITE = "https://gemarcph.com"
ROOT = Path(__file__).parent
today = datetime.date.today().isoformat()

urls = []
for p in sorted(ROOT.glob("*.html")):
    if p.name.lower() == "404.html":
        continue
    slug = "/" if p.name == "index.html" else f"/{p.stem}"
    urls.append(f"""  <url>
    <loc>{SITE}{slug}</loc>
    <lastmod>{today}</lastmod>
    <priority>{'1.0' if slug=='/' else '0.8'}</priority>
  </url>""")

xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
{chr(10).join(urls)}
</urlset>
"""
(Path("sitemap.xml")).write_text(xml, encoding="utf-8")
print("sitemap.xml generated.")
