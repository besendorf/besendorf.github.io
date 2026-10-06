import * as params from '@params';

const input = document.getElementById('searchInput');
const results = document.getElementById('searchResults');
const status = document.getElementById('searchStatus');
let fuse;
const render = () => {
    results.replaceChildren();
    const query = input.value.trim();
    if (!query || !fuse) { status.textContent = ''; return; }
    const matches = fuse.search(query, { limit: 20 });
    for (const match of matches) {
        const item = document.createElement('li');
        item.className = 'post-entry';
        const link = document.createElement('a');
        link.href = match.item.permalink;
        link.textContent = match.item.title;
        link.lang = match.item.language;
        item.append(link);
        results.append(item);
    }
    status.textContent = matches.length ? input.dataset.count.replace('{count}', matches.length) : input.dataset.empty;
};
input.addEventListener('input', render);
fetch(input.dataset.index).then(response => {
    if (!response.ok) throw new Error('Search index unavailable');
    return response.json();
}).then(data => {
    const options = params.fuseOpts || {};
    fuse = new Fuse(data, {
        isCaseSensitive: false,
        shouldSort: true,
        ignoreLocation: true,
        threshold: options.threshold ?? 0.3,
        minMatchCharLength: options.minmatchcharlength ?? 2,
        keys: options.keys ?? ['title', 'summary', 'content']
    });
    render();
}).catch(() => { status.textContent = input.dataset.error; });
document.getElementById('searchbox').addEventListener('keydown', event => {
    const links = [...results.querySelectorAll('a')];
    const current = links.indexOf(document.activeElement);
    if (event.key === 'Escape') { input.value = ''; render(); input.focus(); }
    if (event.key === 'ArrowDown' && links.length) {
        event.preventDefault(); links[Math.min(current + 1, links.length - 1)].focus();
    }
    if (event.key === 'ArrowUp' && current >= 0) {
        event.preventDefault(); (current === 0 ? input : links[current - 1]).focus();
    }
});
