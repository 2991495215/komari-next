import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative, sep } from 'node:path';

const root = fileURLToPath(new URL('../../', import.meta.url));
const deployment = join(root, 'deploy/s3');
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
  entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)]);
const overrides = files(join(deployment, 'overrides'));
const metadata = JSON.parse(readFileSync(join(root, 'komari-theme.json'), 'utf8'));
assert.equal(metadata.name, 'ZINC Next');
assert.equal(metadata.version, '1.4.19');
for (const group of ['data', 'fields', 'items', 'managedFields', 'options']) {
  const fields = metadata.configuration[group];
  const layouts = fields.find(field => field.key === 'cardLayout').options;
  assert.ok((Array.isArray(layouts) ? layouts : layouts.split(',')).includes('compact'));
  for (const key of ['guestDisplay.showPrice', 'guestDisplay.showExpiredAt'])
    assert.ok(fields.some(field => field.key === key), `${group}: ${key}`);
}
for (const file of overrides.filter(file => file.endsWith('.js')))
  execFileSync(process.execPath, ['--check', file], { stdio: 'pipe' });
const proxy = readFileSync(join(deployment, 'openresty.conf'), 'utf8');
assert.ok(proxy.includes('/_zinc-brand.js?v=20260610b'));
console.log(`Local checks passed: metadata and ${overrides.length} override files.`);

if (process.argv.includes('--live')) {
  const expected = {};
  for (const file of overrides)
    expected['/opt/1panel/www/komari-overrides/' + relative(join(deployment, 'overrides'), file).split(sep).join('/')] = sha256(readFileSync(file));
  expected['/opt/1panel/www/conf.d/k.trent30.com.conf'] = sha256(readFileSync(join(deployment, 'openresty.conf')));
  expected['/opt/komari/data/theme/next/komari-theme.json'] = sha256(readFileSync(join(root, 'komari-theme.json')));
  const python = `import json,hashlib,pathlib
paths=json.loads(${JSON.stringify(JSON.stringify(Object.keys(expected)))})
print(json.dumps({p:hashlib.sha256(pathlib.Path(p).read_bytes()).hexdigest() for p in paths}))
`;
  const actual = JSON.parse(execFileSync('ssh', ['-o', 'BatchMode=yes', 's3', 'python3', '-'], { input: python, encoding: 'utf8', timeout: 30000 }));
  assert.deepEqual(actual, expected);
  const page = await fetch('https://k.zinc.run/', { signal: AbortSignal.timeout(15000) });
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.equal((html.match(/<script[^>]+src="[/]_zinc-brand[.]js[^"]*"/g) || []).length, 1);
  for (const file of overrides) {
    const path = relative(join(deployment, 'overrides'), file).split(sep).join('/');
    const response = await fetch('https://k.zinc.run/' + path, { signal: AbortSignal.timeout(15000) });
    assert.equal(response.status, 200, path);
    assert.equal(sha256(Buffer.from(await response.arrayBuffer())), sha256(readFileSync(file)), path);
  }
  console.log(`Live checks passed: ${Object.keys(expected).length} deployment hashes, HTML injection and ${overrides.length} public overrides.`);
}
