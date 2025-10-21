import os
import json
from pathlib import Path
from bs4 import BeautifulSoup

# --- Load manifest ---
with open('manifest.json', 'r', encoding='utf-8') as f:
    manifest = json.load(f)

SITE_URL = manifest['siteUrl'].rstrip('/')
SITE_NAME = manifest.get('siteName', '')
FAVICON = manifest.get('favicon', 'images/gemarclogo.png')
DEFAULT_OG_IMAGE = manifest.get('defaultOgImage', '')
DEFAULTS = manifest.get('defaults', {})
PAGES = manifest.get('pages', {})

# --- Sets of SEO tags we manage ---
SEO_META_NAMES = {
    'description', 'robots',
    'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image'
}
SEO_OG_PROPS = {
    'og:site_name', 'og:title', 'og:description', 'og:type', 'og:url', 'og:image'
}
SEO_LINK_RELS = {'canonical', 'icon', 'shortcut icon'}

def page_slug(filename: str) -> str:
    """index.html -> '/', else '/<stem>'"""
    if filename.lower() == 'index.html':
        return '/'
    return '/' + Path(filename).stem

def upsert_unique_meta(soup: BeautifulSoup, head, *, name=None, prop=None, content=''):
    """Create or replace a <meta> by name= or property=""."""
    if name:
        tag = head.find('meta', attrs={'name': name})
        if not tag:
            tag = soup.new_tag('meta')
            tag['name'] = name
            head.append(tag)
        tag['content'] = content
    elif prop:
        tag = head.find('meta', attrs={'property': prop})
        if not tag:
            tag = soup.new_tag('meta')
            tag['property'] = prop
            head.append(tag)
        tag['content'] = content

def upsert_unique_link(soup: BeautifulSoup, head, *, rel: str, href: str):
    """Create or replace a <link rel=...> (keeps stylesheets)."""
    tag = None
    for t in head.find_all('link', attrs={'rel': True}):
        rels = t.get('rel')
        if isinstance(rels, list):
            if rel.lower() in [r.lower() for r in rels]:
                tag = t
                break
        else:
            if str(rels).lower() == rel.lower():
                tag = t
                break
    if not tag:
        tag = soup.new_tag('link')
        tag['rel'] = [rel]
        head.append(tag)
    tag['href'] = href

def ensure_charset_and_viewport(soup: BeautifulSoup, head):
    # charset
    if not head.find('meta', attrs={'charset': True}):
        charset = soup.new_tag('meta')
        charset['charset'] = 'UTF-8'
        head.insert(0, charset)
    # viewport
    if not head.find('meta', attrs={'name': 'viewport'}):
        viewport = soup.new_tag('meta')
        viewport['name'] = 'viewport'
        viewport['content'] = 'width=device-width, initial-scale=1.0'
        head.append(viewport)

def set_title(soup: BeautifulSoup, head, title_text: str):
    t = head.find('title')
    if not t:
        t = soup.new_tag('title')
        head.append(t)
    t.string = title_text

def clean_old_seo(head):
    # remove only SEO metas (keep other metas like charset/viewport)
    for m in list(head.find_all('meta')):
        if m.has_attr('name') and m['name'].lower() in SEO_META_NAMES:
            m.decompose()
        elif m.has_attr('property') and m['property'].lower() in SEO_OG_PROPS:
            m.decompose()
    # remove only canonical + icon links (keep stylesheets, preconnect, etc.)
    for l in list(head.find_all('link', attrs={'rel': True})):
        rels = l.get('rel')
        rel_list = [r.lower() for r in rels] if isinstance(rels, list) else [str(rels).lower()]
        if any(r in SEO_LINK_RELS for r in rel_list):
            l.decompose()

