const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup(fail = false) {
    const handlers = {};
    const input = {
        value: '', dataset: { index: '/en/index.json', count: '{count} results', empty: 'No matches', error: 'Load failed' },
        addEventListener: (event, handler) => handlers[event] = handler,
        focus: () => document.activeElement = input
    };
    const results = {
        children: [], replaceChildren() { this.children = []; }, append(node) { this.children.push(node); },
        querySelectorAll() { return this.children.map(node => node.children[0]); }
    };
    const status = {};
    const document = {
        activeElement: input,
        getElementById: id => ({ searchInput: input, searchResults: results, searchStatus: status, searchbox: { addEventListener: (event, handler) => handlers[event] = handler } })[id],
        createElement: () => ({ children: [], append(node) { this.children.push(node); }, focus() { document.activeElement = this; } })
    };
    let resolve;
    const loading = new Promise(done => resolve = done);
    const requests = [];
    class Fuse {
        constructor(data) { this.data = data; }
        search(query) { return this.data.filter(item => item.title.includes(query)).map(item => ({ item })); }
    }
    const source = fs.readFileSync('assets/js/fastsearch.js', 'utf8').replace("import * as params from '@params';", '');
    vm.runInNewContext(source, { document, params: {}, Fuse, fetch: url => {
        requests.push(url);
        return loading.then(() => fail ? { ok: false } : { ok: true, json: async () => [{ title: 'Phone <img onerror=alert(1)>', permalink: '/posts/phone/', language: 'de' }] });
    } });
    return { input, results, status, handlers, document, requests, loaded: async () => { resolve(); await new Promise(done => setImmediate(done)); } };
}

test('a pasted query entered before index loading is rendered safely', async () => {
    const s = setup();
    s.input.value = 'Phone';
    s.handlers.input();
    await s.loaded();
    assert.deepEqual(s.requests, ['/en/index.json']);
    const link = s.results.children[0].children[0];
    assert.equal(link.textContent, 'Phone <img onerror=alert(1)>');
    assert.equal(link.innerHTML, undefined);
    assert.equal(link.lang, 'de');
    assert.equal(link.href, '/posts/phone/');
    assert.equal(s.status.textContent, '1 results');
});

test('keyboard navigation and clearing work after search', async () => {
    const s = setup();
    await s.loaded();
    s.input.value = 'Phone'; s.handlers.input();
    let prevented = false;
    s.handlers.keydown({ key: 'ArrowDown', preventDefault: () => prevented = true });
    assert.equal(prevented, true);
    assert.equal(s.document.activeElement, s.results.children[0].children[0]);
    s.handlers.keydown({ key: 'ArrowUp', preventDefault() {} });
    assert.equal(s.document.activeElement, s.input);
    s.handlers.keydown({ key: 'Escape' });
    assert.equal(s.input.value, '');
    assert.equal(s.results.children.length, 0);
});

test('load failures show an understandable status', async () => {
    const s = setup(true); await s.loaded();
    assert.equal(s.status.textContent, 'Load failed');
});
