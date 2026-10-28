# besendorf.org
This is the repo for my private homepage. Feel free to send pull requests for typos.

## Press page

The German `/press/` and English `/en/press/` pages share the article list in
`data/press.yaml`, rendered by `layouts/_shortcodes/press-list.html`.
Add entries with their publication year, outlet, title, URL and kind:
`quote`, `mention`, `interview`, `coverage`, `release` or `institutional`.
Use `mention` for confirmed mentions without a verified direct quote and
`coverage` when the exact form of the contribution could not be checked. Entries are grouped
by year; their order within each year follows the data file. Translations and
syndicated reports have optional notes. For an unavailable original, set
`unavailable: true` and provide a working `alternative_url` when possible. Update the visible date and `lastmod`
in both language pages when updating the list.

## Build and validation

Use Hugo **0.167.0** (the version pinned in CI):

```sh
git submodule update --init --recursive
hugo --minify --panicOnWarning
python3 scripts/check_site.py public
node --test tests/*.test.cjs
python3 -m unittest discover -s themes/WonderMod/tests -p 'test_*.py'
npm ci --ignore-scripts
npx playwright install chromium
npm run test:browser
```

CI checks both languages, local links and fragments, assets, metadata, XML,
archive completeness and email obfuscation. Search and filtering tests require
Node.js 22 or newer. Playwright is a pinned development dependency for browser
checks; the published site has no npm runtime dependencies.

German-only posts are published once in German. Their former English URLs
redirect to the originals, and the English blog index identifies them as German.
Email addresses must stay obfuscated in page content; do not add `mailto:` links,
email properties in structured data or scripts that reconstruct an address.

## Theme compatibility

WonderMod now comes from [besendorf/hugo-WonderMod](https://github.com/besendorf/hugo-WonderMod).
The submodule is pinned to `51ebb5848064a633e648f595ec47708e3da933e1`.
It selectively imports PaperMod maintenance changes while retaining external
scripts/styles, build-time highlighting and the Atom feed. Theme provenance,
security requirements and tests are documented in `themes/WonderMod/MAINTENANCE.md`.
Both the theme and site overrides use Hugo's current template paths. Recheck
`layouts/` and `assets/` when updating the pinned submodule.

## Content Security Policy

Every HTML page, including aliases, receives an early meta CSP allowing only
same-origin scripts, styles, images, fonts, fetches and media. Frames, objects,
forms, base-URL changes, inline code and inline styles are blocked. JSON-LD remains
non-executable structured data. GitHub Pages cannot set custom response headers,
so this meta policy cannot enforce `frame-ancestors`, CSP reporting or sandbox.
If the host gains header support, add the equivalent response-header policy and
`frame-ancestors 'none'`; do not put unsupported directives in the meta tag.

`scripts/check_site.py` calls the theme's reusable security validator and requires
the exact policy before all resources. It rejects external asset loads, inline
executable scripts, event handlers, inline styles, active embeds, invalid JSON-LD,
and missing or incorrect script/stylesheet integrity hashes. Navigation links to
other sites are allowed. New embeds require an explicit policy and validator
review; do not loosen sources globally or add `unsafe-inline` / `unsafe-eval`.
The Chromium checks exercise both languages, search/filtering/theme/mobile menu,
no-JavaScript content and redirects, and verify actual CSP blocking. They serve
only the built snapshot in a fresh context and never contact the live site.

## Archive metadata

Press entries also have a `language` (`de`, `en` or `et`) and one or more
`topics` (`security`, `forensics`, `privacy`, `transparency`, `universities`).
Set `featured: true` for selected coverage. An optional ISO `date` must come
from verified publisher metadata; omit it when only the year is known. Filtering
runs locally, and the complete archive remains readable without JavaScript.