def patch_head(soup: BeautifulSoup, head, filename: str):
    # Resolve page config
    page_cfg = PAGES.get(filename, {})
    slug = page_slug(filename)
    canonical = f"{SITE_URL}{slug}"

    title_main = page_cfg.get('title') or Path(filename).stem.replace('-', ' ').title()
    title_suffix = DEFAULTS.get('titleSuffix', '')
    full_title = f"{title_main}{title_suffix}".strip()

    description = page_cfg.get('description', DEFAULTS.get('description', ''))
    og_image = page_cfg.get('ogImage', DEFAULT_OG_IMAGE)
    og_type = page_cfg.get('type', 'article' if filename.lower() != 'index.html' else 'website')
    robots = DEFAULTS.get('robots', 'index,follow')
    twitter_card = DEFAULTS.get('twitterCard', 'summary_large_image')

    clean_old_seo(head)
    ensure_charset_and_viewport(soup, head)
    set_title(soup, head, full_title)

    # canonical + favicon
    upsert_unique_link(soup, head, rel='canonical', href=canonical)
    upsert_unique_link(soup, head, rel='icon', href=FAVICON)

    # basic SEO
    upsert_unique_meta(soup, head, name='description', content=description)
    upsert_unique_meta(soup, head, name='robots', content=robots)

    # Open Graph
    upsert_unique_meta(soup, head, prop='og:site_name', content=SITE_NAME)
    upsert_unique_meta(soup, head, prop='og:title', content=full_title)
    upsert_unique_meta(soup, head, prop='og:description', content=description)
    upsert_unique_meta(soup, head, prop='og:type', content=og_type)
    upsert_unique_meta(soup, head, prop='og:url', content=canonical)
    if og_image:
        upsert_unique_meta(soup, head, prop='og:image', content=og_image)

    # Twitter
    upsert_unique_meta(soup, head, name='twitter:card', content=twitter_card)
    upsert_unique_meta(soup, head, name='twitter:title', content=full_title)
    upsert_unique_meta(soup, head, name='twitter:description', content=description)
    if og_image:
        upsert_unique_meta(soup, head, name='twitter:image', content=og_image)

def normalize_paths_in_attrs(soup: BeautifulSoup):
    """
    Normalize src/href attributes:
      - Backslashes '\' -> '/'
      - 'downloadable content/' or 'downloadable content\' -> 'downloadable-content/'
      - Also normalize 'downloadable-content\' -> 'downloadable-content/'
    """
    for tag in soup.find_all(True):
        for attr in ('src', 'href'):
            if tag.has_attr(attr):
                val = tag.get(attr)
                if isinstance(val, str):
                    fixed = val.replace('\\', '/')
                    fixed = fixed.replace('downloadable content/', 'downloadable-content/')
                    fixed = fixed.replace('downloadable content\\', 'downloadable-content/')
                    fixed = fixed.replace('downloadable-content\\', 'downloadable-content/')
                    # collapse any '//' accidental doubles except protocol ('http://', 'https://')
                    if '://' not in fixed:
                        while '//' in fixed:
                            fixed = fixed.replace('//', '/')
                    tag[attr] = fixed

def postprocess_text_replacements(html_text: str) -> str:
    """
    As a safety net, also patch plain text occurrences (e.g., inline JS strings).
    Only minimal targeted replacements to avoid collateral changes.
    """
    html_text = html_text.replace('downloadable content\\', 'downloadable-content/')
    html_text = html_text.replace('downloadable content/', 'downloadable-content/')
    html_text = html_text.replace('downloadable-content\\', 'downloadable-content/')
    return html_text

def patch_html_file(filepath: Path):
    html = filepath.read_text(encoding='utf-8', errors='ignore')
    soup = BeautifulSoup(html, 'html.parser')

    # Ensure <html> and <head> exist
    if not soup.html:
        html_tag = soup.new_tag('html', lang='en')
        head_tag = soup.new_tag('head')
        body_tag = soup.new_tag('body')
        for child in list(soup.children):
            if getattr(child, 'name', None) not in (None, 'html'):
                body_tag.append(child)
        html_tag.append(head_tag)
        html_tag.append(body_tag)
        soup.append(html_tag)

    head = soup.head
    if not head:
        head = soup.new_tag('head')
        soup.html.insert(0, head)

    # Patch SEO head
    patch_head(soup, head, filepath.name)

    # Normalize paths in src/href attributes
    normalize_paths_in_attrs(soup)

    # Serialize and do targeted text-level fixes for inline JS strings
    out = str(soup)
    out = postprocess_text_replacements(out)

    filepath.write_text(out, encoding='utf-8')

def main():
    root = Path('.')
    patched = 0
    for p in sorted(root.glob('*.html')):
        print(f'Patching {p.name}...')
        patch_html_file(p)
        patched += 1
    print(f'Done! Patched {patched} HTML files with meta/OG/canonical + normalized paths.')

if __name__ == '__main__':
    main()
