const { test } = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');

function setup() {
    const entries = [
        { dataset: { topics: 'privacy forensics', language: 'en' }, textContent: 'Example: Phone forensics' },
        { dataset: { topics: 'privacy', language: 'de' }, textContent: 'Example: Datenschutz' },
        { dataset: { topics: 'universities', language: 'de' }, textContent: 'Other: University policy' }
    ];
    const groups = [entries.slice(0, 2), entries.slice(2)].map(items => ({
        querySelectorAll: () => items
    }));
    const handlers = {};
    const form = {
        hidden: true,
        elements: Object.fromEntries(['topic', 'language', 'query'].map(name => [name, { value: '' }])),
        addEventListener: (event, handler) => handlers[event] = handler
    };
    const status = { dataset: { count: '{count} entries', empty: 'No matches' } };
    const featured = {};
    const document = {
        querySelector: selector => selector === '[data-press-filters]' ? form : selector === '[data-press-status]' ? status : featured,
        querySelectorAll: selector => selector === '[data-press-entry]' ? entries : groups
    };
    vm.runInNewContext(fs.readFileSync('assets/js/press-filters.js', 'utf8'), { document });
    return { entries, groups, handlers, form, status, featured };
}

test('filters combine topic, language and case-insensitive words', () => {
    const s = setup();
    assert.equal(s.form.hidden, false);
    assert.equal(s.status.textContent, '3 entries');
    s.form.elements.topic.value = 'forensics';
    s.form.elements.language.value = 'en';
    s.form.elements.query.value = 'EXAMPLE phone';
    s.handlers.input();
    assert.deepEqual(s.entries.map(entry => entry.hidden), [false, true, true]);
    assert.equal(s.status.textContent, '1 entries');
    assert.equal(s.featured.hidden, true);
    assert.equal(s.groups[1].hidden, true);
});

test('no matches hide empty groups; reset restores all entries and featured links', () => {
    const s = setup();
    s.form.elements.query.value = 'nonexistent';
    s.handlers.input();
    assert.equal(s.status.textContent, 'No matches');
    assert.ok(s.groups.every(group => group.hidden));
    s.handlers.reset();
    assert.ok(s.entries.every(entry => !entry.hidden));
    assert.ok(s.groups.every(group => !group.hidden));
    assert.equal(s.featured.hidden, false);
    assert.equal(s.form.elements.query.value, '');
});

test('filter submission stays local', () => {
    const s = setup();
    let prevented = false;
    s.handlers.submit({ preventDefault: () => prevented = true });
    assert.equal(prevented, true);
});
