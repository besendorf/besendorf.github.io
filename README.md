# besendorf.org
This is the repo for my private homepage. Feel free to send pull requests for typos.

## Press page

The German `/press/` and English `/en/press/` pages share the article list in
`data/press.yaml`, rendered by `layouts/shortcodes/press-list.html`.
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
```

CI checks both languages, local links and fragments, assets, metadata, XML,
archive completeness and email obfuscation. Search and filtering tests require
Node.js 18 or newer; the site itself has no npm dependencies.

German-only posts are published once in German. Their former English URLs
redirect to the originals, and the English blog index identifies them as German.
Email addresses must stay obfuscated in page content; do not add `mailto:` links,
email properties in structured data or scripts that reconstruct an address.

## Theme compatibility

WonderMod is pinned to `3b0ee00eb05135a162fdb83de65576b968bab4f0`, which was the
latest upstream `master` commit when checked on 6 October 2026. There was no
newer upstream theme version to update to. Compatibility and accessibility
fixes live in the project's `layouts/` and `assets/` overrides; the submodule
has no local modifications. Recheck these overrides when updating the theme.

## Archive metadata

Press entries also have a `language` (`de`, `en` or `et`) and one or more
`topics` (`security`, `forensics`, `privacy`, `transparency`, `universities`).
Set `featured: true` for selected coverage. An optional ISO `date` must come
from verified publisher metadata; omit it when only the year is known. Filtering
runs locally, and the complete archive remains readable without JavaScript.
