// Browser integration tests use a fresh context and serve only the built snapshot.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(process.argv[2] || 'public');
const origin = 'https://besendorf.org';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };

async function serve(context, failures, snapshotRoot = root, snapshotOrigin = origin) {
    await context.route('**/*', async route => {
        const url = new URL(route.request().url());
        if (url.origin !== snapshotOrigin) {
            failures.push(`Unexpected external request: ${url}`);
            return route.abort();
        }
        let file = path.resolve(snapshotRoot, '.' + decodeURIComponent(url.pathname));
        if (!file.startsWith(snapshotRoot + path.sep) && file !== snapshotRoot) return route.abort();
        if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
        if (!fs.existsSync(file)) {
            failures.push(`Missing resource: ${url.pathname}`);
            return route.fulfill({ status: 404, body: 'Not found' });
        }
        return route.fulfill({ path: file, contentType: types[path.extname(file)] || 'application/octet-stream' });
    });
}

(async () => {
    const browser = await chromium.launch({ headless: true, executablePath: process.env.BROWSER_EXECUTABLE_PATH || undefined });
    try {
        const failures = [];
        const context = await browser.newContext();
        await serve(context, failures);
        await context.addInitScript(() => {
            window.cspViolations = [];
            document.addEventListener('securitypolicyviolation', event => window.cspViolations.push(event.effectiveDirective));
        });
        const page = await context.newPage();
        page.on('pageerror', error => failures.push(error.message));

        for (const prefix of ['/', '/en/']) {
            await page.goto(origin + prefix);
            assert.equal(await page.locator('h1').count(), 1);
            const dark = await page.locator('body').evaluate(body => body.classList.contains('dark'));
            await page.locator('#theme-toggle').click();
            assert.notEqual(await page.locator('body').evaluate(body => body.classList.contains('dark')), dark);
            await page.reload();
            assert.notEqual(await page.locator('body').evaluate(body => body.classList.contains('dark')), dark);
            assert.deepEqual(await page.evaluate(() => window.cspViolations), []);

            await page.goto(origin + prefix + 'search/');
            const index = JSON.parse(fs.readFileSync(path.join(root, prefix, 'index.json'), 'utf8'));
            await page.locator('#searchInput').fill(index[0].title);
            await page.waitForFunction(() => document.querySelectorAll('#searchResults a').length > 0);
            await page.locator('#searchInput').press('ArrowDown');
            assert.equal(await page.locator('#searchResults a').first().evaluate(link => link === document.activeElement), true);
            await page.keyboard.press('Escape');
            assert.equal(await page.locator('#searchInput').inputValue(), '');
            assert.deepEqual(await page.evaluate(() => window.cspViolations), []);

            await page.goto(origin + prefix + 'press/');
            await page.locator('select[name="language"]').selectOption('en');
            const visible = page.locator('[data-press-entry]:visible');
            assert.ok(await visible.count() > 0);
            assert.ok((await visible.evaluateAll(entries => entries.map(entry => entry.dataset.language))).every(lang => lang === 'en'));
            await page.locator('button[type="reset"]').click();
            assert.equal(await visible.count(), 70);
            assert.deepEqual(await page.evaluate(() => window.cspViolations), []);
        }

        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(origin + '/');
        await page.locator('.mobile-navigation summary').click();
        assert.equal(await page.locator('.mobile-navigation').evaluate(menu => menu.open), true);
        assert.ok(await page.locator('.mobile-navigation a:visible').count() > 0);
        assert.deepEqual(await page.evaluate(() => window.cspViolations), []);

        // Actual enforcement: inline code, event handlers, styles and third-party
        // resources must be blocked by the page's policy, with no bypassCSP flag.
        await page.evaluate(() => {
            const script = document.createElement('script');
            script.textContent = 'window.inlineProbe = true';
            document.body.append(script);
            const button = document.createElement('button');
            button.setAttribute('onclick', 'window.eventProbe = true');
            document.body.append(button);
            button.click();
            const style = document.createElement('style');
            style.textContent = 'body { --csp-style-probe: allowed; }';
            document.head.append(style);
            const image = document.createElement('img');
            image.src = 'https://blocked.invalid/csp-probe.png';
            document.body.append(image);
        });
        await page.waitForFunction(() => window.cspViolations.length >= 4);
        assert.equal(await page.evaluate(() => Boolean(window.inlineProbe || window.eventProbe)), false);
        assert.equal(await page.evaluate(() => getComputedStyle(document.body).getPropertyValue('--csp-style-probe')), '');
        for (const directive of ['script-src-elem', 'script-src-attr', 'style-src-elem', 'img-src']) {
            assert.ok((await page.evaluate(() => window.cspViolations)).includes(directive), `Policy did not block ${directive}`);
        }

        const noJS = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
        await serve(noJS, failures);
        const plain = await noJS.newPage();
        await plain.goto(origin + '/');
        await plain.locator('.mobile-navigation summary').click();
        assert.ok(await plain.locator('.mobile-navigation a:visible').count() > 0);
        await plain.goto(origin + '/press/');
        assert.equal(await plain.locator('[data-press-entry]:visible').count(), 70);
        await plain.goto(origin + '/en/posts/vbrick/');
        await plain.waitForURL(origin + '/posts/vbrick/');
        assert.equal(await plain.locator('h1').count(), 1);

        // Exercise the theme itself, without the site's search/header overrides.
        const theme = path.resolve(__dirname, '../themes/WonderMod');
        const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'wondermod-browser-'));
        try {
            execFileSync(process.env.HUGO_BIN || 'hugo', [
                '--source', path.join(theme, 'tests/fixture'), '--themesDir', path.dirname(theme),
                '--theme', path.basename(theme), '--destination', fixture, '--minify', '--panicOnWarning'
            ]);
            const themeContext = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
            await serve(themeContext, failures, fixture, 'https://example.org');
            const themed = await themeContext.newPage();
            themed.on('pageerror', error => failures.push(error.message));
            await themed.goto('https://example.org/posts/example/');
            assert.equal(await themed.locator('.copy-code').count(), 1, 'Line numbers must not get a copy button');
            await themed.locator('.copy-code').click();
            await themed.waitForFunction(() => document.querySelector('.copy-code').textContent.includes('copied'));
            assert.equal(await themed.evaluate(() => navigator.clipboard.readText()), "print('copy this')\n");
            await themed.goto('https://example.org/search/');
            await themed.locator('#searchInput').fill('quoted');
            await themed.waitForFunction(() => document.querySelectorAll('#searchResults a').length > 0);
            assert.equal(await themed.locator('#searchResults script').count(), 0);
            assert.ok((await themed.locator('#searchResults').innerText()).includes('</script><script>alert(1)</script>'));
            await themeContext.close();

            const blockedStorage = await browser.newContext();
            await serve(blockedStorage, failures, fixture, 'https://example.org');
            await blockedStorage.addInitScript(() => Object.defineProperty(window, 'localStorage', {
                get() { throw new Error('Storage unavailable'); }
            }));
            const storagePage = await blockedStorage.newPage();
            storagePage.on('pageerror', error => failures.push(error.message));
            await storagePage.goto('https://example.org/');
            await storagePage.locator('#theme-toggle').click();
            await blockedStorage.close();
        } finally {
            fs.rmSync(fixture, { recursive: true, force: true });
        }
        assert.deepEqual(failures, []);
        console.log('Browser checks passed: both languages, search, filters, theme, mobile menu, no-JS navigation, redirects, CSP enforcement, safe theme search, code copying and blocked-storage fallback.');
        await context.close();
        await noJS.close();
    } finally {
        await browser.close();
    }
})().catch(error => { console.error(error); process.exit(1); });
