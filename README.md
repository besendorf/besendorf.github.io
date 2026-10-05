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
