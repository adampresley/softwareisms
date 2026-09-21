import test from 'node:test';
import assert from 'node:assert/strict';
import { catalog, search, randomIsm, validateCatalog } from '../src/catalog.js';
import { app } from '../src/app.js';

test('search supports aliases, punctuation, category, and all query words', () => {
  assert.equal(search("CONWAY'S LAW")[0].slug, 'conways-law');
  assert.equal(search('Ninety Ninety Law')[0].slug, 'ninety-ninety-rule');
  assert.equal(search('90/90')[0].slug, 'ninety-ninety-rule');
  assert.equal(search('organizations').length, 1);
  assert.equal(search('hyrum compatibility')[0].slug, 'hyrums-law');
  assert.equal(search('xyznonexistent').length, 0);
  assert.equal(search('  ').length, catalog.length);
  assert.ok(catalog.includes(randomIsm()));
});

test('catalog rejects duplicate slugs and unsafe reference URLs', () => {
  assert.throws(() => validateCatalog([catalog[0], catalog[0]]), /duplicate/);
  assert.throws(() => validateCatalog([{ ...catalog[0], references: [{ title: 'Unsafe', url: 'javascript:alert(1)' }] }]), /Invalid reference/);
});

test('HTTP routes render pages, escaped queries, pagination, assets, and errors', async () => {
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const home = await (await fetch(base)).text();
    assert.match(home, /featured-statement/);
    assert.equal((home.match(/class="ism-row"/g) || []).length, 6);
    const second = await (await fetch(`${base}/?page=2`)).text();
    assert.equal((second.match(/class="ism-row"/g) || []).length, 2);
    assert.match(second, /Previous page/);
    for (const ism of catalog) {
      const response = await fetch(`${base}/isms/${ism.slug}`);
      assert.equal(response.status, 200);
      assert.match(await response.text(), /Go to the source/);
    }
    const xss = await (await fetch(`${base}/?q=${encodeURIComponent('<script>alert(1)</script>')}`)).text();
    assert.ok(!xss.includes('<script>alert(1)</script>'));
    assert.match(xss, /No isms found/);
    assert.equal((await fetch(`${base}/isms/unknown`)).status, 404);
    assert.equal((await fetch(`${base}/?q=a&q=b&page=bad`)).status, 200);
    for (const asset of ['styles.css', 'app.js', 'htmx.min.js']) assert.equal((await fetch(`${base}/assets/${asset}`)).status, 200);
    assert.deepEqual(await (await fetch(`${base}/healthz`)).json(), { status: 'ok' });
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});
