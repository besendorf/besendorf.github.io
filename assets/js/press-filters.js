const form = document.querySelector('[data-press-filters]');
if (form) {
    const entries = [...document.querySelectorAll('[data-press-entry]')];
    const status = document.querySelector('[data-press-status]');
    const featured = document.querySelector('[data-press-featured]');
    const update = () => {
        const topic = form.elements.topic.value;
        const language = form.elements.language.value;
        const words = form.elements.query.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
        let count = 0;
        for (const entry of entries) {
            const match = (!topic || entry.dataset.topics.split(' ').includes(topic))
                && (!language || entry.dataset.language === language)
                && words.every(word => entry.textContent.toLocaleLowerCase().includes(word));
            entry.hidden = !match;
            if (match) count++;
        }
        for (const group of document.querySelectorAll('[data-press-year], [data-press-section]')) {
            group.hidden = ![...group.querySelectorAll('[data-press-entry]')].some(entry => !entry.hidden);
        }
        featured.hidden = Boolean(topic || language || words.length);
        status.textContent = count ? status.dataset.count.replace('{count}', count) : status.dataset.empty;
    };
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('reset', () => {
        form.elements.topic.value = '';
        form.elements.language.value = '';
        form.elements.query.value = '';
        update();
    });
    update();
}
