#!/usr/bin/env python3
"""Validate the generated site without network access or extra packages."""
import json
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlparse


class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.tags, self.ids, self.schemas = [], set(), []
        self.json_script = False
        self.buffer = []
        self.feed(text)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.tags.append((tag, attrs))
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'script' and attrs.get('type') == 'application/ld+json':
            self.json_script, self.buffer = True, []

    def handle_data(self, data):
        if self.json_script:
            self.buffer.append(data)

    def handle_endtag(self, tag):
        if tag == 'script' and self.json_script:
            self.schemas.append(json.loads(''.join(self.buffer)))
            self.json_script = False


def check(root):
    errors = []
    pages = {p: Page(p.read_text()) for p in root.rglob('*.html')}
    def require(condition, message):
        if not condition:
            errors.append(message)

    for path, page in pages.items():
        rel = str(path.relative_to(root))
        url = 'https://besendorf.org/' + rel.removesuffix('index.html')
        redirect = any(t == 'meta' and a.get('http-equiv', '').lower() == 'refresh' for t, a in page.tags)
        if not redirect:
            require(sum(t == 'h1' for t, a in page.tags) == 1, f'{rel}: expected one h1')
            lang = next(a.get('lang') for t, a in page.tags if t == 'html')
            require(lang == ('en-US' if rel.startswith('en/') else 'de-DE'), f'{rel}: incorrect language')
            for schema in page.schemas:
                require('0001-' not in json.dumps(schema), f'{rel}: zero date in structured data')
                require(schema.get('@type') != 'Organization', f'{rel}: person represented as organization')
            if rel.startswith('en/posts/'):
                require(rel == 'en/posts/index.html', f'{rel}: German post published as English')
        for tag, attrs in page.tags:
            refs = []
            if tag in ('a', 'link'): refs.append(attrs.get('href'))
            if tag in ('img', 'script'): refs.append(attrs.get('src'))
            if tag == 'meta' and attrs.get('property') == 'og:image': refs.append(attrs.get('content'))
            for ref in filter(None, refs):
                require(not ref.lower().startswith('mailto:'), f'{rel}: machine-readable email link')
                parsed = urlparse(urljoin(url, ref))
                if parsed.hostname != 'besendorf.org': continue
                target = root / unquote(parsed.path).lstrip('/')
                if not target.is_file(): target = target / 'index.html'
                require(target.is_file(), f'{rel}: missing target {ref}')
                if parsed.fragment and target in pages:
                    require(unquote(parsed.fragment) in pages[target].ids, f'{rel}: missing fragment {ref}')
            if tag == 'img': require('alt' in attrs, f'{rel}: image lacks alt text')
            if tag == 'script' and attrs.get('src'):
                require(bool(attrs.get('integrity')), f'{rel}: script lacks integrity hash')

    for path in root.rglob('*'):
        if path.suffix in ('.html', '.js', '.json', '.xml'):
            text = path.read_text()
            require(not re.search(r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}', text), f'{path.relative_to(root)}: exposed email')
            if path.suffix == '.xml': ET.fromstring(text)

    for lang in ('', 'en/'):
        press = pages[root / lang / 'press/index.html']
        require(sum('data-press-entry' in a for t, a in press.tags) == 70, f'{lang}press: archive entries missing')
        home = pages[root / lang / 'index.html']
        require(any(s.get('@type') == 'Person' for s in home.schemas), f'{lang}home: missing Person schema')
        articles = pages[root / lang / 'articles/index.html']
        require(any(s.get('@type') == 'CollectionPage' for s in articles.schemas), f'{lang}articles: wrong schema')
        search = pages[root / lang / 'search/index.html']
        require(any(t == 'meta' and a.get('name') == 'robots' and 'noindex' in a.get('content', '') for t, a in search.tags), f'{lang}search: indexed')
        data = json.loads((root / lang / 'index.json').read_text())
        for item in data:
            require('Privacy' not in item['title'] and 'Datenschutzerklärung' not in item['title'], f'{lang}search: policy noise')
            require(item['language'] != 'de' or '/en/posts/' not in item['permalink'], f'{lang}search: fake translation link')
    interview = pages[root / 'posts/interview_jw_ifg_boer/index.html']
    require(not any(t == 'em' for t, a in interview.tags), 'Interview gender asterisks became emphasis')
    if errors:
        raise SystemExit('\n'.join(errors))
    print(f'Validated {len(pages)} HTML pages, local links and fragments, assets, XML, schemas, languages and obfuscated emails.')


if __name__ == '__main__':
    check(Path(sys.argv[1] if len(sys.argv) > 1 else 'public').resolve())
